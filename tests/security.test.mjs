import test from 'node:test';
import assert from 'node:assert/strict';
import { identity, controller, ORIGIN, PREFIX, REGISTRY, scopesFor, validateChallenge, validateSession } from '../helper/security.mjs';
const now = Date.parse('2030-01-01T00:00:00Z');
const owner = '0x' + '1'.repeat(40);
function fixture(kind = 'research') {
  const expected = {kind,identity:identity('7'),controller:owner,scopes:['macro:read','theses:read','market-data:read','signals:read']};
  const challengeId = '00000000-0000-4000-8000-000000000001';
  const common = {nonce:'synthetic-test-nonce',blockNumber:'100',blockHash:'0x'+'a'.repeat(64),issuedAt:new Date(now).toISOString(),expiresAt:new Date(now+300000).toISOString()};
  const signingPayload = kind==='research' ? {version:'noesis-research-api-v1',origin:ORIGIN,action:'read_research',identity:expected.identity,controller:owner,scopes:expected.scopes,challengeId,...common,sessionSeconds:900} : {version:'noesis-identity-v1',origin:ORIGIN,action:'enroll',requestId:challengeId,identity:expected.identity,controller:owner,blockNumber:common.blockNumber,blockHash:common.blockHash,payload:{},nonce:common.nonce,issuedAt:common.issuedAt,expiresAt:common.expiresAt};
  return {expected,response:{challengeId,signingPayload,message:(kind==='research'?PREFIX:'NOESIS | ERC-8004 advisor action | v1\n')+JSON.stringify(signingPayload),expiresAt:common.expiresAt}};
}
export { fixture, now, owner };
test('identity validates canonical uint256 and lowercases a holder address',()=>{
  assert.equal(identity('0').agentId,'0');
  for(const value of ['01','-1','1.0','',String(2n**256n),7]) assert.throws(()=>identity(value));
  assert.equal(controller('0x'+'A'.repeat(40)),'0x'+'a'.repeat(40));
});
test('only reviewed protocol, fixed origin and known capability scopes',()=>{
  const p={version:'noesis-research-api-v1',origin:ORIGIN,network:{chainId:4663,registry:REGISTRY},authentication:{challengeSeconds:300,sessionSeconds:900,prefix:PREFIX},data:{marketData:{configured:true},signals:{configured:true}}};
  assert.equal(scopesFor(p).length,4);
  for(const override of [{origin:'https://example.invalid'},{version:'v2'},{authentication:{...p.authentication,sessionSeconds:86400}}]) assert.throws(()=>scopesFor({...p,...override}));
});
test('research and enrollment exact messages pass without signing anything',()=>{
  for(const kind of ['research','enroll']) {const {expected,response}=fixture(kind);assert.equal(validateChallenge(response,expected,now),response);}
});
test('tampered payload, permissions, identity and times fail even with a reconstructed message',()=>{
  const mutations = [p=>p.origin='https://example.invalid',p=>p.controller='0x'+'2'.repeat(40),p=>p.identity.agentId='8',p=>p.scopes.push('funds:write'),p=>p.sessionSeconds=86400,p=>p.extra='unexpected',p=>p.expiresAt=new Date(now-1).toISOString(),p=>p.issuedAt=new Date(now+60000).toISOString(),p=>p.blockHash='0x00',p=>p.nonce='short'];
  for(const mutate of mutations) { const {expected,response}=fixture(); response.signingPayload=structuredClone(response.signingPayload); mutate(response.signingPayload);response.message=PREFIX+JSON.stringify(response.signingPayload); assert.throws(()=>validateChallenge(response,expected,now)); }
});
test('whitespace and key-order changes are rejected',()=>{
  const {expected,response}=fixture();response.message+='\n';assert.throws(()=>validateChallenge(response,expected,now));
  response.signingPayload=Object.fromEntries(Object.entries(response.signingPayload).reverse());response.message=PREFIX+JSON.stringify(response.signingPayload);assert.throws(()=>validateChallenge(response,expected,now));
});
test('enrollment cannot be repurposed as binding',()=>{
  const {expected,response}=fixture('enroll');response.signingPayload.action='request_binding';response.message='NOESIS | ERC-8004 advisor action | v1\n'+JSON.stringify(response.signingPayload);assert.throws(()=>validateChallenge(response,expected,now));
});
test('session must match expected identity, scopes, lifetime and token format',()=>{
  const {expected}=fixture(); const session={tokenType:'Bearer',accessToken:'b'.repeat(64),identity:expected.identity,scopes:expected.scopes,expiresAt:new Date(now+900000).toISOString()};
  assert.equal(validateSession(session,expected,now),session);
  for(const override of [{tokenType:'Basic'},{accessToken:'not-a-token'},{scopes:['admin']},{identity:identity('8')},{expiresAt:new Date(now+86400000).toISOString()}]) assert.throws(()=>validateSession({...session,...override},expected,now));
});
