-- Supabase Seed Data for Development & Testing

-- Sample Users / Profiles
INSERT INTO public.profiles (id, username, full_name, avatar_url, bio, country, city, languages, interests, role, account_status, is_online)
VALUES
('a0000000-0000-0000-0000-000000000001', 'elena_poly', 'Elena Rostova', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', 'Travel enthusiast & polyglot learning Japanese and Spanish!', 'France', 'Paris', ARRAY['French', 'English', 'Spanish'], ARRAY['Language Exchange', 'World Travel', 'Culinary & Cooking'], 'user', 'active', true),
('a0000000-0000-0000-0000-000000000002', 'kenji_tech', 'Kenji Sato', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', 'Full-stack dev exploring AI agents and retro gaming. Let us connect!', 'Japan', 'Tokyo', ARRAY['Japanese', 'English'], ARRAY['Software Development', 'AI & Robotics', 'Gaming & Esports'], 'user', 'active', true),
('a0000000-0000-0000-0000-000000000003', 'amara_globe', 'Amara Okafor', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', 'Community organizer, music festival lover, and digital nomad.', 'Nigeria', 'Lagos', ARRAY['English', 'Yoruba'], ARRAY['Music Production', 'Startups & Business', 'World Travel'], 'org_admin', 'active', true),
('a0000000-0000-0000-0000-000000000004', 'super_admin_alex', 'Alex Vance', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', 'Platform Administrator & Community Safety Lead', 'United States', 'San Francisco', ARRAY['English'], ARRAY['Software Development', 'Design & Architecture'], 'super_admin', 'active', true),
('a0000000-0000-0000-0000-000000000005', 'restricted_spammer', 'Bad Actor Test', '', 'Testing restriction functionality', 'Unknown', '', ARRAY['English'], ARRAY[], 'user', 'suspended', false)
ON CONFLICT (id) DO NOTHING;

-- Sample User Restrictions
INSERT INTO public.user_restrictions (id, user_id, can_random_match, can_video_call, can_voice_call, can_send_messages, can_host_events, reason, applied_by_admin_id)
VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', false, false, false, false, false, 'Multiple spam complaints in chat and video rooms.', 'a0000000-0000-0000-0000-000000000004')
ON CONFLICT (user_id) DO NOTHING;

-- Sample Organizations
INSERT INTO public.organizations (id, name, slug, description, logo_url, website, owner_id, is_verified)
VALUES
('c0000000-0000-0000-0000-000000000001', 'Global Nomad Explorers', 'global-nomads', 'A worldwide community uniting travelers, remote workers, and cultural lovers across 80+ nations.', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200', 'https://nomadexplorers.org', 'a0000000-0000-0000-0000-000000000003', true),
('c0000000-0000-0000-0000-000000000002', 'Tokyo Tech & Friends', 'tokyo-tech-friends', 'Monthly meetups, hackathons, and social dinners for techies and international friends in Tokyo.', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200', 'https://tokyotechfriends.com', 'a0000000-0000-0000-0000-000000000002', true)
ON CONFLICT (id) DO NOTHING;

-- Sample Events (Free & Paid)
INSERT INTO public.events (id, organization_id, title, description, banner_url, format, location_name, virtual_meeting_url, start_time, end_time, timezone, category, ticket_price, currency, max_attendees)
VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'World Cultural Cafe: Virtual Language & Music Exchange', 'Join us on video for 2 hours of international cultural exchange, live acoustic music, and breakout rooms by language!', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800', 'virtual', 'Virtual Room (Zoom / WebRTC)', 'https://meet.friendsapp.com/world-cafe', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 2 hours', 'UTC', 'Language & Cultural Exchange', 0.00, 'USD', 200),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Tokyo International Creator Summit & Mixer', 'Exclusive evening mixer for digital creators, engineers, and international friends. Includes drinks, keynote talks, and networking.', 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800', 'in_person', 'Shibuya Stream Hall, Tokyo, Japan', NULL, NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 4 hours', 'Asia/Tokyo', 'Technology & Hackathons', 25.00, 'USD', 120)
ON CONFLICT (id) DO NOTHING;

-- Sample Promo Codes
INSERT INTO public.promo_codes (id, code, organization_id, event_id, discount_type, discount_value, max_uses, times_used, min_order_amount, valid_from, valid_until, is_active)
VALUES
('e0000000-0000-0000-0000-000000000001', 'FRIENDS2026', NULL, NULL, 'percentage', 20.00, 500, 12, 10.00, NOW() - INTERVAL '1 day', NOW() + INTERVAL '60 days', true),
('e0000000-0000-0000-0000-000000000002', 'EARLYBIRD10', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'fixed_amount', 10.00, 50, 8, 20.00, NOW() - INTERVAL '1 day', NOW() + INTERVAL '10 days', true)
ON CONFLICT (id) DO NOTHING;
