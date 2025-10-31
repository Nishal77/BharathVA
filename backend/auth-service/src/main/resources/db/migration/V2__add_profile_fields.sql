-- Add profile fields to users table
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS gender VARCHAR(30);

-- Optional indexes for future queries
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);

