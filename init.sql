-- Create user if not exists
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'delilah') THEN
      CREATE ROLE delilah LOGIN PASSWORD 'delilah123';
   END IF;
END
$do$;

-- Grant privileges
ALTER ROLE delilah WITH SUPERUSER;
CREATE DATABASE delilah_db WITH OWNER = delilah;
GRANT ALL PRIVILEGES ON DATABASE delilah_db TO delilah;