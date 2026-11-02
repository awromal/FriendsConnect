import { UserProfile } from '@friends/shared';
import { supabase } from './supabaseClient';

export type PresenceListener = (users: UserProfile[]) => void;

class PresenceService {
  private channel: any = null;
  private currentUser: UserProfile | null = null;
  private isSubscribed = false;
  private listeners: Set<PresenceListener> = new Set();
  private activeOnlineUsers: Map<string, UserProfile> = new Map();

  constructor() {
    this.initPresence();
  }

  private initPresence() {
    if (!supabase) return;

    try {
      this.channel = supabase.channel('friends_online_presence', {
        config: {
          presence: { key: '' },
        },
      });

      this.channel
        .on('presence', { event: 'sync' }, () => {
          this.handlePresenceSync();
        })
        .on('presence', { event: 'join' }, ({ newPresences }: any) => {
          this.handlePresenceJoin(newPresences);
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }: any) => {
          this.handlePresenceLeave(leftPresences);
        })
        .subscribe((status: string) => {
          console.log('[Presence] Channel status:', status);
          if (status === 'SUBSCRIBED') {
            this.isSubscribed = true;
            if (this.currentUser) {
              this.trackCurrent();
            }
          }
        });

      // Keepalive heartbeat every 20 seconds
      if (typeof window !== 'undefined') {
        setInterval(() => {
          if (this.isSubscribed && this.currentUser) {
            this.trackCurrent();
          }
        }, 20000);
      }
    } catch (err) {
      console.warn('[Presence] Initialization error:', err);
    }
  }

  public trackUser(user: UserProfile) {
    this.currentUser = user;
    if (this.isSubscribed) {
      this.trackCurrent();
    }
  }

  private trackCurrent() {
    if (!this.currentUser || !this.channel) return;

    const payload = {
      id: this.currentUser.id,
      username: this.currentUser.username,
      fullName: this.currentUser.fullName,
      avatarUrl: this.currentUser.avatarUrl,
      country: this.currentUser.country || 'Global',
      languages: this.currentUser.languages || ['English'],
      interests: this.currentUser.interests || ['Language Exchange'],
      role: this.currentUser.role,
      email: (this.currentUser as any).email || `${this.currentUser.username}@friendsapp.com`,
      isOnline: true,
      lastSeen: new Date().toISOString(),
    };

    this.channel.track(payload).catch((err: any) => {
      console.warn('[Presence] Track error:', err);
    });
  }

  private handlePresenceSync() {
    if (!this.channel) return;

    try {
      const state = this.channel.presenceState();
      const updatedMap = new Map<string, UserProfile>();

      Object.values(state).forEach((presences: any) => {
        if (Array.isArray(presences)) {
          presences.forEach(p => {
            if (p && p.id && !['usr-1', 'usr-2', 'usr-3', 'usr-4', 'usr-5', 'usr-6', 'usr-7', 'usr-8'].includes(p.id)) {
              const cleanBio = (p.bio || '').replace(/<!--meta:.*?-->/g, '').trim() || 'Real online member on FriendsConnect.';
              updatedMap.set(p.id, {
                id: p.id,
                username: p.username || 'user',
                fullName: p.fullName || p.username || 'Community Member',
                avatarUrl:
                  p.avatarUrl ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
                bio: cleanBio,
                country: p.country || 'Global',
                languages: p.languages || ['English'],
                interests: p.interests || ['Language Exchange'],
                role: p.role || 'user',
                status: 'active',
                isOnline: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                email: p.email,
              } as any);
            }
          });
        }
      });

      this.activeOnlineUsers = updatedMap;
      this.notify();
    } catch (e) {
      console.warn('[Presence] Sync error:', e);
    }
  }

  private handlePresenceJoin(newPresences: any[]) {
    if (!Array.isArray(newPresences)) return;
    newPresences.forEach(p => {
      if (p && p.id && !['usr-1', 'usr-2', 'usr-3', 'usr-4', 'usr-5', 'usr-6', 'usr-7', 'usr-8'].includes(p.id)) {
        const cleanBio = (p.bio || '').replace(/<!--meta:.*?-->/g, '').trim() || 'Real online member on FriendsConnect.';
        this.activeOnlineUsers.set(p.id, {
          id: p.id,
          username: p.username || 'user',
          fullName: p.fullName || p.username || 'Community Member',
          avatarUrl:
            p.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
          bio: cleanBio,
          country: p.country || 'Global',
          languages: p.languages || ['English'],
          interests: p.interests || ['Language Exchange'],
          role: p.role || 'user',
          status: 'active',
          isOnline: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          email: p.email,
        } as any);
      }
    });
    this.notify();
  }

  private handlePresenceLeave(leftPresences: any[]) {
    if (!Array.isArray(leftPresences)) return;
    leftPresences.forEach(p => {
      if (p && p.id) {
        // Mark as offline instead of immediately deleting so user can still see them
        const existing = this.activeOnlineUsers.get(p.id);
        if (existing) {
          this.activeOnlineUsers.set(p.id, { ...existing, isOnline: false });
        }
      }
    });
    this.notify();
  }

  public getOnlineUsers(): UserProfile[] {
    return Array.from(this.activeOnlineUsers.values());
  }

  public subscribe(cb: PresenceListener): () => void {
    this.listeners.add(cb);
    cb(this.getOnlineUsers());
    return () => this.listeners.delete(cb);
  }

  private notify() {
    const list = this.getOnlineUsers();
    this.listeners.forEach(cb => cb(list));
  }
}

export const presenceService = new PresenceService();
