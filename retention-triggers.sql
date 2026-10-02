-- Single-statement dashboard purge is atomic, including all trigger effects.
CREATE TRIGGER IF NOT EXISTS request_purge_children BEFORE DELETE ON requests BEGIN
 DELETE FROM proposals WHERE request_id=OLD.id;
 DELETE FROM messages WHERE request_id=OLD.id;
 DELETE FROM requirements WHERE request_id=OLD.id;
 DELETE FROM documents WHERE request_id=OLD.id;
 DELETE FROM audit WHERE request_id=OLD.id;
 DELETE FROM request_retention WHERE request_id=OLD.id;
END;
CREATE TRIGGER IF NOT EXISTS request_purge_orphans AFTER DELETE ON requests BEGIN
 DELETE FROM quota WHERE client_id=OLD.client_id AND NOT EXISTS(SELECT 1 FROM requests WHERE client_id=OLD.client_id);
 DELETE FROM memberships WHERE client_id=OLD.client_id AND NOT EXISTS(SELECT 1 FROM requests WHERE client_id=OLD.client_id);
 DELETE FROM clients WHERE id=OLD.client_id AND NOT EXISTS(SELECT 1 FROM requests WHERE client_id=OLD.client_id) AND NOT EXISTS(SELECT 1 FROM memberships WHERE client_id=OLD.client_id);
END;
