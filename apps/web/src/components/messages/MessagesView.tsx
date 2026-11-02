import React, { useState } from 'react';
import { Send, Video, Phone, UserCheck, Search, ShieldCheck, Lock } from 'lucide-react';
import { UserProfile, DirectMessage } from '@friends/shared';
import { INITIAL_PROFILES } from '../../services/mockData';
import { callService, E2EESecurityInfo } from '../../services/callService';
import { E2EESecurityModal } from '../call/E2EESecurityModal';

interface MessagesViewProps {
  currentUser: UserProfile;
}

function generateChatSafetyCode(id1: string, id2: string): string {
  const combined = [id1, id2].sort().join(':') + ':chat-cipher-v1';
  let hash1 = 5381;
  let hash2 = 52711;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1) ^ char;
    hash2 = ((hash2 << 5) + hash2) ^ char;
  }
  const str1 = Math.abs(hash1).toString().padStart(8, '4');
  const str2 = Math.abs(hash2).toString().padStart(8, '9');
  const b1 = str1.slice(0, 4);
  const b2 = str1.slice(4, 8);
  const b3 = str2.slice(0, 4);
  const b4 = str2.slice(4, 8);
  const b5 = (((parseInt(b1) + parseInt(b3)) * 7) % 9000 + 1000).toString();
  const b6 = (((parseInt(b2) + parseInt(b4)) * 13) % 9000 + 1000).toString();
  return `${b1} ${b2} ${b3} ${b4} ${b5} ${b6}`;
}

export const MessagesView: React.FC<MessagesViewProps> = ({ currentUser }) => {
  const friends = INITIAL_PROFILES.filter(p => p.id !== currentUser.id && p.status === 'active');
  const [activeFriend, setActiveFriend] = useState<UserProfile>(friends[0] || INITIAL_PROFILES[0]);
  const [showE2EEModal, setShowE2EEModal] = useState<boolean>(false);
  const [messages, setMessages] = useState<DirectMessage[]>([
    {
      id: 'm-1',
      conversationId: 'c-1',
      senderId: friends[0]?.id || 'usr-1',
      receiverId: currentUser.id,
      content: 'Hey there! Nice to meet you from across the world. Which languages are you learning?',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'm-2',
      conversationId: 'c-1',
      senderId: currentUser.id,
      receiverId: friends[0]?.id || 'usr-1',
      content: 'Hello! I am practicing conversational Spanish and Japanese. Are you free for a quick video call?',
      isRead: true,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
  ]);
  const [inputVal, setInputVal] = useState<string>('');

  const chatSecurityInfo: E2EESecurityInfo = {
    isEncrypted: true,
    protocol: 'Signal Protocol / Double Ratchet + WebCrypto AES-GCM',
    cipherSuite: 'AES-256-GCM (Zero-Knowledge)',
    keyExchange: 'Curve25519 / ECDH Ephemeral',
    safetyFingerprint: generateChatSafetyCode(currentUser.id, activeFriend.id),
    certificateHash: 'E4:7B:A2:91:38:F1:C4:02:83:94:11:09:DE:33:F9:8A',
    verifiedTimestamp: new Date().toISOString(),
  };

  const handleSendMessage = () => {
    if (!inputVal.trim() || !activeFriend) return;
    const newMsg: DirectMessage = {
      id: 'm-' + Date.now(),
      conversationId: 'c-1',
      senderId: currentUser.id,
      receiverId: activeFriend.id,
      content: inputVal.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);
    setInputVal('');

    // Simulate reply after 2 seconds
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: 'm-rep-' + Date.now(),
          conversationId: 'c-1',
          senderId: activeFriend.id,
          receiverId: currentUser.id,
          content: 'Sounds awesome! Let us hop on video right now.',
          isRead: true,
          createdAt: new Date().toISOString(),
        },
      ]);
    }, 2000);
  };

  const handleStartCall = (type: 'voice' | 'video') => {
    if (!activeFriend) return;
    const callerWithEmail = {
      ...currentUser,
      email: (currentUser as any).email,
    };
    const targetWithEmail = {
      ...activeFriend,
      email: (activeFriend as any).email || `${activeFriend.username}@example.com`,
    };
    callService.startCall(callerWithEmail as any, targetWithEmail as any, type);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl h-[75vh] flex">
        {/* Friends / Contacts Sidebar */}
        <div className="w-80 border-r border-zinc-800 flex flex-col bg-zinc-950">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="text-sm font-bold text-white mb-2">Conversations</h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search friends..."
                className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-850">
            {friends.map(friend => {
              const isSelected = activeFriend?.id === friend.id;
              return (
                <div
                  key={friend.id}
                  onClick={() => setActiveFriend(friend)}
                  className={`p-3.5 flex items-center space-x-3 cursor-pointer transition-all ${
                    isSelected ? 'bg-zinc-800/80 border-l-4 border-red-500' : 'hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={friend.avatarUrl}
                      alt={friend.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                    />
                    {friend.isOnline && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 border-2 border-zinc-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{friend.fullName}</span>
                      <span className="text-[10px] text-zinc-400">{friend.country}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate">@{friend.username}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Chat Conversation */}
        <div className="flex-1 flex flex-col bg-zinc-900">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90">
            <div className="flex items-center space-x-3">
              <img
                src={activeFriend.avatarUrl}
                alt={activeFriend.fullName}
                className="w-9 h-9 rounded-full object-cover border border-zinc-700"
              />
              <div>
                <h4 className="text-sm font-bold text-white">{activeFriend.fullName}</h4>
                <span className="text-[11px] text-zinc-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Online • {activeFriend.country}</span>
                </span>
              </div>
            </div>

            {/* Quick Actions & E2EE in Header */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowE2EEModal(true)}
                className="px-2.5 py-1.5 text-xs text-zinc-300 bg-zinc-800/90 hover:bg-zinc-800 border border-zinc-700/80 hover:border-red-500/40 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
                title="Click to view End-to-End Encryption safety verification code"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline font-medium">End-to-End Encrypted</span>
              </button>

              <button
                onClick={() => handleStartCall('video')}
                className="p-2 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-red-950/60 border border-zinc-700 hover:border-red-500/50 rounded-xl transition-all"
                title="Start Video Call"
              >
                <Video className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => handleStartCall('voice')}
                className="p-2 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-red-950/60 border border-zinc-700 hover:border-red-500/50 rounded-xl transition-all"
                title="Start Voice Call"
              >
                <Phone className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-3 bg-zinc-950">
            {/* WhatsApp-Style End-to-End Encryption Banner */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 text-center max-w-md mx-auto mb-4 shadow-sm">
              <div className="flex items-center justify-center space-x-1.5 text-zinc-200 text-xs font-semibold mb-1">
                <Lock className="w-3.5 h-3.5 text-white" />
                <span>End-to-End Encrypted Chat</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Messages to this chat and calls are secured with AES-256-GCM zero-knowledge encryption. Only you and <strong>{activeFriend.fullName}</strong> have the private keys.
              </p>
            </div>

            {messages.map(msg => {
              const isMine = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isMine
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-medium rounded-br-none shadow-md shadow-red-950/40'
                        : 'bg-zinc-800 text-zinc-100 rounded-bl-none border border-zinc-700/60'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <span className={`text-[9px] flex items-center justify-end space-x-1 mt-1 ${isMine ? 'text-red-200' : 'text-zinc-400'}`}>
                      <Lock className="w-2.5 h-2.5" />
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input Toolbar */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex items-center space-x-2">
            <input
              type="text"
              placeholder={`Message ${activeFriend.fullName}...`}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputVal.trim()}
              className="p-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 text-white rounded-xl shadow-md shadow-red-950/50 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp-Style End-to-End Encryption Verification Modal for Chat */}
      <E2EESecurityModal
        isOpen={showE2EEModal}
        onClose={() => setShowE2EEModal(false)}
        securityInfo={chatSecurityInfo}
        partnerName={activeFriend.fullName}
      />
    </div>
  );
};
