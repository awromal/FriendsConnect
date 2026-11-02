import React, { useState } from 'react';
import {
  Globe,
  Shuffle,
  Video,
  Phone,
  MessageSquare,
  Sparkles,
  MapPin,
  Languages,
  ShieldAlert,
  UserPlus,
  UserCheck,
  Search,
  Filter,
  CheckCircle,
} from 'lucide-react';
import { UserProfile, IcebreakerQuestion } from '@friends/shared';
import { INITIAL_PROFILES } from '../../services/mockData';
import { SAMPLE_ICEBREAKERS, MAJOR_REGIONS } from '@friends/shared';
import { callService } from '../../services/callService';
import { friendService } from '../../services/friendService';

interface DiscoverViewProps {
  currentUser: UserProfile;
  onOpenMessage: (friend: UserProfile) => void;
  onOpenReport: (user: UserProfile) => void;
  onFriendAdded?: () => void;
}

const COUNTRY_FLAGS: Record<string, string> = {
  France: '🇫🇷',
  Japan: '🇯🇵',
  Nigeria: '🇳🇬',
  India: '🇮🇳',
  Brazil: '🇧🇷',
  Ireland: '🇮🇪',
  'South Korea': '🇰🇷',
  Germany: '🇩🇪',
  'United States': '🇺🇸',
};

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  currentUser,
  onOpenMessage,
  onOpenReport,
  onFriendAdded,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [filterOnlineOnly, setFilterOnlineOnly] = useState<boolean>(false);
  const [icebreaker, setIcebreaker] = useState<IcebreakerQuestion>(SAMPLE_ICEBREAKERS[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Available candidate pool (exclude current user)
  const candidatePool = INITIAL_PROFILES.filter(
    p => p.id !== currentUser.id && p.status === 'active'
  );

  const countries = ['All', ...Array.from(new Set(candidatePool.map(p => p.country)))];

  const filteredMembers = candidatePool.filter(p => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.city && p.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.languages.some(l => l.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.interests.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCountry = selectedCountry === 'All' || p.country === selectedCountry;
    const matchesOnline = filterOnlineOnly ? p.isOnline : true;

    return matchesSearch && matchesCountry && matchesOnline;
  });

  const handleToggleFriend = (friend: UserProfile) => {
    const isFriend = friendService.isFriend(friend.id);
    if (isFriend) {
      friendService.removeFriend(friend.id);
      showToast(`Removed @${friend.username} from your friends.`);
    } else {
      friendService.addFriend(friend.id);
      showToast(`Added ${friend.fullName} to your friends!`);
    }
    if (onFriendAdded) onFriendAdded();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartCall = (target: UserProfile, type: 'voice' | 'video') => {
    callService.startCall(currentUser, target, type);
  };

  const handleShuffleTopic = () => {
    const randomIb = SAMPLE_ICEBREAKERS[Math.floor(Math.random() * SAMPLE_ICEBREAKERS.length)];
    setIcebreaker(randomIb);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black/95 text-white border border-red-500/50 px-5 py-3 rounded-2xl shadow-2xl shadow-red-950/60 flex items-center space-x-2 text-xs font-bold animate-bounce">
          <Sparkles className="w-4 h-4 text-red-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clean, Welcoming Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Explore People & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-white">Connect</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Meet people worldwide, practice languages, and start live HD video or voice calls instantly.
          </p>
        </div>

        {/* Icebreaker Conversation Starter Widget */}
        <div className="bg-zinc-900/90 border border-red-900/30 rounded-2xl p-4 max-w-md w-full shadow-lg shadow-red-950/20 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block mb-0.5">
              💡 Conversation Icebreaker
            </span>
            <p className="text-xs text-white font-medium truncate">"{icebreaker.question}"</p>
          </div>
          <button
            onClick={handleShuffleTopic}
            title="Get another question"
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-red-950/50 hover:text-red-400 border border-zinc-700/60 hover:border-red-800/40 text-zinc-300 transition-colors"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Clean Filter & Search Control Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 mb-8 space-y-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, country, language, or interest (e.g. Japanese, Coding, Travel)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-colors"
            />
          </div>

          {/* Online Toggle */}
          <label className="flex items-center space-x-2 text-xs font-semibold text-zinc-300 cursor-pointer self-start sm:self-auto px-2">
            <input
              type="checkbox"
              checked={filterOnlineOnly}
              onChange={e => setFilterOnlineOnly(e.target.checked)}
              className="rounded bg-zinc-950 border-zinc-700 text-red-600 focus:ring-0"
            />
            <span>Online Members Only</span>
          </label>
        </div>

        {/* Country Filter Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          <span className="text-xs text-zinc-400 font-medium whitespace-nowrap mr-1">Country:</span>
          {countries.map(country => (
            <button
              key={country}
              onClick={() => setSelectedCountry(country)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCountry === country
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-950/60'
                  : 'bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 hover:border-red-900/40'
              }`}
            >
              <span>{country === 'All' ? '🌍 All Countries' : `${COUNTRY_FLAGS[country] || '📍'} ${country}`}</span>
            </button>
          ))}
        </div>
      </div>

      {/* User Profiles Grid */}
      {filteredMembers.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center max-w-md mx-auto">
          <Globe className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Members Found</h3>
          <p className="text-xs text-zinc-400 mb-4">
            Try adjusting your search query or selecting "All Countries".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCountry('All');
              setFilterOnlineOnly(false);
            }}
            className="px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-bold"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map(member => {
            const isFriend = friendService.isFriend(member.id);

            return (
              <div
                key={member.id}
                className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-red-500/40 hover:shadow-xl hover:shadow-red-950/20 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Profile Header */}
                  <div className="flex items-start space-x-3.5 mb-3.5">
                    <div className="relative">
                      <img
                        src={member.avatarUrl}
                        alt={member.fullName}
                        className="w-14 h-14 rounded-2xl object-cover border border-zinc-800 group-hover:border-red-500/50 transition-colors"
                      />
                      {member.isOnline && (
                        <span
                          className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-900 rounded-full"
                          title="Online Now"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-white truncate group-hover:text-red-300 transition-colors">
                          {member.fullName}
                        </h3>
                        <span className="text-base">{COUNTRY_FLAGS[member.country] || '🌐'}</span>
                      </div>
                      <span className="text-xs text-zinc-400 font-medium block">
                        @{member.username}
                      </span>
                      <span className="text-[11px] text-zinc-400 flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-500" />
                        <span>{member.city ? `${member.city}, ` : ''}{member.country}</span>
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-zinc-300 leading-relaxed mb-3.5 line-clamp-2">
                    "{member.bio}"
                  </p>

                  {/* Languages */}
                  <div className="flex items-center space-x-1.5 text-xs text-zinc-400 mb-3">
                    <Languages className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <span className="truncate">
                      Speaks: <strong className="text-zinc-200">{member.languages.join(', ')}</strong>
                    </span>
                  </div>

                  {/* Interest Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {member.interests.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 font-medium hover:border-red-900/40 hover:text-red-300 transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="pt-3.5 border-t border-zinc-800 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5 flex-1">
                    {/* Start Real Video Call with Red Theme */}
                    <button
                      onClick={() => handleStartCall(member, 'video')}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-red-950/60"
                      title="Start real video call"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Video</span>
                    </button>

                    {/* Start Voice Call */}
                    <button
                      onClick={() => handleStartCall(member, 'voice')}
                      className="py-2 px-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 hover:border-red-500/50 text-white text-xs font-semibold border border-zinc-700/80 transition-colors"
                      title="Start voice call"
                    >
                      <Phone className="w-3.5 h-3.5 text-zinc-300" />
                    </button>

                    {/* Message */}
                    <button
                      onClick={() => onOpenMessage(member)}
                      className="py-2 px-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 hover:border-red-500/50 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-700/80 transition-colors"
                      title="Send message"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-300" />
                    </button>
                  </div>

                  {/* Add / Friend Status */}
                  <button
                    onClick={() => handleToggleFriend(member)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      isFriend
                        ? 'bg-red-950/60 border-red-500/50 text-red-300'
                        : 'bg-zinc-950 hover:bg-zinc-800 border-zinc-800 hover:border-red-900/50 text-zinc-300'
                    }`}
                    title={isFriend ? 'Connected friend' : 'Add to friends'}
                  >
                    {isFriend ? <UserCheck className="w-4 h-4 text-red-400" /> : <UserPlus className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
