-- Supabase Admin Moderation & Action Restrictions Schema

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
    expires_at TIMESTAMPTZ, -- NULL means permanent restriction
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_restriction UNIQUE (user_id)
);

-- Admin Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- e.g. 'ban_user', 'restrict_video', 'verify_org'
    reason TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
