-- Check if the chat tables are in the realtime publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('chat_messages', 'conversations', 'conversation_participants');

-- Also check all tables in the publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- Check table permissions for realtime (all chat-related tables)
SELECT schemaname, tablename, 
       has_table_privilege('anon', schemaname||'.'||tablename, 'SELECT') as can_select
FROM pg_tables 
WHERE tablename IN ('chat_messages', 'conversations', 'conversation_participants');
