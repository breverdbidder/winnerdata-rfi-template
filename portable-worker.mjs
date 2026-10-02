import {createService} from './service.mjs';import {d1Store} from './d1-store.mjs';import {accessAuth} from './access-auth.mjs';import {privateOpenRouter} from './private-openrouter.mjs';
const denied=(status,text)=>new Response(JSON.stringify({error:text}),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export default {async fetch(request,env){try{
 if(!env.DB)return denied(503,'Private store unavailable.');const auth=accessAuth(env),url=new URL(request.url);
 if(url.pathname==='/api/session'&&request.method==='GET'){const identity=await auth.verify(request);if(!identity)return denied(401,'Sign in required.');const rows=(await env.DB.prepare('SELECT r.id,r.title FROM requests r JOIN memberships m ON m.client_id=r.client_id WHERE NOT EXISTS(SELECT 1 FROM request_retention t WHERE t.request_id=r.id AND t.purge_after IS NOT NULL AND t.purge_after<=CAST(unixepoch() AS INTEGER)*1000) AND m.email=?').bind(identity.subject).all()).results;return new Response(JSON.stringify({requests:rows,enabled:env.CHAT_ENABLED==='true'&&env.MODEL_PRIVACY_VERIFIED==='true'&&env.MODEL_QUOTA_VERIFIED==='true'}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});}
 if(url.pathname==='/data.js'&&request.method==='GET'){
 const identity=await auth.verify(request);if(!identity)return denied(401,'Sign in required.');
 const rows=(await env.DB.prepare('SELECT r.id,r.title FROM requests r JOIN memberships m ON m.client_id=r.client_id WHERE NOT EXISTS(SELECT 1 FROM request_retention t WHERE t.request_id=r.id AND t.purge_after IS NOT NULL AND t.purge_after<=CAST(unixepoch() AS INTEGER)*1000) AND m.email=?').bind(identity.subject).all()).results;
 if(rows.length!==1)return denied(403,'A single authorized request is required.');
 const actor=await d1Store(env.DB).resolveMembership(identity.subject,rows[0].id);if(!actor)return denied(403,'Access denied.');
 const requirements=await d1Store(env.DB).requirements({...actor,subject:identity.subject,requestId:rows[0].id});
 const data={title:rows[0].title,intro:'Your private project checklist. Received items still need reviewer checks.',mode:'Private client workspace',updated:'Current saved checklist',privateWorkspace:true,items:requirements.map(x=>({group:'Project checklist',title:x.title,status:x.status,request:x.completion_rule,complete:x.completion_rule}))};
 const payload=JSON.stringify(data).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 return new Response('window.RFI_DATA='+payload+';',{headers:{'Content-Type':'application/javascript','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 }
 if(url.pathname.startsWith('/api/')){
 // Direct privacy-enforcing adapter. Existing shared router ignores these privacy fields.
 const enabled=env.CHAT_ENABLED==='true'&&env.MODEL_PRIVACY_VERIFIED==='true'&&env.MODEL_QUOTA_VERIFIED==='true';
 const model=enabled?privateOpenRouter({apiKey:env.OPENROUTER_API_KEY,model:env.FREE_MODEL,provider:env.MODEL_PROVIDER,privacyVerified:true,quotaVerified:true}):null;
 return createService({auth,store:d1Store(env.DB),model,origin:env.PUBLIC_ORIGIN,chatEnabled:enabled,dailyCap:Number(env.DAILY_MESSAGE_CAP)||10}).handle(request);
 }
 const identity=await auth.verify(request);if(!identity)return denied(401,'Sign in required.');
 const member=await env.DB.prepare('SELECT r.client_id FROM requests r JOIN memberships m ON m.client_id=r.client_id WHERE NOT EXISTS(SELECT 1 FROM request_retention t WHERE t.request_id=r.id AND t.purge_after IS NOT NULL AND t.purge_after<=CAST(unixepoch() AS INTEGER)*1000) AND m.email=? LIMIT 1').bind(identity.subject).first();if(!member)return denied(403,'Access denied.');
 if(request.method!=='GET'||!env.ASSETS)return denied(503,'Private UI unavailable.');return env.ASSETS.fetch(request);
 }catch{return denied(503,'Service unavailable. No action confirmed.');}}};
