import { UserProfile } from '@friends/shared';
import { presenceService } from './presenceService';

const FRIENDS_STORAGE_KEY = 'friends_app_connected_ids';

// No dummy friends by default - only real connections made by the user
const DEFAULT_CONNECTED_IDS: string[] = [];

export const friendService = {
  getConnectedFriendIds(): string[] {
    const raw = localStorage.getItem(FRIENDS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_CONNECTED_IDS;
    }
    try {
      const parsed = JSON.parse(raw);
      // Filter out any legacy dummy ids
      return Array.isArray(parsed)
        ? parsed.filter(id => !['usr-1', 'usr-2', 'usr-3', 'usr-4', 'usr-5', 'usr-6', 'usr-7', 'usr-8'].includes(id))
        : DEFAULT_CONNECTED_IDS;
    } catch {
      return DEFAULT_CONNECTED_IDS;
    }
  },

  isFriend(userId: string): boolean {
    const ids = this.getConnectedFriendIds();
    return ids.includes(userId);
  },

  addFriend(userId: string): void {
    const ids = this.getConnectedFriendIds();
    if (!ids.includes(userId)) {
      const updated = [...ids, userId];
      localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(updated));
    }
  },

  removeFriend(userId: string): void {
    const ids = this.getConnectedFriendIds();
    const updated = ids.filter(id => id !== userId);
    localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(updated));
  },

  getConnectedFriends(currentUserId: string, availablePool: UserProfile[] = []): UserProfile[] {
    const friendIds = this.getConnectedFriendIds();
    const pool = availablePool.length > 0 ? availablePool : presenceService.getOnlineUsers();
    return pool.filter(
      p => friendIds.includes(p.id) && p.id !== currentUserId && p.status === 'active'
    );
  },
};
