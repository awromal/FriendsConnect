import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Video,
  DollarSign,
  Ticket,
  AlertTriangle,
  Ban,
  CheckCircle,
  XCircle,
  Plus,
  Lock,
  Unlock,
  Tag,
} from 'lucide-react';
import { UserProfile, UserRestriction, PromoCode, UserReport } from '@friends/shared';
import {
  INITIAL_PROFILES,
  INITIAL_RESTRICTIONS,
  INITIAL_PROMO_CODES,
} from '../../services/mockData';

interface AdminPortalViewProps {
  currentUser?: UserProfile;
  onUnauthorizedBack?: () => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  currentUser,
  onUnauthorizedBack,
}) => {
  // Strict Role-Based Access Control Guard
  if (currentUser && currentUser.role !== 'super_admin') {
    return (
      <div className="max-w-lg mx-auto my-20 p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-2">Access Denied (403 Forbidden)</h2>
        <p className="text-xs text-zinc-400 leading-relaxed mb-6">
          You are currently signed in as <strong className="text-white">{currentUser.fullName}</strong> with role{' '}
          <span className="font-mono text-zinc-300 font-bold uppercase">{currentUser.role}</span>.
          Access to platform governance and moderation requires verified <strong className="text-white">super_admin</strong> authorization.
        </p>
        <button
          onClick={onUnauthorizedBack}
          className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          Return to Global Network
        </button>
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'promos'>('users');
  const [profiles, setProfiles] = useState<UserProfile[]>(INITIAL_PROFILES);
  const [restrictions, setRestrictions] = useState<UserRestriction[]>(INITIAL_RESTRICTIONS);
  const [promos, setPromos] = useState<PromoCode[]>(INITIAL_PROMO_CODES);
  const [reports, setReports] = useState<UserReport[]>([
    {
      id: 'rep-1',
      reporterId: 'usr-1',
      reporterUsername: 'elena_poly',
      reportedUserId: 'usr-restricted',
      reportedUsername: 'restricted_spammer',
      category: 'inappropriate_video',
      details: 'User exhibited inappropriate conduct during random video roulette.',
      status: 'action_taken',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'rep-2',
      reporterId: 'usr-2',
      reporterUsername: 'kenji_tech',
      reportedUserId: 'usr-3',
      reportedUsername: 'amara_nomad',
      category: 'spam',
      details: 'Unsolicited links posted in group chat.',
      status: 'pending',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Selected user for action restriction modal
  const [selectedUserForRestriction, setSelectedUserForRestriction] = useState<UserProfile | null>(null);
  const [restrictionForm, setRestrictionForm] = useState({
    canRandomMatch: true,
    canVideoCall: true,
    canVoiceCall: true,
    canSendMessages: true,
    canHostEvents: true,
    reason: '',
  });

  // New promo code form state
  const [showNewPromoModal, setShowNewPromoModal] = useState<boolean>(false);
  const [newPromoCode, setNewPromoCode] = useState<string>('');
  const [newPromoDiscount, setNewPromoDiscount] = useState<number>(15);
  const [newPromoType, setNewPromoType] = useState<'percentage' | 'fixed_amount'>('percentage');

  const openRestrictionModal = (user: UserProfile) => {
    setSelectedUserForRestriction(user);
    const existing = restrictions.find(r => r.userId === user.id);
    if (existing) {
      setRestrictionForm({
        canRandomMatch: existing.canRandomMatch,
        canVideoCall: existing.canVideoCall,
        canVoiceCall: existing.canVoiceCall,
        canSendMessages: existing.canSendMessages,
        canHostEvents: existing.canHostEvents,
        reason: existing.reason || '',
      });
    } else {
      setRestrictionForm({
        canRandomMatch: true,
        canVideoCall: true,
        canVoiceCall: true,
        canSendMessages: true,
        canHostEvents: true,
        reason: '',
      });
    }
  };

  const handleSaveRestriction = () => {
    if (!selectedUserForRestriction) return;

    const updated: UserRestriction = {
      id: 'rst-' + Date.now(),
      userId: selectedUserForRestriction.id,
      canRandomMatch: restrictionForm.canRandomMatch,
      canVideoCall: restrictionForm.canVideoCall,
      canVoiceCall: restrictionForm.canVoiceCall,
      canSendMessages: restrictionForm.canSendMessages,
      canHostEvents: restrictionForm.canHostEvents,
      reason: restrictionForm.reason || 'Restricted by Admin',
      appliedByAdminId: 'usr-admin',
      updatedAt: new Date().toISOString(),
    };

    setRestrictions(prev => [...prev.filter(r => r.userId !== selectedUserForRestriction.id), updated]);
    setSelectedUserForRestriction(null);
  };

  const toggleUserBan = (userId: string) => {
    setProfiles(prev =>
      prev.map(p => {
        if (p.id === userId) {
          const newStatus = p.status === 'banned' ? 'active' : 'banned';
          return { ...p, status: newStatus };
        }
        return p;
      })
    );
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;

    const created: PromoCode = {
      id: 'prm-' + Date.now(),
      code: newPromoCode.trim().toUpperCase(),
      discountType: newPromoType,
      discountValue: Number(newPromoDiscount),
      maxUses: 200,
      timesUsed: 0,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 90 * 86400000).toISOString(),
      isActive: true,
    };

    setPromos(prev => [created, ...prev]);
    setShowNewPromoModal(false);
    setNewPromoCode('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Platform Governance & Financials</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Enforce community safety guidelines, restrict actions, review abuse tickets, and manage event promo codes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-white text-black shadow-sm'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Users ({profiles.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reports'
                ? 'bg-white text-black shadow-sm'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Abuse Queue ({reports.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('promos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'promos'
                ? 'bg-white text-black shadow-sm'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Promos & Finance
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-zinc-400" />
          </div>
          <span className="text-2xl font-extrabold text-white">{profiles.length}</span>
          <span className="text-[11px] text-zinc-400 block mt-1">+12% this week</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Live WebRTC Calls</span>
            <Video className="w-4 h-4 text-zinc-400" />
          </div>
          <span className="text-2xl font-extrabold text-white">4 Active</span>
          <span className="text-[11px] text-zinc-400 block mt-1">Global connections</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Gross Ticket Revenue</span>
            <DollarSign className="w-4 h-4 text-zinc-400" />
          </div>
          <span className="text-2xl font-extrabold text-white font-mono">$2,300</span>
          <span className="text-[11px] text-zinc-400 block mt-1">92 tickets issued</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Pending Violations</span>
            <AlertTriangle className="w-4 h-4 text-zinc-400" />
          </div>
          <span className="text-2xl font-extrabold text-white">
            {reports.filter(r => r.status === 'pending').length}
          </span>
          <span className="text-[11px] text-zinc-400 block mt-1">Requires review</span>
        </div>
      </div>

      {/* TAB 1: User Management & Restriction Controls */}
      {activeTab === 'users' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Registered Users & Enforcement</h3>
            <span className="text-xs text-zinc-400">Total: {profiles.length} profiles</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Restrictions</th>
                  <th className="px-6 py-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {profiles.map(user => {
                  const userRst = restrictions.find(r => r.userId === user.id);
                  const isRestricted =
                    userRst &&
                    (!userRst.canVideoCall || !userRst.canRandomMatch || !userRst.canSendMessages);

                  return (
                    <tr key={user.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-6 py-4 flex items-center space-x-3">
                        <img
                          src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                          alt={user.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-zinc-700"
                        />
                        <div>
                          <span className="font-bold text-white block">{user.fullName}</span>
                          <span className="text-[11px] text-zinc-400">@{user.username}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4">{user.country}</td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            user.status === 'active'
                              ? 'bg-zinc-800 text-white border border-zinc-700'
                              : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                          }`}
                        >
                          {user.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {isRestricted ? (
                          <span className="text-zinc-200 font-semibold flex items-center space-x-1">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Action Restricted</span>
                          </span>
                        ) : (
                          <span className="text-zinc-500 flex items-center space-x-1">
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Standard</span>
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openRestrictionModal(user)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700 transition-all"
                        >
                          Restrict Actions
                        </button>
                        <button
                          onClick={() => toggleUserBan(user.id)}
                          className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                            user.status === 'banned'
                              ? 'bg-white hover:bg-zinc-200 text-black'
                              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
                          }`}
                        >
                          {user.status === 'banned' ? 'Unban' : 'Ban User'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Abuse Reports Queue */}
      {activeTab === 'reports' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4">Reported Users & Violations Queue</h3>
          <div className="space-y-4">
            {reports.map(rep => (
              <div
                key={rep.id}
                className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-bold text-zinc-200 uppercase text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">
                      {rep.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-white font-semibold">
                      Target: @{rep.reportedUsername}
                    </span>
                    <span className="text-xs text-zinc-500">• Filed by @{rep.reporterUsername}</span>
                  </div>
                  <p className="text-xs text-zinc-300">"{rep.details}"</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      rep.status === 'action_taken'
                        ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        : 'bg-white text-black'
                    }`}
                  >
                    {rep.status.toUpperCase()}
                  </span>
                  {rep.status === 'pending' && (
                    <button
                      onClick={() => {
                        setReports(prev =>
                          prev.map(r => (r.id === rep.id ? { ...r, status: 'action_taken' } : r))
                        );
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      Apply Suspension
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Promo Codes & Financials */}
      {activeTab === 'promos' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Promo Codes & Custom Discounts</h3>
              <p className="text-xs text-zinc-400">
                Codes used by attendees and organizations to redeem ticket discounts.
              </p>
            </div>
            <button
              onClick={() => setShowNewPromoModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Promo Code</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {promos.map(promo => (
              <div
                key={promo.id}
                className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs text-white bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700">
                      {promo.code}
                    </span>
                    <span className="text-[10px] text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-full font-bold border border-zinc-700">
                      Active
                    </span>
                  </div>
                  <h4 className="text-xl font-extrabold text-white">
                    {promo.discountType === 'percentage'
                      ? `${promo.discountValue}% OFF`
                      : `$${promo.discountValue} OFF`}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Used: {promo.timesUsed} {promo.maxUses ? `/ ${promo.maxUses} times` : 'times'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-500 flex justify-between">
                  <span>Expires: {new Date(promo.validUntil).toLocaleDateString()}</span>
                  <span className="text-zinc-300">Valid</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Restriction Modal */}
      {selectedUserForRestriction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">
              Restrict Actions for @{selectedUserForRestriction.username}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Disable specific feature permissions without terminating the account.
            </p>

            <div className="space-y-3 mb-6">
              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
                <span className="text-xs text-white font-medium">Allow Video Calling</span>
                <input
                  type="checkbox"
                  checked={restrictionForm.canVideoCall}
                  onChange={e =>
                    setRestrictionForm(f => ({ ...f, canVideoCall: e.target.checked }))
                  }
                  className="rounded w-4 h-4 accent-white"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
                <span className="text-xs text-white font-medium">Allow Voice Calling</span>
                <input
                  type="checkbox"
                  checked={restrictionForm.canVoiceCall}
                  onChange={e =>
                    setRestrictionForm(f => ({ ...f, canVoiceCall: e.target.checked }))
                  }
                  className="rounded w-4 h-4 accent-white"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
                <span className="text-xs text-white font-medium">Allow Random Matchmaking</span>
                <input
                  type="checkbox"
                  checked={restrictionForm.canRandomMatch}
                  onChange={e =>
                    setRestrictionForm(f => ({ ...f, canRandomMatch: e.target.checked }))
                  }
                  className="rounded w-4 h-4 accent-white"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
                <span className="text-xs text-white font-medium">Allow Direct Messaging</span>
                <input
                  type="checkbox"
                  checked={restrictionForm.canSendMessages}
                  onChange={e =>
                    setRestrictionForm(f => ({ ...f, canSendMessages: e.target.checked }))
                  }
                  className="rounded w-4 h-4 accent-white"
                />
              </label>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Enforcement Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inappropriate audio, spam, or misconduct"
                  value={restrictionForm.reason}
                  onChange={e => setRestrictionForm(f => ({ ...f, reason: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setSelectedUserForRestriction(null)}
                className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold hover:bg-zinc-700 border border-zinc-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRestriction}
                className="flex-1 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Save Restrictions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Promo Modal */}
      {showNewPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreatePromo}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-white mb-1">Generate Event Promo Code</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Allows users to redeem discounts during event ticketing checkout.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Code Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMERFEST30"
                  value={newPromoCode}
                  onChange={e => setNewPromoCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono uppercase text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Discount Type</label>
                  <select
                    value={newPromoType}
                    onChange={e => setNewPromoType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Value</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newPromoDiscount}
                    onChange={e => setNewPromoDiscount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowNewPromoModal(false)}
                className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold hover:bg-zinc-700 border border-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Create Promo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
