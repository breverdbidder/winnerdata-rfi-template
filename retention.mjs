// Reviewer marks project close explicitly. Expired request reads are denied in runtime.
export async function closeRequest(db,requestId,closedAt){
 if(!Number.isSafeInteger(closedAt)||closedAt<0||closedAt>Date.now())throw Error('Valid actual closure time required');
 return db.prepare('INSERT INTO request_retention(request_id,closed_at,purge_after) VALUES(?,?,?) ON CONFLICT(request_id) DO UPDATE SET closed_at=excluded.closed_at,purge_after=excluded.purge_after').bind(requestId,closedAt,closedAt+30*86400000).run();
}
export const purgeStatements=[
 'DELETE FROM proposals WHERE request_id IN (SELECT request_id FROM request_retention WHERE purge_after<=?)',
 'DELETE FROM messages WHERE request_id IN (SELECT request_id FROM request_retention WHERE purge_after<=?)',
 'DELETE FROM requirements WHERE request_id IN (SELECT request_id FROM request_retention WHERE purge_after<=?)',
 'DELETE FROM documents WHERE request_id IN (SELECT request_id FROM request_retention WHERE purge_after<=?)',
 'DELETE FROM audit WHERE request_id IN (SELECT request_id FROM request_retention WHERE purge_after<=?)',
 'DELETE FROM quota WHERE client_id IN (SELECT client_id FROM requests WHERE id IN (SELECT request_id FROM request_retention WHERE purge_after<=?)) AND NOT EXISTS(SELECT 1 FROM requests r WHERE r.client_id=quota.client_id AND r.id NOT IN(SELECT request_id FROM request_retention WHERE purge_after<=?))',
 'DELETE FROM memberships WHERE client_id IN (SELECT client_id FROM requests WHERE id IN (SELECT request_id FROM request_retention WHERE purge_after<=?)) AND NOT EXISTS(SELECT 1 FROM requests r WHERE r.client_id=memberships.client_id AND r.id NOT IN(SELECT request_id FROM request_retention WHERE purge_after<=?))',
 'DELETE FROM requests WHERE id IN(SELECT request_id FROM request_retention WHERE purge_after<=?)',
 'DELETE FROM clients WHERE NOT EXISTS(SELECT 1 FROM requests r WHERE r.client_id=clients.id) AND NOT EXISTS(SELECT 1 FROM memberships m WHERE m.client_id=clients.id)'
];
// D1 batch is atomic. request_retention has ON DELETE CASCADE for request deletion.
export async function purgeDue(db,now=Date.now()){
 if(!Number.isSafeInteger(now)||now<0)throw Error('Invalid purge time');
 return db.batch(purgeStatements.map(sql=>db.prepare(sql).bind(...Array((sql.match(/\?/g)||[]).length).fill(now))));
}
