-- Test UUID Generation Script
-- Run this after applying the migration to verify UUID generation is working

-- 1. Check if UUID extension is enabled
SELECT 'UUID Extension Check:' as test;
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';

-- 2. Test UUID generation function
SELECT 'UUID Generation Test:' as test;
SELECT gen_random_uuid() as sample_uuid;

-- 3. Test inserting a user with UUID
SELECT 'User Insert Test:' as test;
INSERT INTO users (full_name, username, email, password_hash) 
VALUES ('Test User', 'testuser_' || extract(epoch from now()), 'test' || extract(epoch from now()) || '@example.com', 'hashedpassword')
RETURNING id, username;

-- 4. Check the generated ID format
SELECT 'Generated ID Check:' as test;
SELECT id, username FROM users WHERE username LIKE 'testuser_%' ORDER BY created_at DESC LIMIT 1;

-- 5. Test email_otps table UUID generation
SELECT 'Email OTP Test:' as test;
INSERT INTO email_otps (email, otp_code, expiry) 
VALUES ('test@example.com', '123456', NOW() + INTERVAL '10 minutes')
RETURNING id, email;

-- 6. Test registration_sessions table UUID generation
SELECT 'Registration Session Test:' as test;
INSERT INTO registration_sessions (session_token, email, current_step, expiry) 
VALUES ('test-session-' || extract(epoch from now()), 'test@example.com', 'EMAIL', NOW() + INTERVAL '24 hours')
RETURNING id, session_token;

-- 7. Verify all tables are using UUID
SELECT 'Table Schema Check:' as test;
SELECT 
    table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('users', 'email_otps', 'registration_sessions') 
AND column_name = 'id'
ORDER BY table_name;

-- 8. Clean up test data
SELECT 'Cleaning up test data...' as test;
DELETE FROM registration_sessions WHERE session_token LIKE 'test-session-%';
DELETE FROM email_otps WHERE email = 'test@example.com';
DELETE FROM users WHERE username LIKE 'testuser_%';

SELECT 'UUID generation test completed!' as result;
