-- 1. IDENTIFICAR registros "fantasmas" (os que aparecem como "Post sem título" ou Link indisponível)
-- Note que eles têm o post_id vazio ou nulo.
SELECT id, post_id, title, published_at, impressions, created_at 
FROM metrics_history 
WHERE post_id = '' 
   OR post_id IS NULL
ORDER BY published_at DESC;

-- 2. DELETAR apenas os registros inválidos
-- Isso vai limpar sua tabela de posts sem afetar os gráficos (que usam o DAILY_TOTAL)
DELETE FROM metrics_history 
WHERE post_id = '' 
   OR post_id IS NULL;

-- 3. OPCIONAL: Limpeza total se quiser re-importar do zero
-- TRUNCATE TABLE metrics_history CASCADE;
