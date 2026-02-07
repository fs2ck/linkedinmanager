-- Tabela de Ciclos de Planejamento (90 dias)
CREATE TABLE IF NOT EXISTS planning_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    thesis TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Posts Planejados
CREATE TABLE IF NOT EXISTS planned_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id UUID REFERENCES planning_cycles(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    day_of_week TEXT NOT NULL, -- monday, wednesday, friday
    date DATE NOT NULL,
    pillar TEXT NOT NULL, -- authority, personal, conversion
    format TEXT NOT NULL, -- text, carousel, video
    objective TEXT NOT NULL, -- educational, inspired, sales
    theme TEXT,
    angle TEXT,
    content TEXT,
    status TEXT DEFAULT 'planned', -- planned, draft_generated, published
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE planning_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_posts ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (Simplificadas para o dev)
CREATE POLICY "Users can manage their own cycles" ON planning_cycles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own planned posts" ON planned_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM planning_cycles 
            WHERE planning_cycles.id = planned_posts.cycle_id 
            AND planning_cycles.user_id = auth.uid()
        )
    );
