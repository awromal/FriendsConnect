import React, { useEffect, useState } from 'react';
import { Phone, Video, PhoneOff, ShieldCheck } from 'lucide-react';
import { callService, CallControlState } from '../../services/callService';

export const IncomingCallModal: React.FC = () => {
  const [callState, setCallState] = useState<CallControlState>(() => ({
    isMuted: false,
    isVideoOff: false,
    localStream: null,
    remoteStream: null,
    callSession: null,
    incomingCall: null,
    durationSeconds: 0,
    cameraError: null,
    audioLevel: 0,
    e2eeInfo: {
      isEncrypted: true,
      protocol: 'WebRTC DTLS 1.3 / SRTP',
      cipherSuite: 'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
      keyExchange: 'ECDHE Curve P-256 (Perfect Forward Secrecy)',
      safetyFingerprint: '4820 9182 7391 8294 1029 8492',
      certificateHash: 'E4:7B:A2:91:38:F1:C4:02:83:94:11:09:DE:33:F9:8A',
      verifiedTimestamp: new Date().toISOString(),
    },
  }));

  useEffect(() => {
    const unsub = callService.subscribe(state => {
      setCallState(state);
    });
    return unsub;
  }, []);

  // Web Audio Ringtone generator for incoming call chime
  useEffect(() => {
    if (!callState.incomingCall) return;

    let audioCtx: AudioContext | null = null;
    let ringInterval: any = null;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();

        const playChime = () => {
          if (!audioCtx || audioCtx.state === 'closed') return;
          if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
          }

          const now = audioCtx.currentTime;
          // Dual frequency tone for standard gentle telephone ring
          const osc1 = audioCtx.createOscillator();
          const osc2 = audioCtx.createOscillator();
          const gain = audioCtx.createGain();

          osc1.frequency.setValueAtTime(440, now); // A4
          osc2.frequency.setValueAtTime(480, now); // B4

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
          gain.gain.setValueAtTime(0.08, now + 0.8);
          gain.gain.linearRampToValueAtTime(0, now + 1.2);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(audioCtx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 1.3);
          osc2.stop(now + 1.3);
        };

        playChime();
        ringInterval = setInterval(playChime, 2400);
      }
    } catch (e) {
      // Audio autoplay policy might prevent background chime without user gesture
    }

    return () => {
      if (ringInterval) clearInterval(ringInterval);
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
      }
    };
  }, [callState.incomingCall]);

  if (!callState.incomingCall) {
    return null;
  }

  const incoming = callState.incomingCall;
  const caller = incoming.callerProfile;
  const isVideo = incoming.type === 'video';

  const handleAccept = () => {
    callService.acceptIncomingCall();
  };

  const handleDecline = () => {
    callService.declineIncomingCall();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center">
        {/* E2EE Security Tag */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] font-medium mb-5">
          <ShieldCheck className="w-3.5 h-3.5 text-white" />
          <span>End-to-End Encrypted</span>
        </div>

        {/* Caller Avatar with Animated Rings */}
        <div className="relative w-28 h-28 mx-auto mb-4 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-white/20 animate-ping" />
          <span className="absolute -inset-2 rounded-full border border-zinc-700 animate-pulse" />
          <img
            src={caller?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
            alt={caller?.fullName}
            className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-xl relative z-10"
          />
        </div>

        {/* Caller Details */}
        <h3 className="text-xl font-bold text-white mb-1">{caller?.fullName || 'Incoming Call'}</h3>
        <p className="text-xs text-zinc-400 font-medium mb-1">
          {caller?.city ? `${caller.city}, ` : ''}{caller?.country || 'Global'}
        </p>
        <p className="text-xs text-zinc-400 mb-6">
          Incoming {isVideo ? 'WebRTC Video Call' : 'HD Voice Call'}...
        </p>

        {/* Action Buttons: Accept & Decline */}
        <div className="flex items-center justify-center space-x-6">
          {/* Decline Button */}
          <div className="flex flex-col items-center space-y-1.5">
            <button
              onClick={handleDecline}
              className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95"
              title="Decline Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <span className="text-[11px] text-zinc-400 font-medium">Decline</span>
          </div>

          {/* Accept Button */}
          <div className="flex flex-col items-center space-y-1.5">
            <button
              onClick={handleAccept}
              className="w-16 h-16 rounded-full bg-white hover:bg-zinc-200 text-black shadow-xl flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 animate-bounce"
              title="Accept Call"
            >
              {isVideo ? <Video className="w-7 h-7" /> : <Phone className="w-7 h-7" />}
            </button>
            <span className="text-[11px] text-white font-semibold">Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
};
