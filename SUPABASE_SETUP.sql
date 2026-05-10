-- ============================================================
-- AM PRO — Supabase Setup (run in SQL Editor)
-- ============================================================

-- 1. Add "verified" column to users table
--    Admins set this to TRUE to give a user a verification badge
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;

-- 2. Add "bio" column to users table
--    Users write their own bio (visible to everyone)
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';

-- 3. (Already exists) avatar_url column — add if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;

-- ============================================================
-- STORAGE: Create "avatars" bucket for profile photos
-- ============================================================
-- Run this in the Supabase Dashboard → Storage → New bucket:
--   Name: avatars
--   Public: YES (so avatar URLs are accessible)
--
-- Or via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE POLICY: Allow users to upload their own avatar
-- ============================================================
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ============================================================
-- RLS POLICY: Allow users to update their own bio & avatar_url
-- (If RLS is enabled on users table)
-- ============================================================
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ============================================================
-- NOTE: "verified" field should only be set by admins.
-- Users cannot update their own "verified" column via the app.
-- To verify a user, run:
--   UPDATE users SET verified = TRUE WHERE id = '<user_id>';
-- Or use the admin panel when ready.
-- ============================================================
