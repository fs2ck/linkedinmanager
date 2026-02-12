-- 1. PRIMEIRO: Vá na sua aplicação e crie sua conta (Cadastro).
-- 2. No dashboard do Supabase (Authentication > Users), copie o seu "User ID" (UUID).
-- 3. Substitua o valor abaixo 'COLE_SEU_UUID_AQUI' pelo seu ID real e rode o script.

DO $$ 
DECLARE 
    v_user_id UUID := 'COLE_SEU_UUID_AQUI'; -- <--- COLOQUE SEU ID AQUI
BEGIN
    -- Associar métricas
    UPDATE metrics_history SET user_id = v_user_id WHERE user_id IS NULL;
    
    -- Associar posts
    UPDATE posts SET user_id = v_user_id WHERE user_id IS NULL;
    
    -- Associar metas semanais
    UPDATE weekly_goals SET user_id = v_user_id WHERE user_id IS NULL;
    
    -- Associar ciclos de planejamento
    UPDATE planning_cycles SET user_id = v_user_id WHERE user_id IS NULL;
    
    -- Associar pilares
    UPDATE planning_pillars SET user_id = v_user_id WHERE user_id IS NULL;
    
    -- Associar posts planejados
    UPDATE planned_posts SET user_id = v_user_id WHERE user_id IS NULL;

    RAISE NOTICE 'Dados migrados para o usuário %', v_user_id;
END $$;
