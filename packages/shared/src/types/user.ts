import type { UserRole } from './auth';

export type AccountStatus = 'active' | 'suspended' | 'banned';

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  country: string;
  city?: string;
  languages: string[];
  interests: string[];
  isOnline: boolean;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'blocked';

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  friendProfile?: UserProfile;
  status: FriendshipStatus;
  createdAt: string;
}

export interface MatchFilterPreferences {
  region?: string;
  preferredLanguage?: string;
  interestTags?: string[];
  allowVideoMatch?: boolean;
}

export interface IcebreakerQuestion {
  id: string;
  category: 'fun' | 'culture' | 'deep' | 'travel';
  question: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  mediaUrl?: string;
  isRead: boolean;
  createdAt: string;
}
