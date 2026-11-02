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
    <>
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* 1. Brand Logo */}
            <div
              className="flex items-center space-x-2.5 cursor-pointer flex-shrink-0 group select-none"
              onClick={() => setCurrentTab('discover')}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-center font-black text-xs tracking-tighter shadow-md shadow-red-950/60 border border-red-500/30 group-hover:scale-105 transition-transform flex-shrink-0">
                FC
              </div>
              <div className="flex items-center space-x-2 whitespace-nowrap">
                <span className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  Friends<span className="text-red-500 font-black">Connect</span>
                </span>
                <span className="hidden sm:inline-flex items-center space-x-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>LIVE</span>
                </span>
              </div>
            </div>

            {/* 2. Desktop Navigation Links (Single-line, perfectly aligned) */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 overflow-x-auto scrollbar-none py-1">
              {/* Explore */}
              <button
                onClick={() => setCurrentTab('discover')}
                title="Explore Community Members"
                className={`flex items-center space-x-2 px-3 h-9 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  currentTab === 'discover'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-950/60'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Compass className="w-4 h-4 flex-shrink-0" />
                <span>Explore</span>
              </button>

              {/* Friends */}
              <button
                onClick={() => setCurrentTab('friends')}
                title="My Connected Friends"
                className={`flex items-center space-x-2 px-3 h-9 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  currentTab === 'friends'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-950/60'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>Friends</span>
                {friendsCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      currentTab === 'friends'
                        ? 'bg-black/60 text-white border border-white/20'
                        : 'bg-red-950/80 text-red-400 border border-red-800/40'
                    }`}
                  >
                    {friendsCount}
                  </span>
                )}
              </button>

              {/* Live Calls */}
              <button
                onClick={() => setCurrentTab('calls')}
                title="Live Video & Voice Calling Room"
                className={`flex items-center space-x-2 px-3 h-9 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  currentTab === 'calls'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-950/60'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Video className="w-4 h-4" />
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 absolute -top-0.5 -right-0.5 animate-pulse" />
                </div>
                <span>Live Calls</span>
              </button>

              {/* Events */}
              <button
                onClick={() => setCurrentTab('events')}
                title="Events & Tickets"
                className={`flex items-center space-x-2 px-3 h-9 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  currentTab === 'events'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-950/60'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>Events</span>
              </button>

              {/* Messages */}
              <button
                onClick={() => setCurrentTab('messages')}
                title="Encrypted Direct Messages"
                className={`flex items-center space-x-2 px-3 h-9 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  currentTab === 'messages'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-950/60'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span>Messages</span>
              </button>

              {/* Organizer Studio */}
              {isOrgAdmin && (
                <button
                  onClick={() => setCurrentTab('organizer')}
                  title="Organizer Studio"
                  className={`flex items-center space-x-2 px-3 h-9 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    currentTab === 'organizer'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-950/60'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Building className="w-4 h-4 flex-shrink-0" />
                  <span>Organizer</span>
                </button>
              )}

              {/* Super Admin Tab */}
              {isSuperAdmin && (
                <button
                  onClick={onOpenAdmin}
                  title="Super Admin Dashboard"
                  className={`flex items-center space-x-2 px-3 h-9 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    currentTab === 'admin'
                      ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950/60'
                      : 'text-red-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Shield className="w-4 h-4 flex-shrink-0 text-red-400" />
                  <span>Admin</span>
                </button>
              )}
            </nav>

            {/* 3. User Profile & Actions (Right side) */}
            <div className="flex items-center space-x-2 sm:space-x-2.5 flex-shrink-0">
              {session ? (
                <>
                  {/* Clean User Profile Badge */}
                  <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-2.5 h-9 rounded-xl flex-shrink-0">
                    <img
                      src={
                        currentUser?.avatarUrl ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                      }
                      alt={currentUser?.fullName || 'User'}
                      className="w-6 h-6 rounded-lg object-cover flex-shrink-0 border border-zinc-700"
                    />
                    <div className="hidden sm:flex flex-col text-left justify-center min-w-0">
                      <span className="text-xs font-bold text-white truncate max-w-[90px] lg:max-w-[120px] leading-tight block">
                        {currentUser?.fullName || 'Active User'}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium truncate leading-tight block">
                        {isSuperAdmin
                          ? 'Super Admin'
                          : currentUser?.role === 'org_admin'
                          ? 'Event Host'
                          : currentUser?.country || 'Member'}
                      </span>
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  <button
                    onClick={onLogout}
                    title="Sign Out of Session"
                    className="flex items-center space-x-1.5 px-3 h-9 text-xs font-semibold text-zinc-400 hover:text-red-400 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-red-900/40 rounded-xl transition-all whitespace-nowrap flex-shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="px-4 h-9 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl shadow-lg shadow-red-950/60 transition-all flex items-center justify-center whitespace-nowrap"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar for flawless phone alignment */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setCurrentTab('discover')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'discover' ? 'text-red-500 font-bold' : 'text-zinc-400'
          }`}
        >
          <Compass className="w-4 h-4 mb-0.5" />
          <span>Explore</span>
        </button>

        <button
          onClick={() => setCurrentTab('friends')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'friends' ? 'text-red-500 font-bold' : 'text-zinc-400'
          }`}
        >
          <Users className="w-4 h-4 mb-0.5" />
          <span>Friends</span>
        </button>

        <button
          onClick={() => setCurrentTab('calls')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'calls' ? 'text-red-500 font-bold' : 'text-zinc-400'
          }`}
        >
          <Video className="w-4 h-4 mb-0.5" />
          <span>Calls</span>
        </button>

        <button
          onClick={() => setCurrentTab('events')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'events' ? 'text-red-500 font-bold' : 'text-zinc-400'
          }`}
        >
          <Calendar className="w-4 h-4 mb-0.5" />
          <span>Events</span>
        </button>

        <button
          onClick={() => setCurrentTab('messages')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'messages' ? 'text-red-500 font-bold' : 'text-zinc-400'
          }`}
        >
          <MessageSquare className="w-4 h-4 mb-0.5" />
          <span>Messages</span>
        </button>

        {isOrgAdmin && (
          <button
            onClick={() => setCurrentTab('organizer')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
              currentTab === 'organizer' ? 'text-red-500 font-bold' : 'text-zinc-400'
            }`}
          >
            <Building className="w-4 h-4 mb-0.5" />
            <span>Studio</span>
          </button>
        )}

        {isSuperAdmin && (
          <button
            onClick={onOpenAdmin}
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
              currentTab === 'admin' ? 'text-red-500 font-bold' : 'text-zinc-400'
            }`}
          >
            <Shield className="w-4 h-4 mb-0.5" />
            <span>Admin</span>
          </button>
        )}
      </nav>
    </>
  );
};
