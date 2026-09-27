// Shared by the browser and the local authorization helper. No dependencies.
export const ORIGIN = 'https://noesis.run';
export const CHAIN = 4663;
export const REGISTRY = '0x8004a169fb4a3325136eb29fa0ceb6d2e539a432';
export const PREFIX = 'NOESIS | Read research data | v1\n';
const fields = ['version','origin','action','identity','controller','scopes','challengeId','nonce','blockNumber','blockHash','issuedAt','expiresAt','sessionSeconds'];
const enrollmentFields = ['version','origin','action','requestId','identity','controller','blockNumber','blockHash','payload','nonce','issuedAt','expiresAt'];
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export function requireValue(ok, code = 'UNSAFE_RESPONSE') { if (!ok) throw new Error(code); }
export function identity(agentId) {
  requireValue(typeof agentId === 'string' && /^(0|[1-9][0-9]{0,77})$/.test(agentId) && BigInt(agentId) < 2n ** 256n, 'INVALID_AGENT_ID');
  return { chainId: CHAIN, registry: REGISTRY, agentId };
}
export function controller(value) {
  requireValue(typeof value === 'string' && /^0x[0-9a-fA-F]{40}$/.test(value), 'INVALID_WALLET');
  return value.toLowerCase();
}
export function scopesFor(protocol) {
  requireValue(protocol.version === 'noesis-research-api-v1' && protocol.origin === ORIGIN && protocol.network?.chainId === CHAIN && protocol.network?.registry?.toLowerCase() === REGISTRY, 'UNSUPPORTED_PROTOCOL');
  requireValue(protocol.authentication?.challengeSeconds === 300 && protocol.authentication?.sessionSeconds === 900 && protocol.authentication?.prefix === PREFIX, 'UNSUPPORTED_PROTOCOL');
  return ['macro:read', 'theses:read', ...(protocol.data?.marketData?.configured === true ? ['market-data:read'] : []), ...(protocol.data?.signals?.configured === true ? ['signals:read'] : [])];
}
export function validateChallenge(response, expected, now = Date.now()) {
  const p = response?.signingPayload;
  const enroll = expected.kind === 'enroll';
  requireValue(p && equal(Object.keys(p), enroll ? enrollmentFields : fields));
  requireValue(p.version === (enroll ? 'noesis-identity-v1' : 'noesis-research-api-v1') && p.origin === ORIGIN && p.action === (enroll ? 'enroll' : 'read_research'));
  requireValue(equal(p.identity, expected.identity) && controller(p.controller) === controller(expected.controller));
  requireValue(typeof response.challengeId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(response.challengeId));
  requireValue((enroll ? p.requestId : p.challengeId) === response.challengeId);
  const issued = Date.parse(p.issuedAt), expires = Date.parse(p.expiresAt);
  requireValue(Number.isFinite(issued) && Number.isFinite(expires) && issued <= now + 30000 && issued > now - (enroll ? 630000 : 330000) && expires > now && expires > issued && expires <= issued + (enroll ? 600000 : 300000) && response.expiresAt === p.expiresAt);
  requireValue(typeof p.nonce === 'string' && p.nonce.length >= 16 && p.nonce.length <= 256 && typeof p.blockNumber === 'string' && /^\d+$/.test(p.blockNumber) && /^0x[0-9a-f]{64}$/i.test(p.blockHash));
  if (enroll) requireValue(equal(p.payload, {}));
  else requireValue(equal(p.scopes, expected.scopes) && p.sessionSeconds === 900);
  requireValue(response.message === (enroll ? 'NOESIS | ERC-8004 advisor action | v1\n' : PREFIX) + JSON.stringify(p));
  return response;
}
export function validateSession(response, expected, now = Date.now()) {
  requireValue(response?.tokenType === 'Bearer' && typeof response.accessToken === 'string' && /^[a-f0-9]{64}$/.test(response.accessToken), 'INVALID_SESSION');
  requireValue(equal(response.identity, expected.identity) && equal(response.scopes, expected.scopes), 'INVALID_SESSION');
  const expires = Date.parse(response.expiresAt);
  requireValue(expires > now && expires <= now + 901000, 'INVALID_SESSION');
  return response;
}
