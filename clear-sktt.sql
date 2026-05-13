-- Clear SKTT data from staging database
BEGIN;

DELETE FROM "JalurKML" WHERE tipe = 'SKTT';

COMMIT;
