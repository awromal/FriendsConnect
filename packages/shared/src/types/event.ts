export type EventFormat = 'virtual' | 'in_person' | 'hybrid';

export type RSVPStatus = 'going' | 'interested' | 'not_going';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  website?: string;
  ownerId: string;
  isVerified: boolean;
  memberCount: number;
  eventsHosted: number;
  createdAt: string;
}

export interface EventItem {
  id: string;
  organizationId: string;
  organization?: Organization;
  title: string;
  description: string;
  bannerUrl: string;
  format: EventFormat;
  locationName: string;
  virtualMeetingUrl?: string;
  startTime: string;
  endTime: string;
  timezone: string;
  category: string;
  ticketPrice: number; // 0 for free
  currency: string;
  maxAttendees?: number;
  currentAttendeesCount: number;
  tags: string[];
  isFeatured?: boolean;
  createdAt: string;
}

export interface EventAttendee {
  id: string;
  eventId: string;
  userId: string;
  status: RSVPStatus;
  ticketId?: string;
  rsvpAt: string;
}
