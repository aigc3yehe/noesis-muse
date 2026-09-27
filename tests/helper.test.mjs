import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { request } from 'node:http';
import { createHelper } from '../helper/server.mjs';
import { ORIGIN, PREFIX, REGISTRY } from '../helper/security.mjs';

const owner='0x'+'1'.repeat(40), start=Date.parse('2030-01-01T00:00:00Z');
async function setup(t, override) {
  let now=start; const calls=[];
  const protocol={version:'noesis-research-api-v1',origin:ORIGIN,network:{chainId:4663,registry:REGISTRY},authentication:{challengeSeconds:300,sessionSeconds:900,prefix:PREFIX},data:{marketData:{configured:true},signals:{configured:true}}};
  const nft={chainId:4663,registry:REGISTRY,agentId:'7'}, scopes=['macro:read','theses:read','market-data:read','signals:read'];
  const fetchImpl=async(url, options)=>{
    calls.push({url,options});
    if(override) {const response=override(url,options);if(response)return response;}
    if(url.endsWith('/protocol'))return Response.json(protocol);
    if(url.endsWith('/challenge')) {
      const enroll=url.includes('/identity/');const challengeId='00000000-0000-4000-8000-000000000001';
      const payload=enroll?{version:'noesis-identity-v1',origin:ORIGIN,action:'enroll',requestId:challengeId,identity:nft,controller:owner,blockNumber:'100',blockHash:'0x'+'a'.repeat(64),payload:{},nonce:'synthetic-helper-nonce',issuedAt:new Date(now).toISOString(),expiresAt:new Date(now+600000).toISOString()}:{version:'noesis-research-api-v1',origin:ORIGIN,action:'read_research',identity:nft,controller:owner,scopes,challengeId,nonce:'synthetic-helper-nonce',blockNumber:'100',blockHash:'0x'+'a'.repeat(64),issuedAt:new Date(now).toISOString(),expiresAt:new Date(now+300000).toISOString(),sessionSeconds:900};
      return Response.json({challengeId,signingPayload:payload,message:(enroll?'NOESIS | ERC-8004 advisor action | v1\n':PREFIX)+JSON.stringify(payload),expiresAt:payload.expiresAt});
    }
    if(options.method==='DELETE')return Response.json({revoked:true});
    if(url.endsWith('/execute'))return Response.json({advisor:{}});
    return Response.json({tokenType:'Bearer',accessToken:'b'.repeat(64),identity:nft,scopes,expiresAt:new Date(now+900000).toISOString()});
  };
  const server=createHelper({fetchImpl,clock:()=>now});server.listen(0,'127.0.0.1');await once(server,'listening');
  t.after(()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();}));
  const base=`http://127.0.0.1:${server.address().port}`;
  const config=await (await fetch(base+'/local/config')).json();
  async function post(path,body,headers={}) {now+=2200;return fetch(base+path,{method:'POST',headers:{origin:base,'x-noesis-csrf':config.csrf,'content-type':'application/json',...headers},body:JSON.stringify(body)});}
  return {base,calls,post,advance:ms=>now+=ms};
}
test('static page is local, no-store and frame protected; GET makes no upstream call',async t=>{
  const s=await setup(t);const r=await fetch(s.base+'/');assert.equal(r.status,200);assert.match(await r.text(),/Your NFT/);assert.equal(r.headers.get('cache-control'),'no-store');assert.match(r.headers.get('content-security-policy'),/frame-ancestors 'none'/);assert.equal(s.calls.length,0);
});
test('cross-origin, missing CSRF, arbitrary paths and extra body fields never reach upstream',async t=>{
  const s=await setup(t);const body={kind:'research',agentId:'7',controller:owner};
  for(const headers of [{origin:'https://example.invalid'},{'x-noesis-csrf':''}])assert.equal((await s.post('/local/prepare',body,headers)).status,400);
  const badHost=await new Promise((resolve,reject)=>{const req=request(s.base+'/local/config',{headers:{host:'example.invalid'}},res=>{res.resume();resolve(res.statusCode);});req.on('error',reject);req.end();});
  assert.equal(badHost,400);
  assert.equal((await s.post('/local/proxy',{url:'https://example.invalid'})).status,400);
  assert.equal((await s.post('/local/prepare',{...body,url:'https://example.invalid'})).status,400);
  assert.equal(s.calls.length,0);
});
test('complete fake research flow, one-time exchange and explicit revoke use only fixed endpoints',async t=>{
  const s=await setup(t);const p=await (await s.post('/local/prepare',{kind:'research',agentId:'7',controller:owner})).json();assert.equal(p.challenge.signingPayload.action,'read_research');
  const body={challengeId:p.challenge.challengeId,signature:'0x'+'a'.repeat(130)};
  const result=await (await s.post('/local/complete',body)).json();assert.equal(result.accessToken,'b'.repeat(64));
  assert.equal((await s.post('/local/complete',body)).status,400);
  assert.equal((await s.post('/local/prepare',{kind:'research',agentId:'7',controller:owner})).status,400);
  assert.equal((await s.post('/local/logout',{})).status,200);
  assert.equal(s.calls.length,4);assert(s.calls.every(x=>x.url.startsWith(ORIGIN+'/v1/')));assert(s.calls.every(x=>x.options.redirect==='error'));
  assert.equal(s.calls.at(-1).options.method,'DELETE');
});
test('enrollment is explicit and only accepts the enrollment action',async t=>{
  const s=await setup(t);assert.equal((await s.post('/local/prepare',{kind:'request_binding',agentId:'7',controller:owner})).status,400);
  const p=await (await s.post('/local/prepare',{kind:'enroll',agentId:'7',controller:owner})).json();
  const r=await (await s.post('/local/complete',{challengeId:p.challenge.challengeId,signature:'0x'+'a'.repeat(130)})).json();assert.equal(r.enrolled,true);assert(s.calls.at(-1).url.endsWith('/identity/agent/execute'));
});
test('uncertain session exchange consumes local pending proof instead of replaying it',async t=>{
  const s=await setup(t,(url,opt)=>{if(url.endsWith('/auth/session')&&opt.method==='POST')throw new Error('arbitrary private diagnostic');});
  const p=await (await s.post('/local/prepare',{kind:'research',agentId:'7',controller:owner})).json();const body={challengeId:p.challenge.challengeId,signature:'0x'+'a'.repeat(130)};
  const r=await s.post('/local/complete',body);assert.equal((await r.json()).error.code,'REQUEST_FAILED');
  const count=s.calls.length;assert.equal((await s.post('/local/complete',body)).status,400);assert.equal(s.calls.length,count);
});
test('non-JSON upstream errors preserve status and Retry-After without disclosing HTML',async t=>{
  const s=await setup(t,()=>new Response('<html>private diagnostic</html>',{status:429,headers:{'retry-after':'60'}}));
  const r=await s.post('/local/prepare',{kind:'research',agentId:'7',controller:owner});assert.equal(r.status,429);assert.equal(r.headers.get('retry-after'),'60');assert.deepEqual(await r.json(),{error:{code:'UPSTREAM_HTTP_429'}});
});
test('oversized upstream data is rejected',async t=>{
  const s=await setup(t,()=>new Response('x'.repeat(140000)));const r=await s.post('/local/prepare',{kind:'research',agentId:'7',controller:owner});assert.equal((await r.json()).error.code,'RESPONSE_TOO_LARGE');
});
test('failed revoke retains session for another explicit attempt',async t=>{
  let reject=true;const s=await setup(t,(url,opt)=>{if(opt.method==='DELETE'&&reject)return Response.json({error:{code:'API_UNAVAILABLE'}},{status:503});});
  const p=await (await s.post('/local/prepare',{kind:'research',agentId:'7',controller:owner})).json();await s.post('/local/complete',{challengeId:p.challenge.challengeId,signature:'0x'+'a'.repeat(130)});
  assert.equal((await s.post('/local/logout',{})).status,503);reject=false;assert.equal((await s.post('/local/logout',{})).status,200);assert.equal(s.calls.filter(x=>x.options.method==='DELETE').length,2);
});
