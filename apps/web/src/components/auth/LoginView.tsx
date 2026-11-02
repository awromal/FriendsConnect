import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Lock,
  Building,
  Users,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  UserPlus,
  LogIn,
  Send,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AuthSession, UserRole } from '@friends/shared';
import { authService, DEFAULT_ACCOUNTS } from '../../services/authService';
import { rateLimiter } from '../../services/rateLimiter';

interface LoginViewProps {
  onLoginSuccess: (session: AuthSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [activePortal, setActivePortal] = useState<'user' | 'organizer' | 'admin'>('user');

  // User form modes
  const [userMode, setUserMode] = useState<'signin' | 'signup'>('signin');
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('ADMIN-SECURE-2026');

  // Security Rate Limiter Cooldown (in seconds)
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(() => {
    return Math.max(
      rateLimiter.getRemainingCooldown('auth_login'),
      rateLimiter.getRemainingCooldown('auth_signup'),
      rateLimiter.getRemainingCooldown('auth_otp')
    );
  });

  // Countdown timer for rate limiter cooldown
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // State
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSentNotice, setOtpSentNotice] = useState<string | null>(null);
  const [showCredentialsHelper, setShowCredentialsHelper] = useState(true);

  // Switch portals with clean presets
  const handleSwitchPortal = (portal: 'user' | 'organizer' | 'admin') => {
    setActivePortal(portal);
    setError(null);
    setOtpSentNotice(null);
    if (portal === 'user') {
      setEmail('');
      setPassword('');
      setUserMode('signin');
    } else if (portal === 'organizer') {
      setEmail('organizer@nomadexplorers.org');
      setPassword('Organizer@2026');
    } else {
      setEmail('admin@friendsconnect.com');
      setPassword('AdminPassword@2026');
      setAdminPasscode('ADMIN-SECURE-2026');
    }
  };

  // Dispatch OTP
  const handleRequestOTP = () => {
    setError(null);
    setOtpSentNotice(null);
    try {
      const res = authService.requestOTP(email);
      setOtpSentNotice(res.message);
      if (res.previewOtp) {
        setOtpCode(res.previewOtp);
      }
    } catch (err: any) {
      const rem = rateLimiter.getRemainingCooldown('auth_otp');
      if (rem > 0) setCooldownSeconds(rem);
      setError(err.message || 'Failed to dispatch verification code.');
    }
  };

  // Submit Handler with Rate Limiter protection
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (cooldownSeconds > 0) {
      setError(`Security cooldown active. Please wait ${cooldownSeconds} seconds before trying again.`);
      return;
    }

    try {
      // 1. Sign up new user
      if (activePortal === 'user' && userMode === 'signup') {
        const session = authService.registerUser(fullName, email, password, 'user');
        onLoginSuccess(session);
        return;
      }

      // 2. User OTP login
      if (activePortal === 'user' && authMethod === 'otp') {
        const session = authService.verifyOTP(email, otpCode, 'user');
        onLoginSuccess(session);
        return;
      }

      // 3. User Password login
      if (activePortal === 'user') {
        const session = authService.loginWithPassword(email, password, 'user');
        onLoginSuccess(session);
        return;
      }

      // 4. Organizer Login
      if (activePortal === 'organizer') {
        const session = authService.loginWithPassword(email, password, 'org_admin');
        onLoginSuccess(session);
        return;
      }

      // 5. Super Admin Login
      if (activePortal === 'admin') {
        const session = authService.loginWithPassword(email, password, 'super_admin', adminPasscode);
        onLoginSuccess(session);
        return;
      }
    } catch (err: any) {
      const rem = Math.max(
        rateLimiter.getRemainingCooldown('auth_login'),
        rateLimiter.getRemainingCooldown('auth_signup'),
        rateLimiter.getRemainingCooldown('auth_otp')
      );
      if (rem > 0) {
        setCooldownSeconds(rem);
      }
      setError(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  // Auto-fill credential helper
  const handleQuickFill = (targetEmail: string, targetPass: string, targetKey?: string) => {
    setEmail(targetEmail);
    setPassword(targetPass);
    if (targetKey) setAdminPasscode(targetKey);
    setError(null);
    setOtpSentNotice(null);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="max-w-2xl mx-auto w-full relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-red-950/40 border border-red-800/40 text-red-300 text-xs font-semibold mb-3">
            <ShieldCheck className="w-4 h-4 text-red-400" />
            <span>Role-Based Authentication Gateway</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Friends<span className="text-red-500">Connect</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            Standard secure access for Community Members, Event Teams, and Administrators.
          </p>
        </div>

        {/* 3 Portal Selection Tabs */}
        <div className="flex bg-zinc-950 border border-zinc-800 p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => handleSwitchPortal('user')}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 ${
              activePortal === 'user'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-lg shadow-red-950/60'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Users Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchPortal('organizer')}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 ${
              activePortal === 'organizer'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-lg shadow-red-950/60'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>2. Event Team</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchPortal('admin')}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 ${
              activePortal === 'admin'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-lg shadow-red-950/60'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>3. Super Admin</span>
          </button>
        </div>

        {/* Main Authentication Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {/* Security Alert / Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-zinc-950 border border-zinc-700 text-rose-300 text-xs font-semibold flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block text-white">Authentication Error:</span>
                <span className="text-zinc-300 leading-relaxed">{error}</span>
              </div>
            </div>
          )}

          {/* OTP Sent Notice */}
          {otpSentNotice && (
            <div className="mb-6 p-4 rounded-2xl bg-zinc-950 border border-zinc-700 text-emerald-300 text-xs font-semibold flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <span>{otpSentNotice}</span>
            </div>
          )}

          {/* Form Header by Role */}
          <div className="text-center mb-6">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950 text-zinc-300 inline-block">
              {activePortal === 'user'
                ? 'Community Member Authentication'
                : activePortal === 'organizer'
                ? 'Event Management Lead Portal'
                : 'Platform Administration'}
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">
              {activePortal === 'user'
                ? userMode === 'signup'
                  ? 'Create New Member Account'
                  : 'Sign In to Your Account'
                : activePortal === 'organizer'
                ? 'Host & Organization Sign In'
                : 'Super Admin Security Gate'}
            </h2>
          </div>

          {/* User Sign In vs Sign Up Tabs */}
          {activePortal === 'user' && (
            <div className="flex border-b border-zinc-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setUserMode('signin');
                  setError(null);
                }}
                className={`flex-1 pb-3 text-xs font-semibold transition-all border-b-2 flex items-center justify-center space-x-2 ${
                  userMode === 'signin'
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Existing Member Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserMode('signup');
                  setError(null);
                }}
                className={`flex-1 pb-3 text-xs font-semibold transition-all border-b-2 flex items-center justify-center space-x-2 ${
                  userMode === 'signup'
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>New Member Registration</span>
              </button>
            </div>
          )}

          {/* User Sign In Method Toggle: Password vs OTP */}
          {activePortal === 'user' && userMode === 'signin' && (
            <div className="flex bg-zinc-950 p-1 rounded-xl mb-6 max-w-xs mx-auto border border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('password');
                  setError(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  authMethod === 'password'
                    ? 'bg-zinc-800 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('otp');
                  setError(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  authMethod === 'otp'
                    ? 'bg-zinc-800 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                6-Digit OTP Login
              </button>
            </div>
          )}

          {/* The Unified Secure Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name for Registration */}
            {activePortal === 'user' && userMode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-white transition-colors"
                />
              </div>
            )}

            {/* Email Field with Strict Gmail Verification */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  {activePortal === 'admin'
                    ? 'Administrator Email'
                    : activePortal === 'organizer'
                    ? 'Organization Host Email'
                    : 'Google Mail Address (@gmail.com)'}
                </label>
                {email && (
                  <span
                    className={`text-[10px] font-bold ${
                      authService.validateUserEmail(email, activePortal === 'user' ? 'user' : 'super_admin')
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {authService.validateUserEmail(email, activePortal === 'user' ? 'user' : 'super_admin')
                      ? '✓ Verified @gmail.com'
                      : activePortal === 'user'
                      ? '⚠ Only genuine @gmail.com allowed'
                      : 'Format: name@domain.com'}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={
                    activePortal === 'user'
                      ? 'yourname@gmail.com'
                      : activePortal === 'organizer'
                      ? 'organizer@nomadexplorers.org'
                      : 'admin@friendsconnect.com'
                  }
                  className={`w-full pl-10 pr-4 py-3 bg-zinc-950 border rounded-xl text-white text-xs focus:outline-none transition-colors font-mono ${
                    email && !authService.validateUserEmail(email, activePortal === 'user' ? 'user' : 'super_admin')
                      ? 'border-red-500/60 focus:border-red-500'
                      : 'border-zinc-800 focus:border-white'
                  }`}
                />
              </div>

              {/* Quick @gmail.com auto-append chip */}
              {activePortal === 'user' && email && !email.includes('@') && (
                <div className="mt-1.5 flex items-center space-x-2">
                  <span className="text-[10px] text-zinc-500">Quick complete:</span>
                  <button
                    type="button"
                    onClick={() => setEmail(`${email.trim()}@gmail.com`)}
                    className="px-2 py-0.5 rounded-lg bg-red-950/60 border border-red-800/60 hover:bg-red-900/60 text-red-300 text-[10px] font-mono font-bold transition-colors"
                  >
                    + @gmail.com
                  </button>
                </div>
              )}
            </div>

            {/* Password Field */}
            {(activePortal !== 'user' || authMethod === 'password' || userMode === 'signup') && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    {userMode === 'signup' ? 'Create Password' : 'Password'}
                  </label>
                  {userMode === 'signup' && (
                    <span className="text-[10px] text-zinc-500">Min. 6 characters</span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full pl-10 pr-10 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* OTP Field */}
            {activePortal === 'user' && userMode === 'signin' && authMethod === 'otp' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    6-Digit Security OTP Code
                  </label>
                  <button
                    type="button"
                    onClick={handleRequestOTP}
                    className="text-[11px] text-white hover:underline font-semibold flex items-center space-x-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Dispatch OTP to Email</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs tracking-widest font-mono focus:outline-none focus:border-white transition-colors text-center font-bold"
                  />
                </div>
              </div>
            )}

            {/* Master Passcode Field for Super Admin */}
            {activePortal === 'admin' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Master Admin Security Passcode
                  </label>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    ADMIN-SECURE-2026
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={adminPasscode}
                    onChange={e => setAdminPasscode(e.target.value)}
                    placeholder="ADMIN-SECURE-2026"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Rate Limit Cooldown Notice */}
            {cooldownSeconds > 0 && (
              <div className="p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-red-200 text-xs flex items-center space-x-2.5 shadow-lg shadow-red-950/50 animate-pulse">
                <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-bold">Rate Limiter Active:</span>
                  <span className="ml-1">Too many attempts. Please wait <strong className="text-white font-mono">{cooldownSeconds}s</strong> before retrying to prevent system overload.</span>
                </div>
              </div>
            )}

            {/* Submit Button with Rate Limiter protection */}
            <button
              type="submit"
              disabled={cooldownSeconds > 0}
              className={`w-full py-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 mt-4 ${
                cooldownSeconds > 0
                  ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-xl shadow-red-950/70 hover:scale-[1.01]'
              }`}
            >
              {cooldownSeconds > 0 ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-zinc-500" />
                  <span>Rate Limit Active ({cooldownSeconds}s Cooldown)</span>
                </>
              ) : activePortal === 'user' ? (
                userMode === 'signup' ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Complete Registration & Sign In</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Community</span>
                  </>
                )
              ) : activePortal === 'organizer' ? (
                <>
                  <Building className="w-4 h-4" />
                  <span>Authenticate as Event Organizer</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Credentials & Enter Admin Panel</span>
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Credentials Helper */}
          <div className="mt-6 pt-5 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setShowCredentialsHelper(!showCredentialsHelper)}
              className="w-full flex items-center justify-between text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <div className="flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                <span className="font-semibold">Registered Accounts & Passwords</span>
              </div>
              {showCredentialsHelper ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showCredentialsHelper && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                {/* User / Member */}
                {authService
                  .getRegisteredAccounts()
                  .filter(
                    a =>
                      a.role === 'user' &&
                      !['usr-1', 'usr-2', 'usr-3', 'usr-4', 'usr-5', 'usr-6', 'usr-7', 'usr-8'].includes(a.id)
                  ).length > 0 ? (
                  authService
                    .getRegisteredAccounts()
                    .filter(
                      a =>
                        a.role === 'user' &&
                        !['usr-1', 'usr-2', 'usr-3', 'usr-4', 'usr-5', 'usr-6', 'usr-7', 'usr-8'].includes(a.id)
                    )
                    .slice(0, 1)
                    .map(acc => (
                      <div
                        key={acc.id}
                        onClick={() => {
                          setActivePortal('user');
                          setUserMode('signin');
                          setAuthMethod('password');
                          handleQuickFill(acc.email, acc.password);
                        }}
                        className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-red-500/50 cursor-pointer transition-all"
                      >
                        <span className="text-white font-semibold block truncate">1. Your Account ({acc.fullName})</span>
                        <span className="text-zinc-400 font-mono text-[10px] block truncate">
                          {acc.email}
                        </span>
                        <span className="text-emerald-400 text-[10px] block font-semibold mt-0.5">
                          Click to Fill
                        </span>
                      </div>
                    ))
                ) : (
                  <div
                    onClick={() => {
                      setActivePortal('user');
                      setUserMode('signup');
                    }}
                    className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-red-500/50 cursor-pointer transition-all"
                  >
                    <span className="text-white font-semibold block">1. New Member</span>
                    <span className="text-zinc-400 text-[10px] block">
                      Click to switch to Sign Up
                    </span>
                    <span className="text-red-400 text-[10px] block font-semibold mt-0.5">
                      Create Your Real Account
                    </span>
                  </div>
                )}

                {/* Organizer */}
                <div
                  onClick={() => {
                    setActivePortal('organizer');
                    handleQuickFill('organizer@nomadexplorers.org', 'Organizer@2026');
                  }}
                  className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-600 cursor-pointer transition-all"
                >
                  <span className="text-white font-semibold block">2. Event Team (Amara)</span>
                  <span className="text-zinc-400 font-mono text-[10px] block truncate">
                    organizer@nomadexplorers.org
                  </span>
                  <span className="text-zinc-500 text-[10px] block font-mono mt-0.5">
                    Pass: Organizer@2026
                  </span>
                </div>

                {/* Admin */}
                <div
                  onClick={() => {
                    setActivePortal('admin');
                    handleQuickFill(
                      'admin@friendsconnect.com',
                      'AdminPassword@2026',
                      'ADMIN-SECURE-2026'
                    );
                  }}
                  className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-600 cursor-pointer transition-all"
                >
                  <span className="text-white font-semibold block">3. Super Admin</span>
                  <span className="text-zinc-400 font-mono text-[10px] block truncate">
                    admin@friendsconnect.com
                  </span>
                  <span className="text-zinc-500 text-[10px] block font-mono mt-0.5">
                    Pass: AdminPassword@2026
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Isolation Notice */}
        <p className="text-center text-xs text-zinc-500 mt-6 flex items-center justify-center space-x-1.5">
          <CheckCircle2 className="w-4 h-4 text-zinc-400" />
          <span>Strict Validation: Invalid credentials or unauthorized roles are denied.</span>
        </p>
      </div>
    </div>
  );
};
