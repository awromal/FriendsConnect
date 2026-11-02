export interface RateLimitConfig {
  maxAttempts: number;       // Maximum allowed attempts in the window
  windowMs: number;          // Rolling window in milliseconds
  blockDurationMs: number;   // Lockout time in milliseconds if limit exceeded
}

interface StoredLimitData {
  timestamps: number[];
  blockedUntil?: number;
}

const STORAGE_KEY = 'friends_security_rate_limits';

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  auth_login: {
    maxAttempts: 5,
    windowMs: 60 * 1000,        // 1 minute window
    blockDurationMs: 60 * 1000, // 60s lockout
  },
  auth_signup: {
    maxAttempts: 4,
    windowMs: 60 * 1000,        // 1 minute window
    blockDurationMs: 60 * 1000, // 60s lockout
  },
  auth_otp: {
    maxAttempts: 3,
    windowMs: 60 * 1000,        // 1 minute window
    blockDurationMs: 90 * 1000, // 90s lockout
  },
  call_attempt: {
    maxAttempts: 5,
    windowMs: 30 * 1000,        // 30 seconds
    blockDurationMs: 30 * 1000, // 30s cooldown
  },
};

class RateLimiter {
  private getStore(): Record<string, StoredLimitData> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveStore(store: Record<string, StoredLimitData>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
      console.warn('[RateLimiter] Storage write error:', e);
    }
  }

  /**
   * Check if an action is currently rate-limited
   */
  public checkLimit(actionKey: string, customConfig?: Partial<RateLimitConfig>): {
    allowed: boolean;
    remainingSeconds: number;
    attemptsLeft: number;
  } {
    const config: RateLimitConfig = {
      ...(DEFAULT_CONFIGS[actionKey] || {
        maxAttempts: 5,
        windowMs: 60 * 1000,
        blockDurationMs: 60 * 1000,
      }),
      ...customConfig,
    };

    const now = Date.now();
    const store = this.getStore();
    const data: StoredLimitData = store[actionKey] || { timestamps: [] };

    // 1. Check if currently blocked
    if (data.blockedUntil && data.blockedUntil > now) {
      const remainingSeconds = Math.ceil((data.blockedUntil - now) / 1000);
      return {
        allowed: false,
        remainingSeconds,
        attemptsLeft: 0,
      };
    }

    // 2. Clean up expired timestamps outside the rolling window
    const validTimestamps = data.timestamps.filter(ts => now - ts < config.windowMs);

    // 3. Check if exceeded
    if (validTimestamps.length >= config.maxAttempts) {
      const blockedUntil = now + config.blockDurationMs;
      store[actionKey] = {
        timestamps: validTimestamps,
        blockedUntil,
      };
      this.saveStore(store);

      return {
        allowed: false,
        remainingSeconds: Math.ceil(config.blockDurationMs / 1000),
        attemptsLeft: 0,
      };
    }

    return {
      allowed: true,
      remainingSeconds: 0,
      attemptsLeft: config.maxAttempts - validTimestamps.length,
    };
  }

  /**
   * Record a new attempt and enforce limit
   * Throws Error if rate limit is exceeded
   */
  public recordAttempt(actionKey: string, customConfig?: Partial<RateLimitConfig>): void {
    const status = this.checkLimit(actionKey, customConfig);
    if (!status.allowed) {
      throw new Error(
        `Too many requests. For security and platform stability, please wait ${status.remainingSeconds} seconds before trying again.`
      );
    }

    const now = Date.now();
    const store = this.getStore();
    const data: StoredLimitData = store[actionKey] || { timestamps: [] };

    const config: RateLimitConfig = {
      ...(DEFAULT_CONFIGS[actionKey] || {
        maxAttempts: 5,
        windowMs: 60 * 1000,
        blockDurationMs: 60 * 1000,
      }),
      ...customConfig,
    };

    const validTimestamps = data.timestamps.filter(ts => now - ts < config.windowMs);
    validTimestamps.push(now);

    let blockedUntil: number | undefined = undefined;
    if (validTimestamps.length >= config.maxAttempts) {
      blockedUntil = now + config.blockDurationMs;
    }

    store[actionKey] = {
      timestamps: validTimestamps,
      blockedUntil,
    };
    this.saveStore(store);
  }

  /**
   * Reset rate limit upon successful action (e.g. successful login)
   */
  public reset(actionKey: string): void {
    const store = this.getStore();
    delete store[actionKey];
    this.saveStore(store);
  }

  /**
   * Get active lockout countdown if any
   */
  public getRemainingCooldown(actionKey: string): number {
    const status = this.checkLimit(actionKey);
    return status.allowed ? 0 : status.remainingSeconds;
  }
}

export const rateLimiter = new RateLimiter();
