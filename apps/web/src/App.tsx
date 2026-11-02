import React, { useState, useEffect } from 'react';
import { AuthSession, UserProfile } from '@friends/shared';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/auth/LoginView';
import { DiscoverView } from './components/discover/DiscoverView';
import { MyFriendsView } from './components/friends/MyFriendsView';
import { EventsView } from './components/events/EventsView';
import { MessagesView } from './components/messages/MessagesView';
import { VideoCallOverlay } from './components/call/VideoCallOverlay';
import { IncomingCallModal } from './components/call/IncomingCallModal';
import { AdminPortalView } from './components/admin/AdminPortalView';
import { OrganizerPortalView } from './components/organizer/OrganizerPortalView';
import { ReportUserModal } from './components/modals/ReportUserModal';
import { authService } from './services/authService';
import { friendService } from './services/friendService';
import { INITIAL_PROFILES } from './services/mockData';
import { callService } from './services/callService';
import { Video, Phone, Users, Sparkles, LogOut, X } from 'lucide-react';

export const App: React.FC = () => {
  // Session is loaded directly from localStorage to guarantee persistence across page reloads
  const [session, setSession] = useState<AuthSession | null>(() => authService.getCurrentSession());
  const [currentTab, setCurrentTab] = useState<string>(() => {
    const s = authService.getCurrentSession();
    if (s?.user?.role === 'super_admin') return 'admin';
    if (s?.user?.role === 'org_admin') return 'organizer';
    return 'discover';
  });
  const [reportTarget, setReportTarget] = useState<{ id: string; username: string } | null>(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState<boolean>(false);
  const [friendsCount, setFriendsCount] = useState<number>(0);

  // Active user profile based on current logged in session
  const currentUser: UserProfile = React.useMemo(() => {
    if (!session) return INITIAL_PROFILES[0];

    const registered = authService
      .getRegisteredAccounts()
      .find(a => a.id === session.user.id || a.email.toLowerCase() === session.user.email?.toLowerCase());

    const found = INITIAL_PROFILES.find(
      p =>
        p.id === session.user.id ||
        (session.user.role === 'super_admin' && p.role === 'super_admin') ||
        (session.user.role === 'org_admin' && p.role === 'org_admin') ||
        (session.user.email && p.username.toLowerCase() === session.user.email.split('@')[0])
    );
    if (found) {
      if (registered?.fullName) return { ...found, fullName: registered.fullName, role: session.user.role };
      return found;
    }

    return {
      id: session.user.id,
      username: session.user.email ? session.user.email.split('@')[0] : 'user',
      fullName:
        registered?.fullName ||
        (session.user.role === 'super_admin'
          ? 'Alex Vance (Super Admin)'
          : session.user.role === 'org_admin'
          ? 'Event Organizer'
          : 'Active Member'),
      avatarUrl:
        registered?.avatarUrl ||
        (session.user.role === 'super_admin'
          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'),
      bio: 'Member of FriendsConnect.',
      country: registered?.country || 'Global',
      languages: ['English'],
      interests: ['World Travel', 'Language Exchange'],
      isOnline: true,
      role: session.user.role,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [session]);

  const updateFriendsCount = React.useCallback(() => {
    if (currentUser) {
      const list = friendService.getConnectedFriends(currentUser.id);
      setFriendsCount(list.length);
    }
  }, [currentUser]);

  useEffect(() => {
    updateFriendsCount();
  }, [updateFriendsCount, session]);

  // Synchronize authenticated identity with WebRTC call service for peer-to-peer signaling
  useEffect(() => {
    if (currentUser) {
      callService.setCurrentUser(currentUser);
    }
  }, [currentUser]);

  // Handle successful login with smart role routing
  const handleLoginSuccess = (newSession: AuthSession) => {
    setSession(newSession);
    if (newSession.user.role === 'super_admin') {
      setCurrentTab('admin');
    } else if (newSession.user.role === 'org_admin') {
      setCurrentTab('organizer');
    } else {
      setCurrentTab('discover');
    }
  };

  // Explicit sign out (Only triggered by user clicking the sign out confirmation)
  const handleConfirmSignOut = () => {
    authService.logout();
    setSession(null);
    setShowSignOutConfirm(false);
    setCurrentTab('discover');
  };

  const handleOpenReport = (user: UserProfile) => {
    setReportTarget({ id: user.id, username: user.username });
  };

  // If user is not logged in, render the login gate
  if (!session) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        session={session}
        currentUser={currentUser}
        friendsCount={friendsCount}
        onOpenLogin={() => {}}
        onLogout={() => setShowSignOutConfirm(true)}
        onOpenAdmin={() => setCurrentTab('admin')}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        {currentTab === 'discover' && (
          <DiscoverView
            currentUser={currentUser}
            onOpenMessage={() => setCurrentTab('messages')}
            onOpenReport={handleOpenReport}
            onFriendAdded={updateFriendsCount}
          />
        )}

        {currentTab === 'friends' && (
          <MyFriendsView
            currentUser={currentUser}
            onOpenMessage={() => setCurrentTab('messages')}
            onExploreRadar={() => setCurrentTab('discover')}
          />
        )}

        {currentTab === 'calls' && (
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-red-900/40 flex items-center justify-center mx-auto mb-4 text-red-500 shadow-xl shadow-red-950/30">
              <Video className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Live Video & Voice <span className="text-red-500">Calling Room</span></h1>
            <p className="text-sm text-zinc-400 max-w-lg mx-auto mb-8">
              Connect in crystal-clear peer-to-peer audio and video directly through your browser with end-to-end encryption.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <button
                onClick={() => {
                  const partner = INITIAL_PROFILES[1]; // Kenji
                  callService.startCall(currentUser, partner, 'video');
                }}
                className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-red-500/50 hover:shadow-xl hover:shadow-red-950/20 transition-all text-left group shadow-lg"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800 text-white flex items-center justify-center mb-3 group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-rose-600 group-hover:text-white transition-all shadow-md">
                  <Video className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-red-300 transition-colors">Kenji Sato</h3>
                <span className="text-[11px] text-zinc-400 font-medium block">Tokyo, Japan 🇯🇵</span>
                <p className="text-[10px] text-red-400 mt-2 font-semibold">WebRTC Video Call</p>
              </button>

              <button
                onClick={() => {
                  const partner = INITIAL_PROFILES[3]; // Rohan
                  callService.startCall(currentUser, partner, 'video');
                }}
                className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-red-500/50 hover:shadow-xl hover:shadow-red-950/20 transition-all text-left group shadow-lg"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800 text-white flex items-center justify-center mb-3 group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-rose-600 group-hover:text-white transition-all shadow-md">
                  <Video className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-red-300 transition-colors">Rohan Sharma</h3>
                <span className="text-[11px] text-zinc-400 font-medium block">Bengaluru, India 🇮🇳</span>
                <p className="text-[10px] text-red-400 mt-2 font-semibold">WebRTC Video Call</p>
              </button>

              <button
                onClick={() => {
                  const partner = INITIAL_PROFILES[2]; // Amara
                  callService.startCall(currentUser, partner, 'voice');
                }}
                className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-red-500/50 hover:shadow-xl hover:shadow-red-950/20 transition-all text-left group shadow-lg"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800 text-white flex items-center justify-center mb-3 group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-rose-600 group-hover:text-white transition-all shadow-md">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-red-300 transition-colors">Amara Okafor</h3>
                <span className="text-[11px] text-zinc-400 font-medium block">Lagos, Nigeria 🇳🇬</span>
                <p className="text-[10px] text-red-400 mt-2 font-semibold">HD Voice Stream</p>
              </button>
            </div>
          </div>
        )}

        {currentTab === 'events' && (
          <EventsView
            currentUserId={currentUser.id}
            currentUserName={currentUser.fullName}
            currentUserEmail={session.user.email || 'user@friendsconnect.com'}
          />
        )}

        {currentTab === 'messages' && <MessagesView currentUser={currentUser} />}

        {currentTab === 'admin' && (
          <AdminPortalView
            currentUser={currentUser}
            onUnauthorizedBack={() => setCurrentTab('discover')}
          />
        )}

        {currentTab === 'organizer' && (
          <OrganizerPortalView
            currentUser={currentUser}
            onUnauthorizedBack={() => setCurrentTab('discover')}
          />
        )}
      </main>

      {/* Persistent WebRTC Audio/Video Overlay */}
      <VideoCallOverlay
        onReportUser={(userId, username) => setReportTarget({ id: userId, username })}
      />

      {/* Cross-Tab WebRTC Incoming Call Dialog */}
      <IncomingCallModal />

      {/* Sign Out Confirmation Modal to prevent accidental logout */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-zinc-900 border border-red-900/40 rounded-2xl p-6 shadow-2xl text-center shadow-red-950/30">
            <div className="w-12 h-12 rounded-xl bg-red-950/50 border border-red-800/50 flex items-center justify-center text-red-400 mx-auto mb-3 shadow-md">
              <LogOut className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Confirm Sign Out</h3>
            <p className="text-xs text-zinc-400 mb-6">
              Are you sure you want to sign out of <strong className="text-zinc-200">{currentUser.fullName}</strong>?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs border border-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSignOut}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-red-950/60"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Reporting Modal */}
      {reportTarget && (
        <ReportUserModal
          isOpen={true}
          targetUserId={reportTarget.id}
          targetUsername={reportTarget.username}
          onClose={() => setReportTarget(null)}
          onSubmitReport={(category, details) => {
            console.log('Report submitted for admin queue:', { target: reportTarget, category, details });
          }}
        />
      )}
    </div>
  );
};
