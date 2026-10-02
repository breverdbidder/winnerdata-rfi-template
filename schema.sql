PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS clients(id TEXT PRIMARY KEY,name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS requests(id TEXT PRIMARY KEY,client_id TEXT NOT NULL REFERENCES clients(id),title TEXT NOT NULL,created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS memberships(email TEXT NOT NULL,client_id TEXT NOT NULL REFERENCES clients(id),role TEXT NOT NULL CHECK(role IN('client','reviewer')),ai_consent_at INTEGER,PRIMARY KEY(email,client_id));
CREATE TABLE IF NOT EXISTS requirements(id TEXT PRIMARY KEY,request_id TEXT NOT NULL REFERENCES requests(id),title TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN('missing','received','decision','unverified','verified')),completion_rule TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS messages(id TEXT PRIMARY KEY,request_id TEXT NOT NULL REFERENCES requests(id),email TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN('user','assistant')),body TEXT NOT NULL,created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS proposals(id TEXT PRIMARY KEY,request_id TEXT NOT NULL REFERENCES requests(id),message_id TEXT NOT NULL REFERENCES messages(id),body TEXT NOT NULL,state TEXT NOT NULL CHECK(state IN('pending','accepted','rejected')),created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS documents(id TEXT PRIMARY KEY,request_id TEXT NOT NULL REFERENCES requests(id),uploader TEXT NOT NULL,object_key TEXT NOT NULL UNIQUE,mime TEXT NOT NULL,size INTEGER NOT NULL,status TEXT NOT NULL CHECK(status IN('quarantine','approved','rejected')),created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS audit(id TEXT PRIMARY KEY,request_id TEXT NOT NULL,email TEXT NOT NULL,action TEXT NOT NULL,resource_id TEXT,created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS quota(client_id TEXT NOT NULL,email TEXT NOT NULL,day TEXT NOT NULL,count INTEGER NOT NULL,PRIMARY KEY(client_id,email,day));

CREATE TABLE IF NOT EXISTS request_retention(request_id TEXT PRIMARY KEY REFERENCES requests(id) ON DELETE CASCADE,closed_at INTEGER,purge_after INTEGER,CHECK((closed_at IS NULL AND purge_after IS NULL) OR (closed_at IS NOT NULL AND purge_after=closed_at+2592000000)));
