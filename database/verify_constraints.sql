-- Query to verify if the unique constraint exists on metrics_history
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE n.nspname = 'public' 
AND c.conrelid = 'metrics_history'::regclass;

-- If you don't see 'unique_user_post', please run this again:
-- ALTER TABLE metrics_history ADD CONSTRAINT unique_user_post UNIQUE (user_id, post_id);
