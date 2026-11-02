-- ==============================================================================
-- FRIENDSCONNECT: ENABLE REAL USER REGISTRATION & PERSISTENCE
-- Copy and paste this script into your Supabase Dashboard SQL Editor and click "Run".
-- ==============================================================================

-- 1. Ensure table has open permissions so all devices can save and discover profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.webrtc_signals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- 2. Add email column if not already present
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. Grant full permissions to anonymous and authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 4. Enable Supabase Realtime replication on profiles
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
