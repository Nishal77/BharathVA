-- Create users table (permanent storage after registration)
CREATE TABLE IF NOT EXISTS users (
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

-- Create email_otps table (temporary OTP storage)
CREATE TABLE IF NOT EXISTS email_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(150) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expiry TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create registration_sessions table (temporary session data during registration)
-- This is NOT a duplicate of users - it's temporary storage during multi-step registration
CREATE TABLE IF NOT EXISTS registration_sessions (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_email_otps_email ON email_otps(email);
CREATE INDEX IF NOT EXISTS idx_email_otps_expiry ON email_otps(expiry);
CREATE INDEX IF NOT EXISTS idx_registration_sessions_token ON registration_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_registration_sessions_email ON registration_sessions(email);
CREATE INDEX IF NOT EXISTS idx_registration_sessions_expiry ON registration_sessions(expiry);

