import React from 'react';
import { AdminPortalView } from '../../web/src/components/admin/AdminPortalView';
import { INITIAL_PROFILES } from '../../web/src/services/mockData';
import { ShieldAlert, Terminal } from 'lucide-react';

export const App: React.FC = () => {
  const adminUser = INITIAL_PROFILES.find(p => p.role === 'super_admin') || INITIAL_PROFILES[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Admin Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base text-white">FriendsConnect Admin Engine</span>
            <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono uppercase">
              Super Admin Auth Verified
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>PostgreSQL RLS Active • Port 3001</span>
        </div>
      </header>

      {/* Main Admin Portal View */}
      <AdminPortalView currentUser={adminUser} />
    </div>
  );
};
