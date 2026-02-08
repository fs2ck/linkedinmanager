-- 1. Fix imported_files_log
ALTER TABLE imported_files_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own import logs" ON imported_files_log;
DROP POLICY IF EXISTS "Users can insert their own import logs" ON imported_files_log;

-- Allow INSERT for any authenticated user (we trust the app to send the right user_id)
CREATE POLICY "Users can insert import logs" 
ON imported_files_log FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Allow SELECT for the owner
CREATE POLICY "Users can view their own import logs" 
ON imported_files_log FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Fix metrics_history
ALTER TABLE metrics_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own metrics" ON metrics_history;
DROP POLICY IF EXISTS "Users can insert their own metrics" ON metrics_history;

CREATE POLICY "Users can insert metrics" 
ON metrics_history FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own metrics" 
ON metrics_history FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Fix demographics_history
ALTER TABLE demographics_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own demographics" ON demographics_history;
DROP POLICY IF EXISTS "Users can insert their own demographics" ON demographics_history;

CREATE POLICY "Users can insert demographics" 
ON demographics_history FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own demographics" 
ON demographics_history FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Fix followers_history
ALTER TABLE followers_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own followers" ON followers_history;
DROP POLICY IF EXISTS "Users can insert their own followers" ON followers_history;

CREATE POLICY "Users can insert followers" 
ON followers_history FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own followers" 
ON followers_history FOR SELECT 
USING (auth.uid() = user_id);
