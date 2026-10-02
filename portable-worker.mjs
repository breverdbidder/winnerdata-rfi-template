import {createService} from './service.mjs';import {d1Store} from './d1-store.mjs';import {accessAuth} from './access-auth.mjs';import {privateOpenRouter} from './private-openrouter.mjs';
const denied=(status,text)=>new Response(JSON.stringify({error:text}),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export default {async fetch(request,env){try{
 if(!env.DB)return denied(503,'Private store unavailable.');const auth=accessAuth(env),url=new URL(request.url);
 if(url.pathname==='/api/session'&&request.method==='GET'){const identity=await auth.verify(request);if(!identity)return denied(401,'Sign in required.');const rows=(await env.DB.prepare('SELECT r.id,r.title FROM requests r JOIN memberships m ON m.client_id=r.client_id WHERE m.email=?').bind(identity.subject).all()).results;return new Response(JSON.stringify({requests:rows,enabled:env.CHAT_ENABLED==='true'&&env.MODEL_PRIVACY_VERIFIED==='true'&&env.MODEL_QUOTA_VERIFIED==='true'}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});}
 if(url.pathname.startsWith('/api/')){
 // Direct privacy-enforcing adapter. Existing shared router ignores these privacy fields.
 const enabled=env.CHAT_ENABLED==='true'&&env.MODEL_PRIVACY_VERIFIED==='true'&&env.MODEL_QUOTA_VERIFIED==='true';
 const model=enabled?privateOpenRouter({apiKey:env.OPENROUTER_API_KEY,model:env.FREE_MODEL,provider:env.MODEL_PROVIDER,privacyVerified:true,quotaVerified:true}):null;
 return createService({auth,store:d1Store(env.DB),model,origin:env.PUBLIC_ORIGIN,chatEnabled:enabled,dailyCap:Number(env.DAILY_MESSAGE_CAP)||10}).handle(request);
 }
 const identity=await auth.verify(request);if(!identity)return denied(401,'Sign in required.');
 const member=await env.DB.prepare('SELECT client_id FROM memberships WHERE email=? LIMIT 1').bind(identity.subject).first();if(!member)return denied(403,'Access denied.');
 if(request.method!=='GET'||!env.ASSETS)return denied(503,'Private UI unavailable.');return env.ASSETS.fetch(request);
 }catch{return denied(503,'Service unavailable. No action confirmed.');}}};
