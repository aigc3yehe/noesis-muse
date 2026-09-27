import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { ORIGIN, identity, controller, scopesFor, validateChallenge, validateSession, requireValue } from './security.mjs';

const ROOT = new URL('./', import.meta.url);
const STATIC = new Map([
  ['/', ['web/index.html', 'text/html']],
  ['/app.mjs', ['web/app.mjs', 'text/javascript']],
  ['/style.css', ['web/style.css', 'text/css']],
  ['/security.mjs', ['security.mjs', 'text/javascript']]
]);
const MAX_BYTES = 128 * 1024;
async function readBounded(stream, max) {
  const chunks = []; let size = 0;
  for await (const chunk of stream) {
    size += chunk.length;
    requireValue(size <= max, 'RESPONSE_TOO_LARGE'); chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}
export function createHelper({ fetchImpl = fetch, clock = Date.now } = {}) {
  const csrf = randomBytes(32).toString('hex');
  let pending, session, busy = false, lastAction = -Infinity, protocolCache;
  async function upstream(path, method = 'GET', body, token) {
    const headers = { accept: 'application/json' };
    if (body !== undefined) headers['content-type'] = 'application/json';
    if (token) headers.authorization = 'Bearer ' + token;
    const response = await fetchImpl(ORIGIN + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), redirect: 'error', signal: AbortSignal.timeout(15000) });
    const raw = await readBounded(response.body, MAX_BYTES);
    let data; try { data = JSON.parse(raw); } catch { data = null; }
    if (!response.ok) {
      const code = typeof data?.error?.code === 'string' && /^[A-Z0-9_]{1,80}$/.test(data.error.code) ? data.error.code : 'UPSTREAM_HTTP_' + response.status;
      const error = new Error(code); error.status = response.status;
      const retry = response.headers.get('retry-after');
      if (retry && /^\d{1,6}$/.test(retry)) error.retryAfter = retry;
      throw error;
    }
    requireValue(data && typeof data === 'object', 'INVALID_JSON_RESPONSE');
    return data;
  }
  async function protocol() {
    if (!protocolCache || protocolCache.until <= clock()) {
      const value = await upstream('/v1/agent-api/protocol'); scopesFor(value);
      protocolCache = { value, until: clock() + 300000 };
    }
    return protocolCache.value;
  }
  const server = createServer(async (req, res) => {
    const origin = `http://127.0.0.1:${server.address().port}`;
    const send = (status, data) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(data)); };
    res.setHeader('cache-control', 'no-store');
    res.setHeader('x-content-type-options', 'nosniff');
    res.setHeader('referrer-policy', 'no-referrer');
    res.setHeader('content-security-policy', "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
    try {
      requireValue(req.headers.host === new URL(origin).host, 'INVALID_HOST');
      requireValue(!req.headers.origin || req.headers.origin === origin, 'CROSS_ORIGIN_DENIED');
      requireValue(!req.headers['sec-fetch-site'] || ['same-origin','none'].includes(req.headers['sec-fetch-site']), 'CROSS_ORIGIN_DENIED');
      if (req.method === 'GET' && STATIC.has(req.url)) {
        const [path, type] = STATIC.get(req.url);
        res.writeHead(200, { 'content-type': type + '; charset=utf-8' }); res.end(await readFile(new URL(path, ROOT))); return;
      }
      if (req.method === 'GET' && req.url === '/local/config') { send(200, { csrf, serviceOrigin: ORIGIN }); return; }
      requireValue(req.method === 'POST' && ['/local/prepare','/local/complete','/local/logout'].includes(req.url), 'ROUTE_NOT_ALLOWED');
      requireValue(req.headers.origin === origin && req.headers['x-noesis-csrf'] === csrf && req.headers['content-type'] === 'application/json', 'REQUEST_DENIED');
      requireValue(!busy, 'REQUEST_IN_PROGRESS');
      requireValue(clock() - lastAction >= 2100, 'WAIT_BEFORE_NEXT_REQUEST');
      busy = true; lastAction = clock();
      try {
        let body; try { body = JSON.parse(await readBounded(req, 20000)); } catch { throw new Error('INVALID_BODY'); }
        requireValue(body && !Array.isArray(body) && typeof body === 'object', 'INVALID_BODY');
        if (session && Date.parse(session.expiresAt) <= clock()) session = undefined;
        if (req.url === '/local/prepare') {
          requireValue(Object.keys(body).sort().join(',') === 'agentId,controller,kind' && ['research','enroll'].includes(body.kind), 'INVALID_BODY');
          requireValue(!session, 'REVOKE_EXISTING_SESSION_FIRST'); pending = undefined;
          const expected = { kind: body.kind, identity: identity(body.agentId), controller: controller(body.controller), scopes: scopesFor(await protocol()) };
          const enrollment = body.kind === 'enroll';
          const value = await upstream(enrollment ? '/v1/identity/agent/challenge' : '/v1/agent-api/auth/challenge', 'POST', enrollment ? { identity: expected.identity, action: 'enroll', payload: {} } : { identity: expected.identity });
          validateChallenge(value, expected, clock()); pending = { value, expected };
          send(200, { challenge: value, expected }); return;
        }
        if (req.url === '/local/complete') {
          requireValue(Object.keys(body).sort().join(',') === 'challengeId,signature' && typeof body.signature === 'string' && /^0x(?:[0-9a-fA-F]{2}){1,8192}$/.test(body.signature), 'INVALID_BODY');
          requireValue(pending && body.challengeId === pending.value.challengeId, 'NO_PENDING_CHALLENGE');
          validateChallenge(pending.value, pending.expected, clock());
          const current = pending; pending = undefined; // No automatic replay after an uncertain result.
          if (current.expected.kind === 'enroll') {
            await upstream('/v1/identity/agent/execute', 'POST', body);
            send(200, { enrolled: true }); return;
          }
          const result = await upstream('/v1/agent-api/auth/session', 'POST', body);
          session = validateSession(result, current.expected, clock());
          send(200, { accessToken: session.accessToken, expiresAt: session.expiresAt, identity: session.identity, scopes: session.scopes }); return;
        }
        requireValue(Object.keys(body).length === 0, 'INVALID_BODY');
        pending = undefined;
        if (session) {
          try { await upstream('/v1/agent-api/auth/session', 'DELETE', undefined, session.accessToken); }
          catch (error) { if (error.status !== 401) throw error; }
          session = undefined;
        }
        send(200, { revoked: true });
      } finally { busy = false; }
    } catch (error) {
      if (res.headersSent) { res.destroy(); return; }
      const known = typeof error.message === 'string' && /^[A-Z0-9_]{1,80}$/.test(error.message) ? error.message : 'REQUEST_FAILED';
      const status = Number.isInteger(error.status) && error.status >= 400 && error.status <= 599 ? error.status : 400;
      if (error.retryAfter) res.setHeader('retry-after', error.retryAfter);
      send(status, { error: { code: known } });
    }
  });
  server.requestTimeout = 20000; server.headersTimeout = 10000;
  return server;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createHelper();
  server.listen(0, '127.0.0.1', () => {
    console.log(`Open http://127.0.0.1:${server.address().port} in your wallet-enabled browser.`);
    console.log('Local authorization only. No database, trading, background jobs or credentials on disk.');
    console.log('Use Revoke before closing. Otherwise the credential expires on the server within 15 minutes.');
  });
  for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => { server.close(); server.closeAllConnections(); });
}
