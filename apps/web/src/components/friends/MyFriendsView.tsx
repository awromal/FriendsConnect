import React, { useState } from 'react';
import {
  Users,
  Video,
  Phone,
  MessageSquare,
  UserMinus,
  Sparkles,
  MapPin,
  Languages,
  Search,
  Globe,
  Compass,
} from 'lucide-react';
import { UserProfile } from '@friends/shared';
import { friendService } from '../../services/friendService';
import { callService } from '../../services/callService';

interface MyFriendsViewProps {
  currentUser: UserProfile;
  onOpenMessage: (friend: UserProfile) => void;
  onExploreRadar: () => void;
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

export const MyFriendsView: React.FC<MyFriendsViewProps> = ({
  currentUser,
  onOpenMessage,
  onExploreRadar,
}) => {
  const [friends, setFriends] = useState<UserProfile[]>(() =>
    friendService.getConnectedFriends(currentUser.id)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOnlineOnly, setFilterOnlineOnly] = useState(false);

  const handleRemoveFriend = (friendId: string) => {
    friendService.removeFriend(friendId);
    setFriends(friendService.getConnectedFriends(currentUser.id));
  };

  const handleStartCall = (friend: UserProfile, type: 'voice' | 'video') => {
    const callerWithEmail = {
      ...currentUser,
      email: (currentUser as any).email,
    };
    const targetWithEmail = {
      ...friend,
      email: (friend as any).email || `${friend.username}@example.com`,
    };
    callService.startCall(callerWithEmail as any, targetWithEmail as any, type);
  };

  const filteredFriends = friends.filter(f => {
    const matchesSearch =
      f.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOnline = filterOnlineOnly ? f.isOnline : true;
    return matchesSearch && matchesOnline;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            My <span className="text-red-500">Friends</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Stay in touch with your direct connections through high-definition video and voice calling.
          </p>
        </div>

        <button
          onClick={onExploreRadar}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-red-950/60 transition-all self-start sm:self-auto"
        >
          <Compass className="w-4 h-4" />
          <span>Explore New People</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, country, or tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <label className="flex items-center space-x-2 text-xs font-semibold text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={filterOnlineOnly}
              onChange={e => setFilterOnlineOnly(e.target.checked)}
              className="rounded bg-zinc-950 border-zinc-700 text-red-600 focus:ring-0"
            />
            <span>Online Only</span>
          </label>
          <span className="text-xs text-zinc-500">
            {filteredFriends.length} {filteredFriends.length === 1 ? 'Friend' : 'Friends'}
          </span>
        </div>
      </div>

      {/* Friends Grid */}
      {filteredFriends.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white mx-auto mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Friends Added Yet</h3>
          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            Explore community members and click "+ Add Friend" to start connecting.
          </p>
          <button
            onClick={onExploreRadar}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shadow-sm"
          >
            Explore Members
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFriends.map(friend => (
            <div
              key={friend.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Profile Row */}
                <div className="flex items-center space-x-3.5 mb-3.5">
                  <div className="relative">
                    <img
                      src={friend.avatarUrl}
                      alt={friend.fullName}
                      className="w-14 h-14 rounded-2xl object-cover border border-zinc-700"
                    />
                    {friend.isOnline && (
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-900" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <h3 className="text-base font-bold text-white truncate">
                        {friend.fullName}
                      </h3>
                      <span>{COUNTRY_FLAGS[friend.country] || '🌐'}</span>
                    </div>
                    <span className="text-xs text-zinc-400 font-medium block">
                      @{friend.username}
                    </span>
                    <span className="text-[11px] text-zinc-400 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-zinc-500" />
                      <span>{friend.city ? `${friend.city}, ` : ''}{friend.country}</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed mb-3.5">
                  "{friend.bio}"
                </p>

                {/* Languages */}
                <div className="flex items-center space-x-1.5 text-xs text-zinc-400 mb-4">
                  <Languages className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                  <span className="truncate">Speaks: {friend.languages.join(', ')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3.5 border-t border-zinc-800 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleStartCall(friend, 'video')}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-red-950/60"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video</span>
                  </button>

                  <button
                    onClick={() => handleStartCall(friend, 'voice')}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 hover:border-red-500/40 text-white border border-zinc-700 transition-all"
                    title="Voice Call"
                  >
                    <Phone className="w-4 h-4 text-zinc-300" />
                  </button>

                  <button
                    onClick={() => onOpenMessage(friend)}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 hover:border-red-500/40 text-zinc-300 hover:text-white border border-zinc-700 transition-all"
                    title="Send Message"
                  >
                    <MessageSquare className="w-4 h-4 text-zinc-300" />
                  </button>
                </div>

                <button
                  onClick={() => handleRemoveFriend(friend.id)}
                  className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-all"
                  title="Remove from Friends"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
