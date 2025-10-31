-- Safe migration to add profile fields to registration_sessions
ALTER TABLE registration_sessions
    ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
    ADD COLUMN IF NOT EXISTS bio VARCHAR(300),
    ADD COLUMN IF NOT EXISTS gender VARCHAR(30);



