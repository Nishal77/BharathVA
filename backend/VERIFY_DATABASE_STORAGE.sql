-- ==========================================================
-- DATABASE STORAGE VERIFICATION SCRIPT
-- Run this to verify all data is being stored correctly
-- ==========================================================

-- Check if all tables exist
SELECT 'Checking if all tables exist...' AS step;

SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM (
    VALUES ('users'), ('user_sessions'), ('email_otps'), ('registration_sessions')
) AS t(table_name)
WHERE EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = t.table_name
);

-- Verify foreign key constraint
SELECT 'Checking foreign key constraint...' AS step;

SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'user_sessions'
    AND kcu.column_name = 'user_id';

-- Check current data in tables
SELECT 'Current data in tables...' AS step;

SELECT 
    'users' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT id) as unique_ids,
    COUNT(DISTINCT email) as unique_emails
FROM users;

SELECT 
    'user_sessions' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT id) as unique_session_ids,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT refresh_token) as unique_refresh_tokens
FROM user_sessions;

-- Verify user_sessions have valid user_id references
SELECT 'Checking for orphaned sessions...' AS step;

SELECT 
    COUNT(*) as orphaned_sessions
FROM user_sessions us
LEFT JOIN users u ON us.user_id = u.id
WHERE u.id IS NULL;

-- Show sample data from user_sessions
SELECT 'Sample user_sessions data...' AS step;

SELECT 
    us.id as session_id,
    us.user_id,
    u.email as user_email,
    u.username,
    us.ip_address,
    LEFT(us.device_info, 30) as device_info,
    us.created_at,
    us.last_used_at,
    us.expires_at
FROM user_sessions us
JOIN users u ON us.user_id = u.id
ORDER BY us.created_at DESC
LIMIT 10;

-- Show active sessions count per user
SELECT 'Active sessions per user...' AS step;

SELECT 
    u.id as user_id,
    u.email,
    u.username,
    COUNT(us.id) as active_sessions
FROM users u
LEFT JOIN user_sessions us ON u.id = us.user_id AND us.expires_at > NOW()
GROUP BY u.id, u.email, u.username
ORDER BY active_sessions DESC;

-- Verify indexes exist
SELECT 'Checking indexes...' AS step;

SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_sessions', 'email_otps', 'registration_sessions')
ORDER BY tablename, indexname;

SELECT 'Verification complete!' AS status;

