-- Fix RLS policies for demographics_history
ALTER TABLE demographics_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own demographics" ON demographics_history;
DROP POLICY IF EXISTS "Users can insert their own demographics" ON demographics_history;

CREATE POLICY "Users can view their own demographics" 
ON demographics_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own demographics" 
ON demographics_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Fix RLS policies for followers_history
ALTER TABLE followers_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own followers" ON followers_history;
DROP POLICY IF EXISTS "Users can insert their own followers" ON followers_history;

CREATE POLICY "Users can view their own followers" 
ON followers_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own followers" 
ON followers_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);
