-- 1. Clean up any existing attempts at the constraint
ALTER TABLE metrics_history DROP CONSTRAINT IF EXISTS unique_user_post;
DROP INDEX IF EXISTS metrics_history_user_post_idx;

-- 2. Ensure the table is empty before applying (optional but safer)
-- TRUNCATE TABLE metrics_history CASCADE;

-- 3. Create a UNIQUE INDEX. Supabase often finds indices easier than constraints for upsert.
CREATE UNIQUE INDEX metrics_history_user_post_idx ON metrics_history (user_id, post_id);

-- 4. Verify it was created
SELECT 
    schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE tablename = 'metrics_history';
