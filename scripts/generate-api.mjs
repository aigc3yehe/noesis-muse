import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = async name => JSON.parse(await readFile(new URL(name, root), 'utf8'));
const catalog = await read('api/catalog.json');
const research = await read('api/research-protocol.json');
const identity = await read('api/identity-protocol.json');
const theses = await read('api/theses-protocol.json');
function clean(schema) {
  if (Array.isArray(schema)) return schema.map(clean);
  if (schema && typeof schema === 'object') return Object.fromEntries(Object.entries(schema).filter(([k]) => k !== '$schema').map(([k,v]) => [k,clean(v)]));
  return schema;
}
const responses = {
  '200': { description: 'Saved data or operation receipt. Preserve returned timestamps, units, gaps, cursor and quality fields. Response shapes vary by operation; do not assume an items envelope.', content:{'application/json':{schema:{type:'object',additionalProperties:true}}}},
  default:{description:'Failure; inspect HTTP status, error.code and Retry-After. No automatic retries.',headers:{'Retry-After':{schema:{type:'string'}}},content:{'application/json':{schema:{type:'object',properties:{error:{type:'object',properties:{code:{type:'string'},message:{type:'string'}}}}}}}}
};
function spec(title) { return {openapi:'3.1.0',info:{title,version:'0.1.0',description:'Independent NOESIS integration. Not a Meta-issued manifest or an approved directory listing. Public API origin only. No trading or private account access.'},servers:[{url:'https://noesis.run'}],paths:{},components:{securitySchemes:{researchBearer:{type:'http',scheme:'bearer',bearerFormat:'Short-lived NFT-authorized research token'}}}}; }
const api = spec('NOESIS research for Muse');
for (const item of catalog) {
  const params = Object.entries(item.parameters.properties).map(([name,schema]) => ({name,in:item.path.includes('{'+name+'}')?'path':'query',required:(item.parameters.required??[]).includes(name),schema:clean(schema)}));
  api.paths[item.path] = {get:{operationId:item.name,summary:item.description,description:`Required scope: ${item.scope}. Discover IDs from the directory; never guess identifiers. Read docs/api-reference.md for response shapes and pagination.`,parameters:params,security:item.scope==='public'?[]:[{researchBearer:[]}],responses}};
}
for (const [name,path] of Object.entries({research_protocol:'/v1/agent-api/protocol',identity_protocol:'/v1/identity/protocol',theses_protocol:'/v1/theses/protocol'})) api.paths[path]={get:{operationId:name,summary:'Read the current public protocol before using this capability.',security:[],responses}};
api.paths['/v1/agent-api/auth/session']={delete:{operationId:'logout',summary:'Revoke the current research credential when the user disconnects.',security:[{researchBearer:[]}],responses}};
const auth = spec('NOESIS wallet authentication reference');
const participation = spec('NOESIS optional signed participation reference');
function post(target,path,operationId,summary,schema) { target.paths[path]={post:{operationId,summary,security:[],requestBody:{required:true,content:{'application/json':{schema:clean(schema)}}},responses}}; }
post(auth,'/v1/agent-api/auth/challenge','auth_challenge','Prepare an exact message for the current NFT holder. Never sign automatically.',research.authentication.schemas.challenge);
post(auth,'/v1/agent-api/auth/session','auth_session','Exchange the holder signature for a token. Store only in the secure credential field.',research.authentication.schemas.session);
post(participation,'/v1/identity/agent/challenge','identity_challenge','Prepare an explicitly requested identity operation.',identity.schemas.agentChallenge);
post(participation,'/v1/identity/agent/execute','identity_execute','Execute the exact user-authorized signed identity operation.',identity.schemas.agentExecute);
post(participation,'/v1/theses/agent/challenge','thesis_challenge','Prepare user-reviewed content for public publication.',theses.schemas.challenge);
post(participation,'/v1/theses/agent/submit','thesis_submit','Publish only the exact user-authorized signed content.',theses.schemas.submit);
for (const [name,value] of Object.entries({'openapi.json':api,'api/authentication.openapi.json':auth,'api/participation.openapi.json':participation})) await writeFile(new URL(name,root),JSON.stringify(value,null,2)+'\n');
const lines = ['# Complete read API parameters','','Generated from [catalog.json](../api/catalog.json). Required parameters are marked **required**. Path parameters are URL-encoded once as one segment. Unknown query parameters are rejected.',''];
for (const item of catalog) {
  lines.push(`## ${item.name}`, '', `\`GET ${item.path}\` - ${item.scope}`, '', item.description, '', '| Parameter | Location | Required | Schema |','|---|---|---|---|');
  for (const [name,schema] of Object.entries(item.parameters.properties)) lines.push(`| ${name} | ${item.path.includes('{'+name+'}')?'path':'query'} | ${(item.parameters.required??[]).includes(name)?'**required**':'optional'} | ${JSON.stringify(clean(schema)).replaceAll('|','&#124;')} |`);
  if (!Object.keys(item.parameters.properties).length) lines.push('| None | - | - | No query parameters |');
  lines.push('');
}
await writeFile(new URL('docs/api-parameters.md',root),lines.join('\n')+'\n');
