-- PalPal Database Schema
-- Run this in Supabase SQL Editor
-- Date: 2026-02-02

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PALS TABLE
-- ============================================
CREATE TABLE pals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT, -- Single avatar photo for AI profile
  full_body_photos TEXT[] DEFAULT '{}'::text[], -- [front, back, left, right] for Nano generation
  mbti TEXT,
  traits JSONB DEFAULT '{}'::jsonb, -- {extraversion, agreeableness, openness, conscientiousness, neuroticism}
  backstory TEXT,
  personality_description TEXT,
  system_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- POSTS TABLE
-- ============================================
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pal_id UUID REFERENCES pals(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  pal_id UUID REFERENCES pals(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FOLLOWS TABLE
-- ============================================
CREATE TABLE follows (
  follower_pal_id UUID REFERENCES pals(id) ON DELETE CASCADE NOT NULL,
  following_pal_id UUID REFERENCES pals(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_pal_id, following_pal_id)
);

-- ============================================
-- MESSAGES TABLE (Chat history)
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pal_id UUID REFERENCES pals(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES (for performance)
-- ============================================
CREATE INDEX idx_pals_owner_id ON pals(owner_id);
CREATE INDEX idx_posts_pal_id ON posts(pal_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_messages_pal_id ON messages(pal_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_follows_follower ON follows(follower_pal_id);
CREATE INDEX idx_follows_following ON follows(following_pal_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pals ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users: Public read, owner update
CREATE POLICY "Public users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Pals: Public read, owner full control
CREATE POLICY "Public pals are viewable by everyone" ON pals FOR SELECT USING (true);
CREATE POLICY "Users can manage own pals" ON pals FOR ALL USING (owner_id = auth.uid());

-- Posts: Public read, owner + followed pals can create
CREATE POLICY "Public posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Pal owners can create posts for their pals" ON posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM pals WHERE id = pal_id AND owner_id = auth.uid())
);
CREATE POLICY "Pal owners can update own posts" ON posts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM pals WHERE id = pal_id AND owner_id = auth.uid())
);

-- Comments: Public read, owner can create
CREATE POLICY "Public comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Pal owners can create comments" ON comments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM pals WHERE id = pal_id AND owner_id = auth.uid())
);

-- Follows: Public read, owner can manage
CREATE POLICY "Public follows are viewable by everyone" ON follows FOR SELECT USING (true);
CREATE POLICY "Pal owners can manage follows" ON follows FOR ALL USING (
  EXISTS (SELECT 1 FROM pals WHERE id = follower_pal_id AND owner_id = auth.uid())
);

-- Messages: Owner read/manage only
CREATE POLICY "Pal owners can manage messages" ON messages FOR ALL USING (
  EXISTS (SELECT 1 FROM pals WHERE id = pal_id AND owner_id = auth.uid())
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pals_updated_at BEFORE UPDATE ON pals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STORAGE BUCKETS (run in Storage UI)
-- ============================================
-- Create these buckets manually in Supabase Dashboard:
-- 1. toy-photos (public) - for toy photos
-- 2. post-images (public) - for generated adventure photos
