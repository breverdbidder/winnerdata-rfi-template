// Synthetic local development only. Do not use for client production records.
export class MemoryStore {
 constructor({memberships={},requirements={}}={}){this.memberships=memberships;this.items=requirements;this.messages=new Map();this.quota=new Map();this.audit=[];}
 async resolveMembership(subject,requestId){return this.memberships[subject]?.[requestId]||null;}
 key(a){return a.clientId+'/'+a.requestId;}
 async history(a){return this.messages.get(this.key(a))||[];}
 async requirements(a){return this.items[this.key(a)]||[];}
 async reserveQuota(a,day,cap){const key=a.clientId+'/'+a.subject+'/'+day,n=this.quota.get(key)||0;if(n>=cap)return false;this.quota.set(key,n+1);return true;}
 async appendExchange(a,{message,answer,createdAt}){const key=this.key(a);this.messages.set(key,[...await this.history(a),{role:'user',body:message,created_at:createdAt},{role:'assistant',body:answer,created_at:createdAt}]);this.audit.push({subject:a.subject,requestId:a.requestId,action:'chat',createdAt});}
}
