-- Enable UUID extension just in case
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Fix imported_files_log (The root dependency)
ALTER TABLE imported_files_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own import logs" ON imported_files_log;
DROP POLICY IF EXISTS "Users can insert their own import logs" ON imported_files_log;

CREATE POLICY "Users can view their own import logs" 
ON imported_files_log FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own import logs" 
ON imported_files_log FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. Fix metrics_history
ALTER TABLE metrics_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own metrics" ON metrics_history;
DROP POLICY IF EXISTS "Users can insert their own metrics" ON metrics_history;

CREATE POLICY "Users can view their own metrics" 
ON metrics_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metrics" 
ON metrics_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Fix demographics_history (The one failing)
ALTER TABLE demographics_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own demographics" ON demographics_history;
DROP POLICY IF EXISTS "Users can insert their own demographics" ON demographics_history;

CREATE POLICY "Users can view their own demographics" 
ON demographics_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own demographics" 
ON demographics_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Fix followers_history
ALTER TABLE followers_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own followers" ON followers_history;
DROP POLICY IF EXISTS "Users can insert their own followers" ON followers_history;

CREATE POLICY "Users can view their own followers" 
ON followers_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own followers" 
ON followers_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);
