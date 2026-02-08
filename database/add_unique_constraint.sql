-- Add unique constraint to prevent duplicate posts for the same user
-- We use (user_id, post_id) as the unique key. If post_id is empty, this constraint won't trigger for nulls, 
-- but LinkedIn reports usually have URLs or unique IDs.
ALTER TABLE metrics_history 
ADD CONSTRAINT unique_user_post 
UNIQUE (user_id, post_id);
