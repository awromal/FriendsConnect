import React, { useState } from 'react';
import { Mail, ArrowRight, X, UserCheck, KeyRound } from 'lucide-react';
import { AuthSession } from '@friends/shared';
import { authService } from '../../services/authService';

interface OTPLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session: AuthSession) => void;
}

export const OTPLoginModal: React.FC<OTPLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [identifier, setIdentifier] = useState('elena@example.com');
  const [dummyOtp, setDummyOtp] = useState('123456');

  if (!isOpen) return null;

  const handleLogin = (targetId?: string) => {
    const id = targetId || identifier || 'elena@example.com';
    const session = authService.login(id);
    onSuccess(session);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-3 text-white">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Dummy Session Login</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Instant 1-click dummy login without any SMS/Email waiting.
          </p>
        </div>

        {/* Identifier Input */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Email or Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="e.g. elena@example.com or admin"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white transition-all"
            />
          </div>
        </div>

        {/* Dummy OTP Field */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Dummy OTP Code
            </label>
            <span className="text-[10px] text-zinc-300 font-semibold bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700 font-mono">
              Pre-filled & Verified
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <KeyRound className="w-4 h-4 text-zinc-400" />
            </div>
            <input
              type="text"
              value={dummyOtp}
              onChange={e => setDummyOtp(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm font-mono tracking-widest focus:outline-none focus:border-white"
            />
          </div>
        </div>

        {/* Direct Login Button */}
        <button
          onClick={() => handleLogin()}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm shadow-sm flex items-center justify-center space-x-2 transition-all mb-6"
        >
          <span>Log In to Account</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Quick 1-Click Persona Cards */}
        <div className="pt-4 border-t border-zinc-800">
          <p className="text-xs font-medium text-zinc-400 mb-2.5 text-center">
            Or Click to Switch Accounts Directly:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleLogin('elena@example.com')}
              className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left transition-all group"
            >
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-zinc-700">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                    alt="Elena"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-semibold text-xs text-white group-hover:text-zinc-200">
                  Elena
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 block">Regular User</span>
            </button>

            <button
              type="button"
              onClick={() => handleLogin('admin@friendsconnect.com')}
              className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left transition-all group"
            >
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-zinc-700">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
                    alt="Alex"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-semibold text-xs text-white group-hover:text-zinc-200">
                  Alex Vance
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 block">Super Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
