import type { UserProfile } from './user';

export type CallType = 'voice' | 'video';

export type CallStatus =
  | 'idle'
  | 'initiating'
  | 'ringing'
  | 'connected'
  | 'reconnecting'
  | 'ended'
  | 'declined'
  | 'missed'
  | 'failed';

export interface CallParticipant {
  userId: string;
  profile: Partial<UserProfile>;
  isMuted: boolean;
  isVideoOff: boolean;
  streamId?: string;
}

export interface CallSession {
  callId: string;
  callerId: string;
  receiverId: string;
  type: CallType;
  status: CallStatus;
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  callerProfile?: UserProfile;
  receiverProfile?: UserProfile;
}

export type WebRTCSignalType = 'offer' | 'answer' | 'ice-candidate' | 'call-hangup' | 'call-reject';

export interface WebRTCSignalPayload {
  callId: string;
  type: WebRTCSignalType;
  senderId: string;
  receiverId: string;
  sdp?: any; // RTCSessionDescriptionInit
  candidate?: any; // RTCIceCandidateInit
  timestamp: number;
}
