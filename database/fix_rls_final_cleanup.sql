-- Final Cleanup & Fix for RLS
-- This script explicitly drops all known policy variations before creating new ones.

-- 1. IMPORTED_FILES_LOG
ALTER TABLE imported_files_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own import logs" ON imported_files_log;
DROP POLICY IF EXISTS "Users can insert their own import logs" ON imported_files_log;
DROP POLICY IF EXISTS "Users can insert import logs" ON imported_files_log; -- The one that errored

CREATE POLICY "Users can insert import logs" 
ON imported_files_log FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own import logs" 
ON imported_files_log FOR SELECT 
USING (auth.uid() = user_id);


-- 2. METRICS_HISTORY
ALTER TABLE metrics_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own metrics" ON metrics_history;
DROP POLICY IF EXISTS "Users can insert their own metrics" ON metrics_history;
DROP POLICY IF EXISTS "Users can insert metrics" ON metrics_history;

CREATE POLICY "Users can insert metrics" 
ON metrics_history FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own metrics" 
ON metrics_history FOR SELECT 
USING (auth.uid() = user_id);


-- 3. DEMOGRAPHICS_HISTORY
ALTER TABLE demographics_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own demographics" ON demographics_history;
DROP POLICY IF EXISTS "Users can insert their own demographics" ON demographics_history;
DROP POLICY IF EXISTS "Users can insert demographics" ON demographics_history;

CREATE POLICY "Users can insert demographics" 
ON demographics_history FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own demographics" 
ON demographics_history FOR SELECT 
USING (auth.uid() = user_id);


-- 4. FOLLOWERS_HISTORY
ALTER TABLE followers_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own followers" ON followers_history;
DROP POLICY IF EXISTS "Users can insert their own followers" ON followers_history;
DROP POLICY IF EXISTS "Users can insert followers" ON followers_history;

CREATE POLICY "Users can insert followers" 
ON followers_history FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own followers" 
ON followers_history FOR SELECT 
USING (auth.uid() = user_id);
