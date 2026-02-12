-- ==========================================
-- SETUP FINAL DE SEGURANÇA E MIGRAÇÃO
-- ==========================================
-- Este script faz 3 coisas:
-- 1. Corrige a estrutura das tabelas (adiciona user_id onde faltava)
-- 2. Migra seus dados antigos para seu novo usuário
-- 3. Ativa o cadeado (RLS) em tudo

-- ### PASSO 1: ADICIONAR COLUNAS DE USUÁRIO FALTANTES ###

DO $$ 
BEGIN
    -- Adicionar user_id na planning_pillars se não existir
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'planning_pillars' AND COLUMN_NAME = 'user_id') THEN
        ALTER TABLE planning_pillars ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;

    -- Adicionar user_id na planned_posts se não existir
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'planned_posts' AND COLUMN_NAME = 'user_id') THEN
        ALTER TABLE planned_posts ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- ### PASSO 2: MIGRAÇÃO DOS DADOS (OPCIONAL) ###
-- Substitua 'COLE_SEU_UUID_AQUI' pelo ID que você pegou em Authentication > Users
-- Se você ainda não tem o ID, crie a conta na App primeiro!

DO $$ 
DECLARE 
    v_user_id UUID := 'COLE_SEU_UUID_AQUI'; -- <--- COLOQUE SEU ID AQUI
BEGIN
    IF v_user_id IS NOT NULL AND v_user_id != '00000000-0000-0000-0000-000000000000' THEN
        UPDATE metrics_history SET user_id = v_user_id WHERE user_id IS NULL;
        UPDATE posts SET user_id = v_user_id WHERE user_id IS NULL;
        UPDATE weekly_goals SET user_id = v_user_id WHERE user_id IS NULL;
        UPDATE planning_cycles SET user_id = v_user_id WHERE user_id IS NULL;
        UPDATE planning_pillars SET user_id = v_user_id WHERE user_id IS NULL;
        UPDATE planned_posts SET user_id = v_user_id WHERE user_id IS NULL;
        UPDATE demographics_history SET user_id = v_user_id WHERE user_id IS NULL;
        UPDATE followers_history SET user_id = v_user_id WHERE user_id IS NULL;
        UPDATE imported_files_log SET user_id = v_user_id WHERE user_id IS NULL;
    END IF;
END $$;

-- ### PASSO 3: ATIVAR RLS (CADEADOS) ###

ALTER TABLE metrics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE demographics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_files_log ENABLE ROW LEVEL SECURITY;

-- ### PASSO 4: CRIAR POLÍTICAS (QUEM PODE VER O QUÊ) ###

-- Função auxiliar para criar política "Manage Own Data" (faz drop e create)
-- Isso evita erro de "policy already exists"
DO $$ 
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY[
        'metrics_history', 'posts', 'weekly_goals', 
        'planning_cycles', 'planning_pillars', 'planned_posts',
        'demographics_history', 'followers_history', 'imported_files_log'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Users can manage their own %I" ON %I', t, t);
        EXECUTE format('CREATE POLICY "Users can manage their own %I" ON %I FOR ALL USING (auth.uid() = user_id)', t, t);
    END LOOP;
END $$;
