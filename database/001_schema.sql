-- ============================================================
-- Inkomoko — The Living Archive
-- Database Schema (PostgreSQL)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name       VARCHAR(255) NOT NULL,
    email           VARCHAR(255) UNIQUE,
    phone           VARCHAR(20) UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(10) NOT NULL CHECK (role IN ('elder', 'youth')) DEFAULT 'youth',
    avatar_url      TEXT,
    region          VARCHAR(255),
    province        VARCHAR(255),
    language_pref   VARCHAR(20) DEFAULT 'kinyarwanda',
    cultural_background TEXT[] DEFAULT '{}',
    voice_intro_url TEXT,
    interests       TEXT[] DEFAULT '{}',
    bio             TEXT,
    clan            VARCHAR(255),
    age             INTEGER,
    onboarding_status BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- 2. FAMILIES
-- ============================================================
CREATE TABLE families (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    code            VARCHAR(20) UNIQUE NOT NULL,
    description     TEXT,
    created_by      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_families_code ON families(code);

-- ============================================================
-- 3. FAMILY MEMBERS
-- ============================================================
CREATE TABLE family_members (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id       UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'member', 'youth')) DEFAULT 'member',
    status          VARCHAR(10) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    joined_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(family_id, user_id)
);

CREATE INDEX idx_family_members_family ON family_members(family_id);
CREATE INDEX idx_family_members_user ON family_members(user_id);
CREATE INDEX idx_family_members_status ON family_members(status);

-- ============================================================
-- 4. STORIES
-- ============================================================
CREATE TABLE stories (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title                   VARCHAR(500) NOT NULL,
    description             TEXT,
    author_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    audio_url               TEXT,
    text_content            TEXT,
    category                VARCHAR(50) DEFAULT 'story',
    language                VARCHAR(20) DEFAULT 'kinyarwanda',
    visibility              VARCHAR(10) NOT NULL CHECK (visibility IN ('public', 'family')) DEFAULT 'public',
    status                  VARCHAR(10) NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
    duration_seconds        INTEGER DEFAULT 0,
    era                     VARCHAR(100),
    cover_image_url         TEXT,
    transcript_kinyarwanda  TEXT,
    transcript_english      TEXT,
    play_count              INTEGER DEFAULT 0,
    gratitude_count         INTEGER DEFAULT 0,
    family_id               UUID REFERENCES families(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stories_author ON stories(author_id);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_visibility ON stories(visibility);
CREATE INDEX idx_stories_category ON stories(category);
CREATE INDEX idx_stories_created ON stories(created_at DESC);

-- Full-text search index
CREATE INDEX idx_stories_search ON stories USING gin(
    to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(text_content, ''))
);

-- ============================================================
-- 5. STORY TAGS
-- ============================================================
CREATE TABLE story_tags (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id        UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    tag             VARCHAR(100) NOT NULL,
    UNIQUE(story_id, tag)
);

CREATE INDEX idx_story_tags_story ON story_tags(story_id);
CREATE INDEX idx_story_tags_tag ON story_tags(tag);

-- ============================================================
-- 6. BOOKMARKS
-- ============================================================
CREATE TABLE bookmarks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    story_id        UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, story_id)
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);

-- ============================================================
-- 7. GRATITUDES (Like system)
-- ============================================================
CREATE TABLE gratitudes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    story_id        UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, story_id)
);

CREATE INDEX idx_gratitudes_story ON gratitudes(story_id);

-- ============================================================
-- 8. COMMENTS
-- ============================================================
CREATE TABLE comments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id        UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_story ON comments(story_id);

-- ============================================================
-- 9. PLAY HISTORY
-- ============================================================
CREATE TABLE play_history (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    story_id            UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    progress_seconds    INTEGER DEFAULT 0,
    completed           BOOLEAN DEFAULT FALSE,
    played_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_play_history_user ON play_history(user_id);
CREATE INDEX idx_play_history_story ON play_history(story_id);

-- ============================================================
-- 10. FOLLOWERS
-- ============================================================
CREATE TABLE followers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, followed_id)
);

CREATE INDEX idx_followers_followed ON followers(followed_id);

-- ============================================================
-- 11. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(255),
    message         TEXT,
    read            BOOLEAN DEFAULT FALSE,
    reference_id    UUID,
    reference_type  VARCHAR(50),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);

-- ============================================================
-- 12. USER SETTINGS
-- ============================================================
CREATE TABLE user_settings (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daily_remembrances      BOOLEAN DEFAULT TRUE,
    family_tree_updates     BOOLEAN DEFAULT FALSE,
    listening_history_visible BOOLEAN DEFAULT TRUE,
    family_tree_visible     BOOLEAN DEFAULT TRUE,
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at
    BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
