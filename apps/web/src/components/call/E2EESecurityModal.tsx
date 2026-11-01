import React, { useState } from 'react';
import { ShieldCheck, Lock, Copy, Check, X, KeyRound, Cpu } from 'lucide-react';
import { E2EESecurityInfo } from '../../services/callService';

interface E2EESecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  securityInfo: E2EESecurityInfo;
  partnerName: string;
}

export const E2EESecurityModal: React.FC<E2EESecurityModalProps> = ({
  isOpen,
  onClose,
  securityInfo,
  partnerName,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const blocks = securityInfo.safetyFingerprint.split(' ');

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(securityInfo.safetyFingerprint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>End-to-End Encryption</span>
                <span className="text-[10px] text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700 font-medium">
                  Verified
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Secured with {partnerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <div className="py-4 text-xs text-zinc-300 leading-relaxed relative z-10 border-b border-zinc-800">
          <p>
            Audio, video, and messages between you and <strong className="text-white">{partnerName}</strong> are end-to-end encrypted with zero-knowledge keys. Neither FriendsConnect, your internet provider, nor any unauthorized third party can listen to, inspect, or tamper with this conversation.
          </p>
        </div>

        {/* WhatsApp-Style Safety Number (6 Blocks) */}
        <div className="py-4 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
              <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
              <span>Safety Verification Number</span>
            </span>
            <button
              onClick={handleCopyCode}
              className="text-[11px] text-zinc-300 hover:text-white flex items-center space-x-1 font-medium px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-center">
            {blocks.map((block, idx) => (
              <div
                key={idx}
                className="py-2.5 px-1 bg-zinc-900 rounded-lg border border-zinc-800 text-white font-bold tracking-widest text-sm"
              >
                {block}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-zinc-500 mt-2 text-center">
            Compare this 24-digit fingerprint with your partner to confirm your connection is authentic and private.
          </p>
        </div>

        {/* Cryptographic Specifications */}
        <div className="pt-2 pb-4 space-y-2 relative z-10">
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Transport Security:</span>
              </span>
              <span className="text-white font-mono font-medium">{securityInfo.protocol}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400 flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                <span>Encryption Cipher:</span>
              </span>
              <span className="text-white font-mono font-medium text-[10px]">
                {securityInfo.cipherSuite.split('_').slice(1, 6).join('_')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Key Exchange:</span>
              <span className="text-zinc-200 font-mono font-medium">{securityInfo.keyExchange}</span>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2">
              <span className="text-zinc-400">Cert Fingerprint:</span>
              <span className="text-zinc-300 font-mono text-[10px] truncate max-w-[200px]">
                {securityInfo.certificateHash}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end relative z-10">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
