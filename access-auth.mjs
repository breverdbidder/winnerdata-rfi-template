// Optional Cloudflare Access adapter. Signature verification implementation is reusable source.
import {verifyAccess} from './cloudflare-worker.mjs';
export function accessAuth(env){return {async verify(request){try{const email=await verifyAccess(request.headers.get('Cf-Access-Jwt-Assertion'),env);return {subject:email};}catch{return null;}}};}
