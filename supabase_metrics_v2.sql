-- Create table for storing historical metrics from LinkedIn
CREATE TABLE IF NOT EXISTS metrics_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    post_id TEXT, -- Original LinkedIn post ID/URL
    title TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    impressions INTEGER DEFAULT 0,
    reactions INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2),
    source_file_id UUID, -- Reference to the log entry
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for logging imported files
CREATE TABLE IF NOT EXISTS imported_files_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    file_name TEXT,
    file_size INTEGER,
    rows_count INTEGER,
    imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link source_file_id to imported_files_log
ALTER TABLE metrics_history 
ADD CONSTRAINT fk_source_file 
FOREIGN KEY (source_file_id) 
REFERENCES imported_files_log(id) 
ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE metrics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_files_log ENABLE ROW LEVEL SECURITY;

-- Policies for metrics_history
CREATE POLICY "Users can view their own metrics" 
ON metrics_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metrics" 
ON metrics_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policies for imported_files_log
CREATE POLICY "Users can view their own import logs" 
ON imported_files_log FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own import logs" 
ON imported_files_log FOR INSERT 
WITH CHECK (auth.uid() = user_id);
