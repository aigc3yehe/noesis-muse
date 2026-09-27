import { readFile, readdir, lstat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = new URL('../', import.meta.url);
export async function verify() {
  const files = JSON.parse(await readFile(new URL('release-files.json',root),'utf8'));
  if (!Array.isArray(files) || new Set(files).size !== files.length) throw Error('Invalid release allowlist');
  const listed=new Set(files), actual=[];
  async function walk(prefix='') {
    for(const entry of await readdir(new URL(prefix,root),{withFileTypes:true})) {
      if(!prefix && ['.git','release'].includes(entry.name)) continue;
      const path=prefix+entry.name;
      if(entry.isSymbolicLink()) throw Error('Symlink not allowed: '+path);
      if(entry.isDirectory()) await walk(path+'/'); else actual.push(path);
    }
  }
  await walk();
  for(const path of actual) if(!listed.has(path)) throw Error('Unexpected file: '+path);
  for(const path of files) {
    if(path.startsWith('/') || path.includes('..') || !actual.includes(path)) throw Error('Invalid or missing release file: '+path);
    if(!(await lstat(new URL(path,root))).isFile()) throw Error('Not a regular file: '+path);
    const text=await readFile(new URL(path,root),'utf8');
    const parsed=path.endsWith('.json')?JSON.stringify(JSON.parse(text)):text;
    if(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u.test(parsed)) throw Error('Non-English CJK content: '+path);
    const forbidden=[/-----BEGIN [A-Z ]*PRIVATE KEY-----/,/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,/\bgh[pousr]_[A-Za-z0-9]{25,}\b/,/\b(?:192\.168|10\.\d{1,3})\.\d{1,3}\.\d{1,3}\b/,/\b172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}\b/,/\/(?:Users|Volumes|home)\/[A-Za-z0-9_-]+\//,/https?:\/\/[^\s/]+:[^\s/@]+@/,/Bearer [a-f0-9]{64}/];
    for(const pattern of forbidden) if(pattern.test(parsed)) throw Error('Potential private material: '+path);
    if(path.endsWith('.md')) {
      for(const match of text.matchAll(/\]\(([^\s)]+)\)/g)) {
        const target=match[1];if(/^[a-z]+:|^#/i.test(target))continue;
        const url=new URL(target,new URL(path,root));
        if(!url.href.startsWith(root.href)) throw Error('Link escapes package: '+path);
        try { await lstat(url); } catch { throw Error('Broken local link: '+path+' -> '+target); }
      }
    }
  }
  const catalog=JSON.parse(await readFile(new URL('api/catalog.json',root),'utf8'));
  const spec=JSON.parse(await readFile(new URL('openapi.json',root),'utf8'));
  if(catalog.length!==25)throw Error('Unexpected read catalog size');
  for(const item of catalog) {
    const operation=spec.paths[item.path]?.get;
    if(operation?.operationId!==item.name)throw Error('Read operation mismatch: '+item.name);
    if(JSON.stringify(operation.security)!==JSON.stringify(item.scope==='public'?[]:[{researchBearer:[]}]))throw Error('Incorrect auth boundary: '+item.name);
    for(const match of item.path.matchAll(/\{([^}]+)\}/g)) if(!operation.parameters.some(p=>p.name===match[1]&&p.in==='path'&&p.required))throw Error('Unbound path parameter');
  }
  for(const name of ['openapi.json','api/authentication.openapi.json','api/participation.openapi.json']) {
    const doc=JSON.parse(await readFile(new URL(name,root),'utf8'));
    if(doc.openapi!=='3.1.0'||doc.servers.length!==1||doc.servers[0].url!=='https://noesis.run')throw Error('Invalid API origin');
    const ids=new Set();
    for(const [path,methods] of Object.entries(doc.paths)) {
      if(!/^\/v1\/(agent-api|identity|theses)\//.test(path))throw Error('Undocumented route');
      for(const [method,op] of Object.entries(methods)) {
        if(ids.has(op.operationId)||!op.responses?.['200'])throw Error('Invalid operation');ids.add(op.operationId);
        if(name==='openapi.json' && method!=='get' && !(method==='delete'&&path==='/v1/agent-api/auth/session'))throw Error('Mutation in read connector');
      }
    }
  }
  return {files:files.length,readOperations:catalog.length,englishOnly:true,privatePatternScan:'passed',localLinks:'passed',apiBoundaries:'passed'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(await verify(),null,2)); }
  catch(error) {console.error(error.message);process.exitCode=1;}
}
