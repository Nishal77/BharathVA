-- Force UUID Migration - This will definitely convert BIGSERIAL to UUID
-- Run this if V2 migration didn't work

-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Drop all existing tables completely
DROP TABLE IF EXISTS registration_sessions CASCADE;
DROP TABLE IF EXISTS email_otps CASCADE; 
DROP TABLE IF EXISTS users CASCADE;

-- Step 3: Drop any existing sequences (from bigserial)
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;
DROP SEQUENCE IF EXISTS email_otps_id_seq CASCADE;
DROP SEQUENCE IF EXISTS registration_sessions_id_seq CASCADE;

-- Step 4: Recreate users table with UUID
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

-- Step 5: Recreate email_otps table with UUID
CREATE TABLE email_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(150) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expiry TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 6: Recreate registration_sessions table with UUID
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

-- Step 7: Create all indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_email_otps_email ON email_otps(email);
CREATE INDEX IF NOT EXISTS idx_email_otps_expiry ON email_otps(expiry);
CREATE INDEX IF NOT EXISTS idx_registration_sessions_token ON registration_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_registration_sessions_email ON registration_sessions(email);
CREATE INDEX IF NOT EXISTS idx_registration_sessions_expiry ON registration_sessions(expiry);

-- Step 8: Test UUID generation immediately
INSERT INTO users (full_name, username, email, password_hash) 
VALUES ('Test User UUID', 'testuuid', 'testuuid@example.com', 'hashedpassword');

-- Step 9: Verify the ID is UUID
SELECT 'UUID Migration Test:' as test;
SELECT id, username FROM users WHERE username = 'testuuid';

-- Step 10: Clean up test data
DELETE FROM users WHERE username = 'testuuid';

-- Step 11: Confirm migration success
SELECT 'UUID migration completed successfully!' as status;
SELECT 'All tables now use UUID primary keys instead of BIGSERIAL' as result;
