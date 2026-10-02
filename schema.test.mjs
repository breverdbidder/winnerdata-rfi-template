import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
test('SQLite enforces foreign keys, tenant joins and unique quota',()=>{const script=`
import sqlite3
c=sqlite3.connect(':memory:');c.executescript(open('schema.sql').read())
c.executemany('INSERT INTO clients VALUES(?,?)',[('a','Sample A'),('b','Sample B')])
c.executemany('INSERT INTO requests VALUES(?,?,?,?)',[('req-a','a','A',1),('req-b','b','B',1)])
c.executemany('INSERT INTO memberships VALUES(?,?,?,?)',[('alice@example.test','a','client',1),('bob@example.test','b','client',1)])
q='SELECT r.id FROM requests r JOIN memberships m ON m.client_id=r.client_id WHERE r.id=? AND m.email=?'
assert c.execute(q,('req-a','bob@example.test')).fetchone() is None
assert c.execute(q,('req-a','alice@example.test')).fetchone()[0]=='req-a'
try:c.execute('INSERT INTO requests VALUES(?,?,?,?)',('orphan','missing','Bad',1));raise AssertionError('FK missing')
except sqlite3.IntegrityError:pass
sql='INSERT INTO quota VALUES(?,?,?,1) ON CONFLICT(client_id,email,day) DO UPDATE SET count=count+1 WHERE count<? RETURNING count'
assert c.execute(sql,('a','alice@example.test','day',1)).fetchone()[0]==1
assert c.execute(sql,('a','alice@example.test','day',1)).fetchone() is None
print('tenant joins, FK and quota passed')
`;const r=spawnSync('python3',['-c',script],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);});
