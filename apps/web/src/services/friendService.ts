import { UserProfile } from '@friends/shared';
import { INITIAL_PROFILES } from './mockData';

const FRIENDS_STORAGE_KEY = 'friends_app_connected_ids';

// Default initial connected friends for realistic showcase
const DEFAULT_CONNECTED_IDS = ['usr-2', 'usr-4'];

export const friendService = {
  getConnectedFriendIds(): string[] {
    const raw = localStorage.getItem(FRIENDS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(DEFAULT_CONNECTED_IDS));
      return DEFAULT_CONNECTED_IDS;
    }
    try {
      return JSON.parse(raw);
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

  getConnectedFriends(currentUserId: string): UserProfile[] {
    const friendIds = this.getConnectedFriendIds();
    return INITIAL_PROFILES.filter(
      p => friendIds.includes(p.id) && p.id !== currentUserId
    );
  },

  getAllDiscoverable(currentUserId: string): UserProfile[] {
    return INITIAL_PROFILES.filter(p => p.id !== currentUserId && p.status === 'active');
  },
};
