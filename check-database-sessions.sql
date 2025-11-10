-- Database Session Check and Cleanup Script
-- Run this in NeonDB SQL editor to check and clean up sessions

-- 1. Check all active sessions with user details
SELECT 
    us.id as session_id,
    us.user_id,
    u.email,
    u.username,
    us.refresh_token,
    us.created_at,
    us.last_used_at,
    us.expires_at,
    CASE 
        WHEN us.expires_at > NOW() THEN 'ACTIVE'
        ELSE 'EXPIRED'
    END as status
FROM user_sessions us
JOIN users u ON us.user_id = u.id
ORDER BY us.last_used_at DESC;

-- 2. Check for duplicate refresh tokens (should never happen)
SELECT 
    refresh_token,
    COUNT(*) as count,
    STRING_AGG(user_id::text, ', ') as user_ids
FROM user_sessions
GROUP BY refresh_token
HAVING COUNT(*) > 1;

-- 3. Check sessions per user
SELECT 
    u.id as user_id,
    u.email,
    u.username,
    COUNT(us.id) as active_sessions,
    MAX(us.last_used_at) as most_recent_session
FROM users u
LEFT JOIN user_sessions us ON u.id = us.user_id AND us.expires_at > NOW()
GROUP BY u.id, u.email, u.username
ORDER BY active_sessions DESC;

-- 4. Find sessions with mismatched user IDs (if any)
-- This shouldn't happen due to foreign key constraints, but check anyway
SELECT 
    us.id as session_id,
    us.user_id as session_user_id,
    u.id as actual_user_id,
    us.refresh_token
FROM user_sessions us
LEFT JOIN users u ON us.user_id = u.id
WHERE u.id IS NULL;

-- 5. CLEANUP: Delete all expired sessions
DELETE FROM user_sessions 
WHERE expires_at < NOW();

-- 6. CLEANUP: Delete all sessions (use with caution - forces all users to re-login)
-- DELETE FROM user_sessions;

-- 7. CLEANUP: Delete sessions for a specific user (replace USER_ID)
-- DELETE FROM user_sessions WHERE user_id = 'USER_ID_HERE';

-- 8. Check which user owns a specific refresh token
-- SELECT 
--     us.refresh_token,
--     us.user_id,
--     u.email,
--     u.username,
--     us.expires_at,
--     CASE 
--         WHEN us.expires_at > NOW() THEN 'ACTIVE'
--         ELSE 'EXPIRED'
--     END as status
-- FROM user_sessions us
-- JOIN users u ON us.user_id = u.id
-- WHERE us.refresh_token = 'REFRESH_TOKEN_HERE';

