-- MANUAL UUID FIX SCRIPT
-- Run this directly on your Neon PostgreSQL database to fix BIGSERIAL to UUID

-- Connect to your database:
-- psql 'postgresql://neondb_owner:npg_Dtqy63pieawz@ep-summer-bar-a1bv6p9u-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'

-- Step 1: Check current table structure
SELECT 'Current table structure:' as step;
SELECT 
    table_name,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('users', 'email_otps', 'registration_sessions') 
AND column_name = 'id'
ORDER BY table_name;

-- Step 2: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 3: Drop all tables (THIS WILL DELETE ALL DATA)
DROP TABLE IF EXISTS registration_sessions CASCADE;
DROP TABLE IF EXISTS email_otps CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Step 4: Drop sequences (from bigserial)
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;
DROP SEQUENCE IF EXISTS email_otps_id_seq CASCADE;
DROP SEQUENCE IF EXISTS registration_sessions_id_seq CASCADE;

-- Step 5: Recreate users table with UUID
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_number VARCHAR(15),
    country_code VARCHAR(5),
    date_of_birth DATE,
    password_hash VARCHAR(255) NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 6: Recreate email_otps table with UUID
CREATE TABLE email_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(150) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expiry TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 7: Recreate registration_sessions table with UUID
CREATE TABLE registration_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(150) NOT NULL,
    full_name VARCHAR(100),
    phone_number VARCHAR(15),
    country_code VARCHAR(5),
    date_of_birth DATE,
    password_hash VARCHAR(255),
    username VARCHAR(50),
    is_email_verified BOOLEAN DEFAULT FALSE,
    current_step VARCHAR(50) NOT NULL,
    expiry TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 8: Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_email_otps_email ON email_otps(email);
CREATE INDEX IF NOT EXISTS idx_email_otps_expiry ON email_otps(expiry);
CREATE INDEX IF NOT EXISTS idx_registration_sessions_token ON registration_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_registration_sessions_email ON registration_sessions(email);
CREATE INDEX IF NOT EXISTS idx_registration_sessions_expiry ON registration_sessions(expiry);

-- Step 9: Test UUID generation
SELECT 'Testing UUID generation...' as test;

-- Insert test user
INSERT INTO users (full_name, username, email, password_hash) 
VALUES ('UUID Test User', 'uuidtest', 'uuidtest@example.com', 'hashedpassword');

-- Check the generated ID (should be UUID, not 1, 2, 3...)
SELECT 'Generated User ID:' as test;
SELECT id, username FROM users WHERE username = 'uuidtest';

-- Insert test OTP
INSERT INTO email_otps (email, otp_code, expiry) 
VALUES ('test@example.com', '123456', NOW() + INTERVAL '10 minutes');

-- Check the generated OTP ID
SELECT 'Generated OTP ID:' as test;
SELECT id, email FROM email_otps WHERE email = 'test@example.com';

-- Insert test session
INSERT INTO registration_sessions (session_token, email, current_step, expiry) 
VALUES ('test-session-uuid', 'test@example.com', 'EMAIL', NOW() + INTERVAL '24 hours');

-- Check the generated session ID
SELECT 'Generated Session ID:' as test;
SELECT id, session_token FROM registration_sessions WHERE session_token = 'test-session-uuid';

-- Step 10: Verify new table structure
SELECT 'New table structure:' as step;
SELECT 
    table_name,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('users', 'email_otps', 'registration_sessions') 
AND column_name = 'id'
ORDER BY table_name;

-- Step 11: Clean up test data
DELETE FROM registration_sessions WHERE session_token = 'test-session-uuid';
DELETE FROM email_otps WHERE email = 'test@example.com';
DELETE FROM users WHERE username = 'uuidtest';

-- Step 12: Confirm success
SELECT 'SUCCESS: All tables now use UUID primary keys!' as result;
SELECT 'Next user registration will generate a random UUID instead of 1, 2, 3...' as message;
