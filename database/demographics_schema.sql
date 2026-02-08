-- Create table for storing demographic data
CREATE TABLE IF NOT EXISTS demographics_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    category TEXT, -- 'Cargos', 'Localidades', 'Setores', etc.
    label TEXT,    -- 'Designer de produtos', 'São Paulo', etc.
    value_percent DECIMAL(5,2), -- 10.00, 59.00, etc.
    source_file_id UUID REFERENCES imported_files_log(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for daily/batch follower snapshots
CREATE TABLE IF NOT EXISTS followers_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    follower_count INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source_file_id UUID REFERENCES imported_files_log(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE demographics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own demographics" ON demographics_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own demographics" ON demographics_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own followers" ON followers_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own followers" ON followers_history FOR INSERT WITH CHECK (auth.uid() = user_id);
