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
import { presenceService } from './services/presenceService';
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
    if (!session) {
      return {
        id: 'guest',
        username: 'guest',
        fullName: 'Guest',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
        bio: 'Guest visitor',
        country: 'Global',
        languages: ['English'],
        interests: ['Language Exchange'],
        isOnline: false,
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any;
    }

    const registered = authService
      .getRegisteredAccounts()
      .find(a => a.id === session.user.id || a.email.toLowerCase() === session.user.email?.toLowerCase());

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
      email: session.user.email,
    } as any;
  }, [session]);

  // Live online peers across devices for direct calling
  const [onlineMembers, setOnlineMembers] = useState<UserProfile[]>(() => {
    return presenceService.getOnlineUsers().filter(
      p => p.id !== currentUser?.id && !['usr-1', 'usr-2', 'usr-3', 'usr-4', 'usr-5', 'usr-6', 'usr-7', 'usr-8', 'usr-admin'].includes(p.id)
    );
  });

  useEffect(() => {
    const unsub = presenceService.subscribe((users) => {
      setOnlineMembers(
        users.filter(
          p => p.id !== currentUser?.id && !['usr-1', 'usr-2', 'usr-3', 'usr-4', 'usr-5', 'usr-6', 'usr-7', 'usr-8', 'usr-admin'].includes(p.id)
        )
      );
    });
    return () => unsub();
  }, [currentUser?.id]);

  const updateFriendsCount = React.useCallback(() => {
    if (currentUser) {
      const list = friendService.getConnectedFriends(currentUser.id);
      setFriendsCount(list.length);
    }
  }, [currentUser]);

  useEffect(() => {
    updateFriendsCount();
  }, [updateFriendsCount, session]);

  // Synchronize authenticated identity with WebRTC call service and Realtime Presence
  useEffect(() => {
    if (currentUser) {
      callService.setCurrentUser(currentUser);
      presenceService.trackUser(currentUser);
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

            {onlineMembers.length === 0 ? (
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 sm:p-10 max-w-md mx-auto text-center shadow-xl shadow-red-950/20">
                <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-950/30">
                  <Phone className="w-7 h-7" />
                </div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-bold mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Your Device is Online & Ready</span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Waiting for Another Device to Join</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  Open FriendsConnect on your mobile phone or in an incognito window. As soon as another member logs in or opens the app, they will appear here live to start calling!
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin);
                    alert('App link copied to clipboard! Open on your phone to call.');
                  }}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-950/60 flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Copy App Link</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {onlineMembers.map(member => (
                  <div
                    key={member.id}
                    className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-red-500/50 hover:shadow-xl hover:shadow-red-950/20 transition-all text-left group shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="relative">
                          <img
                            src={member.avatarUrl}
                            alt={member.fullName}
                            className="w-12 h-12 rounded-xl object-cover border border-zinc-800"
                          />
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white truncate group-hover:text-red-300 transition-colors">
                            {member.fullName}
                          </h3>
                          <span className="text-[11px] text-zinc-400 font-medium block truncate">
                            @{member.username} • {member.country}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                            ● Online Now
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-3 border-t border-zinc-800">
                      <button
                        onClick={() => callService.startCall(currentUser, member as any, 'video')}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-red-950/60 transition-all"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Video Call</span>
                      </button>
                      <button
                        onClick={() => callService.startCall(currentUser, member as any, 'voice')}
                        className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700 transition-colors"
                        title="Voice Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
