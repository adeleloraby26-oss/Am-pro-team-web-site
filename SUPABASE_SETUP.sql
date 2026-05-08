-- ============================================================
-- SUPABASE SETUP — Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create users table (if not already created)
CREATE TABLE IF NOT EXISTS public.users (
  id        uuid PRIMARY KEY,          -- must match auth.users.id
  uid       uuid,                       -- alias / duplicate for legacy queries
  name      text,
  username  text UNIQUE,
  gender    text,
  field     text,
  email     text UNIQUE,
  level     integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. DROP old policies if re-running
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

-- 4. INSERT — only the owner can insert their own row
CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 5. SELECT — only the owner can read their row
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 6. UPDATE — only the owner can update their row
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- IMPORTANT AUTH SETTINGS (do in Supabase Dashboard)
-- Authentication > Settings > Email:
--   • Disable "Confirm email" during development
--     OR handle the "email not confirmed" case in the app
--     (auth.js already handles both scenarios)
-- ============================================================
