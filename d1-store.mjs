// SQLite-compatible D1 store. Core depends on this interface, not this vendor.
export function d1Store(db){
 function scoped(a){if(!a.clientId||!a.requestId||!a.subject)throw Error('Missing verified scope');return a;}
 const q=(sql,...values)=>db.prepare(sql).bind(...values);
 return {
 async resolveMembership(subject,requestId){const r=await q('SELECT r.client_id,m.role,m.ai_consent_at FROM requests r JOIN memberships m ON m.client_id=r.client_id WHERE r.id=? AND NOT EXISTS(SELECT 1 FROM request_retention t WHERE t.request_id=r.id AND t.purge_after IS NOT NULL AND t.purge_after<=CAST(unixepoch() AS INTEGER)*1000) AND m.email=?',requestId,subject).first();return r?{clientId:r.client_id,role:r.role,aiConsentAt:r.ai_consent_at}:null;},
 async history(actor){const a=scoped(actor);return (await q('SELECT role,body,created_at FROM messages WHERE request_id=? AND EXISTS(SELECT 1 FROM requests r JOIN memberships m ON m.client_id=r.client_id WHERE r.id=messages.request_id AND r.client_id=? AND m.email=?) ORDER BY created_at,id',a.requestId,a.clientId,a.subject).all()).results;},
 async requirements(actor){const a=scoped(actor);return (await q('SELECT id,title,status,completion_rule,version FROM requirements WHERE request_id=? AND EXISTS(SELECT 1 FROM requests r JOIN memberships m ON m.client_id=r.client_id WHERE r.id=requirements.request_id AND r.client_id=? AND m.email=?)',a.requestId,a.clientId,a.subject).all()).results;},
 async reserveQuota(actor,day,cap){const a=scoped(actor);const result=await q('INSERT INTO quota(client_id,email,day,count) VALUES(?,?,?,1) ON CONFLICT(client_id,email,day) DO UPDATE SET count=count+1 WHERE count<? RETURNING count',a.clientId,a.subject,day,cap).first();return !!result;},
 async appendNote(actor,{message,createdAt}){const a=scoped(actor),id=crypto.randomUUID();await db.batch([q('INSERT INTO messages VALUES(?,?,?,?,?,?)',id,a.requestId,a.subject,'user',message,createdAt),q('INSERT INTO audit VALUES(?,?,?,?,?,?)',crypto.randomUUID(),a.requestId,a.subject,'review_note',id,createdAt)]);},
 async appendExchange(actor,{message,answer,createdAt}){const a=scoped(actor),userId=crypto.randomUUID();await db.batch([
 q('INSERT INTO messages VALUES(?,?,?,?,?,?)',userId,a.requestId,a.subject,'user',message,createdAt),
 q('INSERT INTO messages VALUES(?,?,?,?,?,?)',crypto.randomUUID(),a.requestId,a.subject,'assistant',answer,createdAt+1),
 q('INSERT INTO audit VALUES(?,?,?,?,?,?)',crypto.randomUUID(),a.requestId,a.subject,'chat',userId,createdAt)
 ]);}
 };
}
