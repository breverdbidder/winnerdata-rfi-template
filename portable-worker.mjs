import {createService} from './service.mjs';import {d1Store} from './d1-store.mjs';import {accessAuth} from './access-auth.mjs';import {freeRouter} from './free-router.mjs';
const denied=(status,text)=>new Response(JSON.stringify({error:text}),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export default {async fetch(request,env){try{
 if(!env.DB)return denied(503,'Private store unavailable.');const auth=accessAuth(env),url=new URL(request.url);
 if(url.pathname.startsWith('/api/')){
 // Do not guess a success response decoder. Deployment must inject a verified model implementation.
 const model=env.MODEL_ADAPTER;
 return createService({auth,store:d1Store(env.DB),model,origin:env.PUBLIC_ORIGIN,chatEnabled:env.CHAT_ENABLED==='true'&&env.MODEL_PRIVACY_VERIFIED==='true',dailyCap:Number(env.DAILY_MESSAGE_CAP)||10}).handle(request);
 }
 const identity=await auth.verify(request);if(!identity)return denied(401,'Sign in required.');
 const member=await env.DB.prepare('SELECT client_id FROM memberships WHERE email=? LIMIT 1').bind(identity.subject).first();if(!member)return denied(403,'Access denied.');
 if(request.method!=='GET'||!env.ASSETS)return denied(503,'Private UI unavailable.');return env.ASSETS.fetch(request);
 }catch{return denied(503,'Service unavailable. No action confirmed.');}}};
