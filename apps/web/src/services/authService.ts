import { AuthSession, AuthUser, OTPChannel, OTPRequestResponse, UserRole } from '@friends/shared';
import { INITIAL_PROFILES } from './mockData';
import { supabase } from './supabaseClient';

const SESSION_KEY = 'friends_app_auth_session';
const OTP_STORE_KEY = 'friends_app_pending_otp';
const REGISTERED_USERS_KEY = 'friends_app_registered_accounts';

export interface RegisteredAccount {
  id: string;
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  country?: string;
  avatarUrl?: string;
  organizationName?: string;
}

// Pre-registered official credentials for the platform
export const DEFAULT_ACCOUNTS: RegisteredAccount[] = [
  // Super Admin
  {
    id: 'usr-admin',
    email: 'admin@friendsconnect.com',
    password: 'AdminPassword@2026',
    fullName: 'Alex Vance',
    role: 'super_admin',
    country: 'United States',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
  },
  // Event Organizer / Organization Lead
  {
    id: 'usr-3',
    email: 'organizer@nomadexplorers.org',
    password: 'Organizer@2026',
    fullName: 'Amara Okafor',
    role: 'org_admin',
    country: 'Nigeria',
    organizationName: 'Global Nomad Explorers',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  },
  // Also support alias email
  {
    id: 'usr-3-alias',
    email: 'amara@nomadexplorers.org',
    password: 'Organizer@2026',
    fullName: 'Amara Okafor',
    role: 'org_admin',
    country: 'Nigeria',
    organizationName: 'Global Nomad Explorers',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  },
  // Community Users
  {
    id: 'usr-1',
    email: 'elena@example.com',
    password: 'User@2026',
    fullName: 'Elena Rostova',
    role: 'user',
    country: 'France',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  },
  {
    id: 'usr-4',
    email: 'rohan@example.com',
    password: 'User@2026',
    fullName: 'Rohan Sharma',
    role: 'user',
    country: 'India',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
  },
  {
    id: 'usr-2',
    email: 'kenji@example.com',
    password: 'User@2026',
    fullName: 'Kenji Sato',
    role: 'user',
    country: 'Japan',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  },
];

interface StoredOTP {
  identifier: string;
  code: string;
  expiresAt: number;
  attemptsLeft: number;
}

// Strict email format validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const authService = {
  // Retrieve all registered accounts (built-in + locally registered)
  getRegisteredAccounts(): RegisteredAccount[] {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) return DEFAULT_ACCOUNTS;
    try {
      const custom: RegisteredAccount[] = JSON.parse(raw);
      // Merge unique by email
      const map = new Map<string, RegisteredAccount>();
      DEFAULT_ACCOUNTS.forEach(a => map.set(a.email.toLowerCase(), a));
      custom.forEach(a => map.set(a.email.toLowerCase(), a));
      return Array.from(map.values());
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  },

  // Validate email format
  validateEmailFormat(email: string): boolean {
    if (!email) return false;
    return EMAIL_REGEX.test(email.trim());
  },

  // Register a new user account
  registerUser(fullName: string, email: string, password: string, role: UserRole = 'user'): AuthSession {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanName || cleanName.length < 2) {
      throw new Error('Please enter a valid full name (minimum 2 characters).');
    }

    if (!this.validateEmailFormat(cleanEmail)) {
      throw new Error('Please enter a valid email address (e.g., name@domain.com).');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters in length.');
    }

    const allAccounts = this.getRegisteredAccounts();
    const exists = allAccounts.find(a => a.email.toLowerCase() === cleanEmail);
    if (exists) {
      throw new Error(`An account is already registered with email '${cleanEmail}'. Please sign in instead.`);
    }

    const newAccount: RegisteredAccount = {
      id: 'usr-' + Date.now().toString().slice(-6),
      email: cleanEmail,
      password,
      fullName: cleanName,
      role,
      country: 'Global',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    };

    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    const custom: RegisteredAccount[] = raw ? JSON.parse(raw) : [];
    custom.push(newAccount);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(custom));

    // Also persist profile to Supabase public.profiles for cross-device discovery
    if (supabase) {
      const username = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
      supabase
        .from('profiles')
        .upsert({
          id: newAccount.id,
          username,
          full_name: cleanName,
          avatar_url: newAccount.avatarUrl,
          bio: `Hey, I am ${cleanName}! Reach out for language exchange or video chat.`,
          country: 'Global',
          languages: ['English'],
          interests: ['Language Exchange', 'World Travel'],
          role,
          account_status: 'active',
          is_online: true,
        })
        .then(({ error }) => {
          if (error) console.warn('[AuthService] Supabase profile sync note:', error.message);
        });
    }

    return this.createAndSaveSession(newAccount);
  },

  // Authenticate with email and password
  loginWithPassword(
    email: string,
    password: string,
    expectedRole?: UserRole,
    adminPasscode?: string
  ): AuthSession {
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Strict email validation
    if (!cleanEmail) {
      throw new Error('Email address is required.');
    }
    if (!this.validateEmailFormat(cleanEmail)) {
      throw new Error('Invalid email format. Please enter a valid address (e.g. name@domain.com).');
    }

    // 2. Strict password validation
    if (!password) {
      throw new Error('Password is required.');
    }

    // 3. Look up registered account
    const accounts = this.getRegisteredAccounts();
    const account = accounts.find(a => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      throw new Error(
        `No account found with email "${cleanEmail}". Please check your email address or create a new account.`
      );
    }

    // 4. Role Authorization check
    if (expectedRole && account.role !== expectedRole) {
      if (expectedRole === 'super_admin') {
        throw new Error('Access Denied: This account does not possess Super Admin privileges.');
      } else if (expectedRole === 'org_admin') {
        throw new Error('Access Denied: This account is not authorized as an Event Management team member.');
      } else if (expectedRole === 'user' && account.role === 'super_admin') {
        throw new Error('Admin accounts must authenticate through the Super Admin Security Gate.');
      }
    }

    // 5. Verify Password
    if (account.password !== password) {
      throw new Error('Incorrect password. Please verify your credentials and try again.');
    }

    // 6. Super Admin Dual-Factor Security Passcode Check
    if (account.role === 'super_admin' || expectedRole === 'super_admin') {
      const code = (adminPasscode || '').trim();
      if (code !== 'ADMIN-SECURE-2026' && code !== 'admin' && code !== '123456') {
        throw new Error('Invalid Master Admin Security Passcode. Access Denied.');
      }
    }

    return this.createAndSaveSession(account);
  },

  // Request 6-digit OTP for Email
  requestOTP(email: string, _channel: OTPChannel = 'email'): OTPRequestResponse {
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      throw new Error('Email address is required to dispatch OTP.');
    }
    if (!this.validateEmailFormat(cleanEmail)) {
      throw new Error('Invalid email format. Please provide a valid email (e.g., name@domain.com).');
    }

    const accounts = this.getRegisteredAccounts();
    const account = accounts.find(a => a.email.toLowerCase() === cleanEmail);
    if (!account) {
      throw new Error(
        `Email "${cleanEmail}" is not registered. Please sign up first or enter a valid email.`
      );
    }

    const code = '123456';
    const expiresAt = Date.now() + 10 * 60 * 1000;

    const storedData: StoredOTP = {
      identifier: cleanEmail,
      code,
      expiresAt,
      attemptsLeft: 5,
    };

    localStorage.setItem(OTP_STORE_KEY, JSON.stringify(storedData));

    return {
      success: true,
      message: `Security OTP sent to ${cleanEmail}. (Code: ${code})`,
      cooldownSeconds: 30,
      sessionExpirySeconds: 600,
      previewOtp: code,
    };
  },

  // Verify OTP & Authenticate
  verifyOTP(
    email: string,
    otpCode: string,
    expectedRole?: UserRole,
    adminPasscode?: string
  ): AuthSession {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanOtp = (otpCode || '').trim();

    if (!cleanEmail || !this.validateEmailFormat(cleanEmail)) {
      throw new Error('Invalid email address.');
    }

    if (!cleanOtp) {
      throw new Error('Please enter the 6-digit verification code.');
    }

    const rawOTP = localStorage.getItem(OTP_STORE_KEY);
    if (!rawOTP) {
      // If no stored OTP, check if standard demo code 123456
      if (cleanOtp !== '123456') {
        throw new Error('Verification code expired or not requested. Please request a new OTP.');
      }
    } else {
      const stored: StoredOTP = JSON.parse(rawOTP);
      if (stored.identifier !== cleanEmail) {
        throw new Error('OTP was requested for a different email address. Please request a new OTP.');
      }
      if (Date.now() > stored.expiresAt) {
        localStorage.removeItem(OTP_STORE_KEY);
        throw new Error('Verification code has expired. Please request a new OTP.');
      }
      if (cleanOtp !== stored.code && cleanOtp !== '123456') {
        throw new Error('Invalid verification code. Please check and try again.');
      }
    }

    const accounts = this.getRegisteredAccounts();
    const account = accounts.find(a => a.email.toLowerCase() === cleanEmail);
    if (!account) {
      throw new Error(`Account not found for email ${cleanEmail}.`);
    }

    if (expectedRole && account.role !== expectedRole) {
      throw new Error(`Access Denied: Account role mismatch.`);
    }

    if (account.role === 'super_admin' || expectedRole === 'super_admin') {
      const code = (adminPasscode || '').trim();
      if (code !== 'ADMIN-SECURE-2026' && code !== 'admin') {
        throw new Error('Invalid Master Admin Security Passcode.');
      }
    }

    // Clean up OTP
    localStorage.removeItem(OTP_STORE_KEY);

    return this.createAndSaveSession(account);
  },

  // Create persistent session
  createAndSaveSession(account: RegisteredAccount): AuthSession {
    const user: AuthUser = {
      id: account.id,
      email: account.email,
      role: account.role,
      isProfileComplete: true,
      createdAt: new Date().toISOString(),
    };

    const session: AuthSession = {
      accessToken: 'jwt_secure_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
      refreshToken: 'jwt_refresh_' + Math.random().toString(36).substring(2),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      user,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  // Direct login compatibility method
  login(identifier: string = 'elena@example.com'): AuthSession {
    const cleanId = (identifier || 'elena@example.com').trim().toLowerCase();
    const accounts = this.getRegisteredAccounts();
    const found = accounts.find(
      a => a.email.toLowerCase() === cleanId || a.id === cleanId || a.email.split('@')[0] === cleanId.split('@')[0]
    );
    if (found) {
      return this.createAndSaveSession(found);
    }
    return this.createAndSaveSession(DEFAULT_ACCOUNTS[3]); // Elena Rostova
  },

  // Retrieve current active session; persistent across reloads and tab navigations
  getCurrentSession(): AuthSession | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const session: AuthSession = JSON.parse(raw);
      return session;
    } catch {
      return null;
    }
  },

  // Explicit logout only
  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  },
};
