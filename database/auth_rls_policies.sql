-- 1. Habilitar RLS em todas as tabelas principais
ALTER TABLE metrics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_posts ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas para garantir que o usuário só veja/edite seus próprios dados

-- metrics_history
DROP POLICY IF EXISTS "Users can view their own metrics" ON metrics_history;
CREATE POLICY "Users can view their own metrics" ON metrics_history 
FOR ALL USING (auth.uid() = user_id);

-- posts
DROP POLICY IF EXISTS "Users can manage their own posts" ON posts;
CREATE POLICY "Users can manage their own posts" ON posts 
FOR ALL USING (auth.uid() = user_id);

-- weekly_goals
DROP POLICY IF EXISTS "Users can manage their own goals" ON weekly_goals;
CREATE POLICY "Users can manage their own goals" ON weekly_goals 
FOR ALL USING (auth.uid() = user_id);

-- planning_cycles
DROP POLICY IF EXISTS "Users can manage their own cycles" ON planning_cycles;
CREATE POLICY "Users can manage their own cycles" ON planning_cycles 
FOR ALL USING (auth.uid() = user_id);

-- planning_pillars
DROP POLICY IF EXISTS "Users can manage their own pillars" ON planning_pillars;
CREATE POLICY "Users can manage their own pillars" ON planning_pillars 
FOR ALL USING (auth.uid() = user_id);

-- planned_posts
DROP POLICY IF EXISTS "Users can manage their own planned posts" ON planned_posts;
CREATE POLICY "Users can manage their own planned posts" ON planned_posts 
FOR ALL USING (auth.uid() = user_id);
