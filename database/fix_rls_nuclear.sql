-- NUCLEAR OPTION: ALLOW EVERYTHING for debugging
-- If this fails, the issue is NOT RLS policies but something else (like a simplified trigger or constraint)

-- 1. IMPORTED_FILES_LOG
ALTER TABLE imported_files_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own import logs" ON imported_files_log;
DROP POLICY IF EXISTS "Users can insert their own import logs" ON imported_files_log;
DROP POLICY IF EXISTS "Users can insert import logs" ON imported_files_log; 
DROP POLICY IF EXISTS "Allow all inserts for debugging" ON imported_files_log;

-- Allow INSERT for ANYONE (Public) - FOR DEBUGGING ONLY
CREATE POLICY "Allow all inserts for debugging" 
ON imported_files_log FOR INSERT 
WITH CHECK (true);

-- Allow SELECT for ANYONE (Public) - FOR DEBUGGING ONLY
CREATE POLICY "Allow all selects for debugging" 
ON imported_files_log FOR SELECT 
USING (true);


-- 2. METRICS_HISTORY
ALTER TABLE metrics_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own metrics" ON metrics_history;
DROP POLICY IF EXISTS "Users can insert their own metrics" ON metrics_history;
DROP POLICY IF EXISTS "Users can insert metrics" ON metrics_history;
DROP POLICY IF EXISTS "Allow all metrics inserts" ON metrics_history;

CREATE POLICY "Allow all metrics inserts" 
ON metrics_history FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow all metrics selects" 
ON metrics_history FOR SELECT 
USING (true);


-- 3. DEMOGRAPHICS_HISTORY
ALTER TABLE demographics_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own demographics" ON demographics_history;
DROP POLICY IF EXISTS "Users can insert their own demographics" ON demographics_history;
DROP POLICY IF EXISTS "Users can insert demographics" ON demographics_history;
DROP POLICY IF EXISTS "Allow all demo inserts" ON demographics_history;

CREATE POLICY "Allow all demo inserts" 
ON demographics_history FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow all demo selects" 
ON demographics_history FOR SELECT 
USING (true);


-- 4. FOLLOWERS_HISTORY
ALTER TABLE followers_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own followers" ON followers_history;
DROP POLICY IF EXISTS "Users can insert their own followers" ON followers_history;
DROP POLICY IF EXISTS "Users can insert followers" ON followers_history;
DROP POLICY IF EXISTS "Allow all followers inserts" ON followers_history;

CREATE POLICY "Allow all followers inserts" 
ON followers_history FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow all followers selects" 
ON followers_history FOR SELECT 
USING (true);
