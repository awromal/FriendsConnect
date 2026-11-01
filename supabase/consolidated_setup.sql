-- ==============================================================================
-- FRIENDSCONNECT MASTER DATABASE SCHEMA & SEED SCRIPT
-- Copy and paste this entire script into your Supabase SQL Editor and click "Run".
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    avatar_url TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    country VARCHAR(100) DEFAULT 'Global',
    city VARCHAR(100) DEFAULT '',
    languages TEXT[] DEFAULT ARRAY['English']::TEXT[],
    interests TEXT[] DEFAULT ARRAY[]::TEXT[],
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'org_admin', 'super_admin')),
    account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'banned')),
    is_online BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: Automatically create public.profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Member'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        'user'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Friendships Table
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_friend_pair UNIQUE (user_id, friend_id)
);

-- 3. Direct Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    logo_url TEXT DEFAULT '',
    website TEXT DEFAULT '',
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    banner_url TEXT DEFAULT '',
    format VARCHAR(20) DEFAULT 'virtual' CHECK (format IN ('virtual', 'in_person', 'hybrid')),
    location_name TEXT NOT NULL,
    virtual_meeting_url TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    category VARCHAR(100) NOT NULL,
    ticket_price NUMERIC(10, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    max_attendees INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Event Attendees & RSVPs
CREATE TABLE IF NOT EXISTS public.event_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'going' CHECK (status IN ('going', 'interested', 'not_going')),
    rsvp_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_event_attendee UNIQUE (event_id, user_id)
);

-- 7. Call Sessions & Call Logs
CREATE TABLE IF NOT EXISTS public.call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    call_type VARCHAR(10) DEFAULT 'video' CHECK (call_type IN ('voice', 'video')),
    status VARCHAR(20) DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'connected', 'ended', 'declined', 'missed', 'failed')),
    duration_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- 8. WebRTC Signaling Events (Realtime WebSockets)
CREATE TABLE IF NOT EXISTS public.webrtc_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID NOT NULL,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    signal_type VARCHAR(20) NOT NULL CHECK (signal_type IN ('offer', 'answer', 'ice_candidate', 'hangup', 'reject')),
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. User Reports & Abuse Queue
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('harassment', 'inappropriate_video', 'spam', 'impersonation', 'scam_event', 'other')),
    details TEXT NOT NULL,
    evidence_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'action_taken', 'dismissed')),
    reviewed_by UUID REFERENCES public.profiles(id),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. User Restrictions Table (Admin Controls)
CREATE TABLE IF NOT EXISTS public.user_restrictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    can_random_match BOOLEAN DEFAULT true,
    can_video_call BOOLEAN DEFAULT true,
    can_voice_call BOOLEAN DEFAULT true,
    can_send_messages BOOLEAN DEFAULT true,
    can_host_events BOOLEAN DEFAULT true,
    reason TEXT,
    applied_by_admin_id UUID NOT NULL REFERENCES public.profiles(id),
    expires_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_restriction UNIQUE (user_id)
);

-- 11. Admin Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    reason TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Promo Codes Table
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    event_id REFERENCES public.events(id) ON DELETE CASCADE,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value NUMERIC(10, 2) NOT NULL,
    max_uses INTEGER,
    times_used INTEGER DEFAULT 0,
    min_order_amount NUMERIC(10, 2) DEFAULT 0.00,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    promo_code_id UUID REFERENCES public.promo_codes(id) ON DELETE SET NULL,
    promo_code_string VARCHAR(50),
    original_amount NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    final_amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),
    stripe_payment_intent_id VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Tickets Table
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_code VARCHAR(100) UNIQUE NOT NULL,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'valid' CHECK (status IN ('valid', 'checked_in', 'cancelled')),
    qr_payload TEXT NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Idempotent Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public profiles can be created" ON public.profiles;
CREATE POLICY "Public profiles can be created" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Events can be created by organizers" ON public.events;
CREATE POLICY "Events can be created by organizers" ON public.events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Organizations are viewable by everyone" ON public.organizations;
CREATE POLICY "Organizations are viewable by everyone" ON public.organizations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Active promo codes are viewable by everyone" ON public.promo_codes;
CREATE POLICY "Active promo codes are viewable by everyone" ON public.promo_codes FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Promo codes can be created by organizers" ON public.promo_codes;
CREATE POLICY "Promo codes can be created by organizers" ON public.promo_codes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Tickets are viewable" ON public.tickets;
CREATE POLICY "Tickets are viewable" ON public.tickets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Tickets can be issued" ON public.tickets;
CREATE POLICY "Tickets can be issued" ON public.tickets FOR INSERT WITH CHECK (true);

-- Enable Realtime
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.webrtc_signals;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.call_logs;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- INITIAL SAMPLE SEED DATA
-- ==============================================================================
INSERT INTO public.profiles (id, username, full_name, avatar_url, bio, country, city, languages, interests, role, account_status, is_online)
VALUES
('a0000000-0000-0000-0000-000000000001', 'elena_poly', 'Elena Rostova', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', 'Travel enthusiast & polyglot learning Japanese and Spanish!', 'France', 'Paris', ARRAY['French', 'English', 'Spanish'], ARRAY['Language Exchange', 'World Travel', 'Culinary & Cooking'], 'user', 'active', true),
('a0000000-0000-0000-0000-000000000002', 'kenji_tech', 'Kenji Sato', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', 'Full-stack dev exploring AI agents and retro gaming. Let us connect!', 'Japan', 'Tokyo', ARRAY['Japanese', 'English'], ARRAY['Software Development', 'AI & Robotics', 'Gaming & Esports'], 'user', 'active', true),
('a0000000-0000-0000-0000-000000000003', 'amara_globe', 'Amara Okafor', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', 'Community organizer, music festival lover, and digital nomad.', 'Nigeria', 'Lagos', ARRAY['English', 'Yoruba'], ARRAY['Music Production', 'Startups & Business', 'World Travel'], 'org_admin', 'active', true),
('a0000000-0000-0000-0000-000000000004', 'super_admin_alex', 'Alex Vance', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', 'Platform Administrator & Community Safety Lead', 'United States', 'San Francisco', ARRAY['English'], ARRAY['Software Development', 'Design & Architecture'], 'super_admin', 'active', true),
('a0000000-0000-0000-0000-000000000005', 'restricted_spammer', 'Bad Actor Test', '', 'Testing restriction functionality', 'Unknown', '', ARRAY['English'], ARRAY[], 'user', 'suspended', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.organizations (id, name, slug, description, logo_url, website, owner_id, is_verified)
VALUES
('c0000000-0000-0000-0000-000000000001', 'Global Nomad Explorers', 'global-nomads', 'A worldwide community uniting travelers, remote workers, and cultural lovers across 80+ nations.', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200', 'https://nomadexplorers.org', 'a0000000-0000-0000-0000-000000000003', true),
('c0000000-0000-0000-0000-000000000002', 'Tokyo Tech & Friends', 'tokyo-tech-friends', 'Monthly meetups, hackathons, and social dinners for techies and international friends in Tokyo.', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200', 'https://tokyotechfriends.com', 'a0000000-0000-0000-0000-000000000002', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.events (id, organization_id, title, description, banner_url, format, location_name, virtual_meeting_url, start_time, end_time, timezone, category, ticket_price, currency, max_attendees)
VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'World Cultural Cafe: Virtual Language & Music Exchange', 'Join us on video for 2 hours of international cultural exchange, live acoustic music, and breakout rooms by language!', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800', 'virtual', 'Virtual Room (Zoom / WebRTC)', 'https://meet.friendsapp.com/world-cafe', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 2 hours', 'UTC', 'Language & Cultural Exchange', 0.00, 'USD', 200),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Tokyo International Creator Summit & Mixer', 'Exclusive evening mixer for digital creators, engineers, and international friends. Includes drinks, keynote talks, and networking.', 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800', 'in_person', 'Shibuya Stream Hall, Tokyo, Japan', NULL, NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 4 hours', 'Asia/Tokyo', 'Technology & Hackathons', 25.00, 'USD', 120)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.promo_codes (id, code, organization_id, event_id, discount_type, discount_value, max_uses, times_used, min_order_amount, valid_from, valid_until, is_active)
VALUES
('e0000000-0000-0000-0000-000000000001', 'FRIENDS2026', NULL, NULL, 'percentage', 20.00, 500, 12, 10.00, NOW() - INTERVAL '1 day', NOW() + INTERVAL '60 days', true),
('e0000000-0000-0000-0000-000000000002', 'EARLYBIRD10', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'fixed_amount', 10.00, 50, 8, 20.00, NOW() - INTERVAL '1 day', NOW() + INTERVAL '10 days', true)
ON CONFLICT (id) DO NOTHING;
