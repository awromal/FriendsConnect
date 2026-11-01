export type UserRole = 'user' | 'org_admin' | 'super_admin';

export type OTPChannel = 'email' | 'sms';

export interface OTPRequestPayload {
  identifier: string; // email address or E.164 phone number
  channel: OTPChannel;
}

export interface OTPRequestResponse {
  success: boolean;
  message: string;
  cooldownSeconds: number;
  sessionExpirySeconds: number;
  // Included in dev/mock environments for testing convenience
  previewOtp?: string;
}

export interface VerifyOTPPayload {
  identifier: string;
  token: string;
  channel: OTPChannel;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  role: UserRole;
  isProfileComplete: boolean;
  createdAt: string;
}
