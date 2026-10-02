// Portable application boundary. No vendor SDK. Adapters must enforce the documented contracts.
export class ServiceError extends Error { constructor(status,message){super(message);this.status=status;} }
export function validateMessage(value){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>k!=='message')||typeof value.message!=='string'||!value.message.trim()||value.message.length>4000)throw new ServiceError(400,'Text-only message required, 1 to 4000 characters.');
 if(/(?:\bsk-[A-Za-z0-9]{10,}|\bgh[pousr]_[A-Za-z0-9]{10,}|\b\d{3}-\d{2}-\d{4}\b|\b(?:\d[ -]?){13,19}\b|-----BEGIN .*PRIVATE KEY-----|\b(?:password|api[_ -]?key|secret|cvv|ssn)\s*[:=]\s*\S+)/i.test(value.message))throw new ServiceError(422,'Use the dedicated secret or document filing channel, not AI chat.');
 return value.message.trim();
}
export function createService({auth,store,model,origin,chatEnabled=false,clock=()=>Date.now(),dailyCap=10}){
 async function scope(request,requestId){const user=await auth.verify(request);if(!user?.subject)throw new ServiceError(401,'Sign in required.');const membership=await store.resolveMembership(user.subject,requestId);if(!membership)throw new ServiceError(403,'Access denied.');return {...membership,subject:user.subject,requestId};}
 return {async handle(request){try{
 const path=new URL(request.url).pathname.match(/^\/api\/requests\/([a-zA-Z0-9_-]{1,80})\/(history|chat|notes|requirements)$/);if(!path)throw new ServiceError(404,'Not found.');const actor=await scope(request,path[1]);
 if(request.method==='GET'&&path[2]==='history')return respond({messages:await store.history(actor)});
 if(request.method==='GET'&&path[2]==='requirements')return respond({requirements:await store.requirements(actor)});
 if(request.method!=='POST'||!['chat','notes'].includes(path[2]))throw new ServiceError(405,'Method not allowed.');
 if(!origin||request.headers.get('Origin')!==origin)throw new ServiceError(403,'Origin denied.');
 if(path[2]==='chat'&&(!chatEnabled||!actor.aiConsentAt||!model))throw new ServiceError(503,'Chat not enabled for this client.');
 // Bound actual bytes even without Content-Length. Never read unbounded request.json().
 const reader=request.body?.getReader();if(!reader)throw new ServiceError(400,'Message required.');let chunks=[],length=0;while(true){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>20000){await reader.cancel();throw new ServiceError(413,'Message too large.');}chunks.push(value);}const bytes=new Uint8Array(length);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}let value;try{value=JSON.parse(new TextDecoder().decode(bytes));}catch{throw new ServiceError(400,'Invalid JSON.');}const message=validateMessage(value);
 const now=clock();if(!await store.reserveQuota(actor,new Date(now).toISOString().slice(0,10),Math.min(25,Math.max(1,dailyCap))))throw new ServiceError(429,'Daily limit reached. No paid fallback.');
 if(path[2]==='notes'){await store.appendNote(actor,{message,createdAt:now});return respond({saved:true,body:message,review_state:'pending',ai:false});}
 const history=await store.history(actor);const answer=await model.reply({message,history:history.slice(-12).map(({role,body})=>({role,body})),maxOutputTokens:600,signal:AbortSignal.timeout(30000)});
 if(typeof answer!=='string'||!answer.trim()||answer.length>8000)throw new ServiceError(503,'Assistant response unavailable.');
 // Atomic pair + audit. A failed save is not reported as successful chat.
 await store.appendExchange(actor,{message,answer,createdAt:now});return respond({reply:answer,review_state:'pending'});
 }catch(e){return respond({error:e instanceof ServiceError?e.message:'Service unavailable. No action confirmed.'},e instanceof ServiceError?e.status:503);}}};
}
function respond(body,status=200){return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
