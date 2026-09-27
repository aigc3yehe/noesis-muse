import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=async name=>JSON.parse(await readFile(new URL(name,root),'utf8'));
test('all public research paths advertised by the saved protocol are documented',async()=>{
  const protocol=await read('api/research-protocol.json'),spec=await read('openapi.json');
  for(const endpoint of protocol.endpoints.marketData)assert(spec.paths[endpoint.path]?.get,endpoint.path);
  for(const path of ['/v1/agent-api/signals','/v1/agent-api/theses','/v1/agent-api/macro/latest','/v1/agent-api/macro/{id}'])assert(spec.paths[path]?.get);
});
test('research import has no publication or identity mutation and preserves auth boundaries',async()=>{
  const spec=await read('openapi.json');let count=0;
  for(const [path,methods]of Object.entries(spec.paths))for(const [method,operation]of Object.entries(methods)){
    count++;assert(['get','delete'].includes(method));
    if(path.startsWith('/v1/agent-api/')&&!path.endsWith('/protocol'))assert.deepEqual(operation.security,[{researchBearer:[]}]);
    else assert.deepEqual(operation.security,[]);
  }
  assert.equal(count,29);
});
test('signal maximum, date pairing guidance and parameter constraints are explicit',async()=>{
  const catalog=await read('api/catalog.json');
  assert.equal(catalog.find(x=>x.name==='signals').parameters.properties.hours.maximum,12);
  assert.equal(catalog.find(x=>x.name==='signals').parameters.properties.limit.maximum,100);
  assert.equal(catalog.find(x=>x.name==='instruments').parameters.properties.offset.maximum,100000);
  const reference=await readFile(new URL('docs/api-reference.md',root),'utf8');assert.match(reference,/Supply both `start` and `end`/);assert.match(reference,/Score|Scores/);
});
test('separate authentication and participation specs contain exact public request schemas',async()=>{
  const auth=await read('api/authentication.openapi.json'),participation=await read('api/participation.openapi.json');
  assert.equal(Object.keys(auth.paths).length,2);assert.equal(Object.keys(participation.paths).length,4);
  const schema=auth.paths['/v1/agent-api/auth/session'].post.requestBody.content['application/json'].schema;
  assert.deepEqual(schema.required,['challengeId','signature']);assert.equal(schema.additionalProperties,false);
});
