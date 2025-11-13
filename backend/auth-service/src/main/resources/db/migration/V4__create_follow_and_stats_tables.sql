-- ==========================================================
-- BharathVA Follow System Schema
-- Creates user_follows and user_stats tables for follow functionality
-- ==========================================================

-- ==========================================================
-- USER_FOLLOWS TABLE
-- Stores follow relationships between users
-- ==========================================================
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL,
    following_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_user_follows_follower 
        FOREIGN KEY (follower_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_user_follows_following 
        FOREIGN KEY (following_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    CONSTRAINT uk_user_follows_pair 
        UNIQUE (follower_id, following_id),
    CONSTRAINT ck_user_follows_no_self_follow 
        CHECK (follower_id != following_id)
);

-- ==========================================================
-- USER_STATS TABLE
-- Stores aggregated statistics for each user
-- ==========================================================
CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY,
    followers_count INTEGER DEFAULT 0 NOT NULL,
    following_count INTEGER DEFAULT 0 NOT NULL,
    posts_count INTEGER DEFAULT 0 NOT NULL,
    total_likes_received INTEGER DEFAULT 0 NOT NULL,
    total_comments_received INTEGER DEFAULT 0 NOT NULL,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_user_stats_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- ==========================================================
-- INDEXES FOR USER_FOLLOWS TABLE
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON user_follows(created_at);
CREATE INDEX IF NOT EXISTS idx_user_follows_pair ON user_follows(follower_id, following_id);

-- ==========================================================
-- INDEXES FOR USER_STATS TABLE
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_user_stats_last_updated ON user_stats(last_updated_at);

-- ==========================================================
-- TABLE COMMENTS FOR DOCUMENTATION
-- ==========================================================
COMMENT ON TABLE user_follows IS 'Stores follow relationships between users';
COMMENT ON TABLE user_stats IS 'Stores aggregated statistics for each user (followers, following, posts, likes, comments)';

-- ==========================================================
-- VERIFICATION
-- ==========================================================
SELECT 'Follow and stats tables created successfully.' AS status;

