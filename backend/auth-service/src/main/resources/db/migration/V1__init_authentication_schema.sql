-- ==========================================================
-- BharathVA Authentication Schema
-- Complete database structure for users, sessions, OTPs, and registration
-- ==========================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables (clean slate)
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS registration_sessions CASCADE;
DROP TABLE IF EXISTS email_otps CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==========================================================
-- USERS TABLE
-- Stores registered user details
-- ==========================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_number VARCHAR(15),
    country_code VARCHAR(5),
    date_of_birth DATE,
    password_hash VARCHAR(255) NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ==========================================================
-- USER_SESSIONS TABLE
-- Tracks active login sessions with refresh tokens and device information
-- ==========================================================
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    device_info VARCHAR(500),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_user_sessions_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- ==========================================================
-- EMAIL_OTPS TABLE
-- Stores email OTPs for verification
-- ==========================================================
CREATE TABLE email_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(150) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expiry TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ==========================================================
-- REGISTRATION_SESSIONS TABLE
-- Stores temporary registration flow data
-- ==========================================================
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
    is_email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    current_step VARCHAR(50) NOT NULL,
    expiry TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ==========================================================
-- INDEXES FOR USERS TABLE
-- ==========================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ==========================================================
-- INDEXES FOR USER_SESSIONS TABLE
-- ==========================================================
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_last_used_at ON user_sessions(last_used_at);
CREATE INDEX idx_user_sessions_ip_address ON user_sessions(ip_address);
CREATE INDEX idx_user_sessions_user_active ON user_sessions(user_id, expires_at);

-- ==========================================================
-- INDEXES FOR EMAIL_OTPS TABLE
-- ==========================================================
CREATE INDEX idx_email_otps_email ON email_otps(email);
CREATE INDEX idx_email_otps_expiry ON email_otps(expiry);
CREATE INDEX idx_email_otps_email_expiry ON email_otps(email, expiry);

-- ==========================================================
-- INDEXES FOR REGISTRATION_SESSIONS TABLE
-- ==========================================================
CREATE INDEX idx_registration_sessions_token ON registration_sessions(session_token);
CREATE INDEX idx_registration_sessions_email ON registration_sessions(email);
CREATE INDEX idx_registration_sessions_expiry ON registration_sessions(expiry);

-- ==========================================================
-- TABLE COMMENTS FOR DOCUMENTATION
-- ==========================================================
COMMENT ON TABLE users IS 'Stores registered user details';
COMMENT ON TABLE user_sessions IS 'Tracks active login sessions with refresh tokens and device information';
COMMENT ON TABLE email_otps IS 'Stores email OTPs for verification';
COMMENT ON TABLE registration_sessions IS 'Stores temporary registration flow data';

-- ==========================================================
-- VERIFICATION
-- ==========================================================
SELECT 'Tables created successfully.' AS status;

