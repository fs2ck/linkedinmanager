-- NO AUTH FIX: Disable RLS and Remove FK constraints to auth.users

-- 1. Disable RLS on all tables (Since there is no auth yet)
ALTER TABLE imported_files_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE demographics_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE followers_history DISABLE ROW LEVEL SECURITY;

-- 2. Remove Foreign Key constraints to auth.users (if they exist)
-- We need to do this because if we insert a dummy user_id, it will fail if that ID doesn't exist in auth.users
ALTER TABLE imported_files_log DROP CONSTRAINT IF EXISTS imported_files_log_user_id_fkey;
ALTER TABLE metrics_history DROP CONSTRAINT IF EXISTS metrics_history_user_id_fkey;
ALTER TABLE demographics_history DROP CONSTRAINT IF EXISTS demographics_history_user_id_fkey;
ALTER TABLE followers_history DROP CONSTRAINT IF EXISTS followers_history_user_id_fkey;

-- 3. (Optional) Make user_id nullable just in case
ALTER TABLE imported_files_log ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE metrics_history ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE demographics_history ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE followers_history ALTER COLUMN user_id DROP NOT NULL;
