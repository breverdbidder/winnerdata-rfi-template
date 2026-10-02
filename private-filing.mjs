// Separate private filing boundary. Never sends document bytes/text to the model.
export function privateFiling({store,objects,scanner,retentionMs,clock=()=>Date.now(),enabled=false,maxBytes=10*1024*1024}){
 return {async receive(actor,{bytes,mime}){
 if(!enabled||!scanner||!retentionMs||!actor?.clientId||!actor?.requestId||!actor?.subject)throw Error('Verified private filing not enabled');
 if(!(bytes instanceof Uint8Array)||!bytes.length||bytes.length>maxBytes)throw Error('File size denied');const matches=mime==='application/pdf'?new TextDecoder().decode(bytes.slice(0,5))==='%PDF-':mime==='image/png'?bytes.slice(0,8).join(',')==='137,80,78,71,13,10,26,10':mime==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:false;if(!matches)throw Error('File type denied');
 const id=crypto.randomUUID(),key=actor.clientId+'/'+actor.requestId+'/'+id,now=clock();await objects.put(key,bytes,{mime});
 try{await store.createQuarantine(actor,{id,key,mime,size:bytes.length,createdAt:now,deleteAfter:now+retentionMs});}catch(e){await objects.delete(key);throw e;}
 // Scanner result is evidence only. A reviewer still approves downloads explicitly.
 try{const verdict=await scanner.scan({key,bytes,mime});if(!['clean','malicious'].includes(verdict))throw Error('Scanner unavailable');await store.recordScan(actor,id,verdict);if(verdict==='malicious')await objects.delete(key);}catch{await store.recordScan(actor,id,'unavailable');}
 return {id,status:'quarantine',verified:false};
 },async download(actor,id){const doc=await store.resolveDocument(actor,id);if(!doc||doc.status!=='approved'||doc.scan!=='clean'||doc.deleteAfter<=clock())throw Error('Download denied');await store.audit(actor,'download',id);return objects.get(doc.key);},
 async purge(actor,id){const doc=await store.resolveDocument(actor,id);if(!doc||doc.deleteAfter>clock())throw Error('Retention deletion denied');await objects.delete(doc.key);await store.markDeleted(actor,id);await store.audit(actor,'retention_delete',id);}
 };
}
