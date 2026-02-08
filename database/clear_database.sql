-- Script to clear all data from the database tables
-- Warning: This will delete all imported metrics and goals.

-- Disable triggers temporarily if needed (optional)
-- SET session_replication_role = 'replica';

TRUNCATE TABLE metrics_history CASCADE;
TRUNCATE TABLE imported_files_log CASCADE;
TRUNCATE TABLE weekly_goals CASCADE;

-- Re-enable triggers
-- SET session_replication_role = 'origin';

-- Optional: Reset default goal for testing
-- INSERT INTO weekly_goals (user_id, target_engagement) VALUES ('00000000-0000-0000-0000-000000000000', 1000);
