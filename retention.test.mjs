import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import {purgeStatements} from './retention.mjs';
test('retention purge is transactional, deletes expired project only and preserves shared client access',()=>{
const script=`import sqlite3,json,sys
c=sqlite3.connect(':memory:');c.executescript(open('schema.sql').read())
c.execute("INSERT INTO clients VALUES('a','Example')")
c.executemany('INSERT INTO requests VALUES(?,?,?,?)',[('old','a','Old',1),('live','a','Live',1)])
c.execute("INSERT INTO memberships VALUES('alice@example.test','a','client',NULL)")
c.execute("INSERT INTO request_retention VALUES('old',0,2592000000)")
c.execute("INSERT INTO messages VALUES('m','old','alice@example.test','user','sample',1)")
c.execute("INSERT INTO requirements VALUES('x','old','Sample','missing','Review',1)")
c.commit()
with c:
 for sql in json.loads(sys.argv[1]): c.execute(sql,[2592000001]*sql.count('?'))
assert c.execute('SELECT id FROM requests').fetchall()==[('live',)]
assert c.execute('SELECT count(*) FROM messages').fetchone()[0]==0
assert c.execute('SELECT count(*) FROM memberships').fetchone()[0]==1
assert c.execute('SELECT count(*) FROM request_retention').fetchone()[0]==0
try:
 with c:
  c.execute("DELETE FROM requests WHERE id='live'")
  c.execute('INVALID SQL')
except sqlite3.OperationalError:pass
assert c.execute("SELECT id FROM requests").fetchone()[0]=='live'
`;const r=spawnSync('python3',['-c',script,JSON.stringify(purgeStatements)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);
});
