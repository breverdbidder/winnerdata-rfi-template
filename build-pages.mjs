// Dependency-free bundle for Pages advanced mode. Does not deploy or collect secrets.
import fs from 'node:fs/promises';
const out=new URL('./dist/',import.meta.url);await fs.mkdir(out,{recursive:true});
let pieces=[];for(const name of ['service.mjs','d1-store.mjs','private-openrouter.mjs','access-auth.mjs','portable-worker.mjs']){let s=await fs.readFile(new URL(name,import.meta.url),'utf8');s=s.replace(/import [^\n;]+;\s*/g,'').replace(/export default /,'const pagesRuntime = ').replace(/export /g,'');pieces.push(s);}
let legacy=await fs.readFile(new URL('cloudflare-worker.mjs',import.meta.url),'utf8');const decode=legacy.slice(legacy.indexOf('const decode='),legacy.indexOf('const id='));const verify=legacy.slice(legacy.indexOf('export async function verifyAccess'),legacy.indexOf('async function access(')).replace('export ','');
await fs.writeFile(new URL('_worker.js',out),decode+'\n'+verify+'\n'+pieces.join('\n')+'\nexport default pagesRuntime;\n');for(const name of ['index.html','chat.js','data.js'])await fs.copyFile(new URL(name,import.meta.url),new URL(name,out));console.log('Built generic dist only; no deployment.');
