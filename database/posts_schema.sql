-- Table for free-form drafts (Draft Studio)
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- Optional for local dev
    title TEXT NOT NULL,
    content TEXT,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- dev mode: disable RLS
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
