import React from 'react';
import { AuthSession, UserProfile } from '@friends/shared';
import {
  Compass,
  Video,
  Calendar,
  MessageSquare,
  Shield,
  LogOut,
  Users,
  Building,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  session: AuthSession | null;
  currentUser?: UserProfile;
  friendsCount: number;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  session,
  currentUser,
  friendsCount,
  onOpenLogin,
  onLogout,
  onOpenAdmin,
}) => {
  const isSuperAdmin = session?.user?.role === 'super_admin';
  const isOrgAdmin = session?.user?.role === 'org_admin' || isSuperAdmin;

  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setCurrentTab('discover')}
          >
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-black text-sm tracking-tighter">
              FC
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">
                Friends<span className="text-zinc-400">Connect</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                Community
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setCurrentTab('discover')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'discover'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore Friends</span>
            </button>

            <button
              onClick={() => setCurrentTab('friends')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'friends'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>My Friends</span>
              {friendsCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    currentTab === 'friends' ? 'bg-zinc-900 text-white' : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {friendsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('calls')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'calls'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Live Calling</span>
            </button>

            <button
              onClick={() => setCurrentTab('events')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'events'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Events & Tickets</span>
            </button>

            <button
              onClick={() => setCurrentTab('messages')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'messages'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Messages</span>
            </button>

            {isOrgAdmin && (
              <button
                onClick={() => setCurrentTab('organizer')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  currentTab === 'organizer'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Organizer Studio</span>
              </button>
            )}
          </nav>

          {/* User / Auth Actions */}
          <div className="flex items-center space-x-3">
            {isSuperAdmin && (
              <button
                onClick={onOpenAdmin}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  currentTab === 'admin'
                    ? 'bg-white text-black border-white shadow-sm'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>
            )}

            {session ? (
              <div className="flex items-center space-x-2.5">
                <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-zinc-700">
                    <img
                      src={
                        currentUser?.avatarUrl ||
                        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
                      }
                      alt={currentUser?.fullName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-bold text-white block leading-tight">
                      {currentUser?.fullName || 'Active User'}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      {isSuperAdmin
                        ? 'Super Admin'
                        : currentUser?.role === 'org_admin'
                        ? 'Event Host'
                        : currentUser?.country || 'Member'}
                    </span>
                  </div>
                </div>

                {/* Explicit Sign Out Button */}
                <button
                  onClick={onLogout}
                  title="Sign Out of Session"
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 text-xs font-bold text-black bg-white hover:bg-zinc-200 rounded-xl shadow-md transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
