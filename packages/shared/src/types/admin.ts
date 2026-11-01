export interface UserRestriction {
  id: string;
  userId: string;
  canRandomMatch: boolean;
  canVideoCall: boolean;
  canVoiceCall: boolean;
  canSendMessages: boolean;
  canHostEvents: boolean;
  reason?: string;
  appliedByAdminId: string;
  expiresAt?: string; // Null if permanent
  updatedAt: string;
}

export type ReportCategory =
  | 'harassment'
  | 'inappropriate_video'
  | 'spam'
  | 'impersonation'
  | 'scam_event'
  | 'other';

export type ReportStatus = 'pending' | 'under_review' | 'action_taken' | 'dismissed';

export interface UserReport {
  id: string;
  reporterId: string;
  reporterUsername?: string;
  reportedUserId: string;
  reportedUsername?: string;
  category: ReportCategory;
  details: string;
  evidenceUrl?: string;
  status: ReportStatus;
  reviewedByAdminId?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformMetrics {
  totalUsers: number;
  activeToday: number;
  activeVideoCalls: number;
  totalEventsHosted: number;
  totalTicketsSold: number;
  grossRevenueUSD: number;
  pendingReportsCount: number;
  unverifiedOrgsCount: number;
}
