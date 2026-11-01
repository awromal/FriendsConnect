import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ReportCategory } from '@friends/shared';

interface ReportUserModalProps {
  isOpen: boolean;
  targetUserId: string;
  targetUsername: string;
  onClose: () => void;
  onSubmitReport: (category: ReportCategory, details: string) => void;
}

export const ReportUserModal: React.FC<ReportUserModalProps> = ({
  isOpen,
  targetUserId,
  targetUsername,
  onClose,
  onSubmitReport,
}) => {
  const [category, setCategory] = useState<ReportCategory>('harassment');
  const [details, setDetails] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;
    onSubmitReport(category, details.trim());
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-white mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">Report Submitted to Admins</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Our safety team has logged this incident and will review the call session immediately.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Report @{targetUsername}</h3>
                <p className="text-xs text-zinc-400">Sent directly to Platform Admin Moderation</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Violation Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ReportCategory)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-white transition-colors"
              >
                <option value="harassment">Harassment or abusive behavior</option>
                <option value="inappropriate_video">Inappropriate video / exposure</option>
                <option value="spam">Commercial spam or advertising</option>
                <option value="impersonation">Fake profile or impersonation</option>
                <option value="scam_event">Event ticket scam or fraudulent host</option>
                <option value="other">Other policy violation</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Description & Context</label>
              <textarea
                rows={3}
                required
                placeholder="Please describe what happened..."
                value={details}
                onChange={e => setDetails(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4 text-black" />
              <span>Submit Report for Admin Review</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
