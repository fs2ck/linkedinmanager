-- Tabela para armazenar as metas semanais definidas pelo usuário
CREATE TABLE IF NOT EXISTS weekly_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Sem FK para facilitar teste local conforme conversas anteriores
    target_engagement INTEGER NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Desabilitar RLS para facilitar teste local conforme conversas anteriores
ALTER TABLE weekly_goals DISABLE ROW LEVEL SECURITY;
