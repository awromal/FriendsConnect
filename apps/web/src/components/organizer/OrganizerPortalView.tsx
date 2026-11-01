import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Ticket,
  Users,
  DollarSign,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Sparkles,
  Tag,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';
import { UserProfile, EventItem, PromoCode } from '@friends/shared';
import { eventService } from '../../services/eventService';

interface OrganizerPortalViewProps {
  currentUser: UserProfile;
  onUnauthorizedBack?: () => void;
}

export const OrganizerPortalView: React.FC<OrganizerPortalViewProps> = ({
  currentUser,
  onUnauthorizedBack,
}) => {
  const [events, setEvents] = useState<EventItem[]>(() => eventService.getEvents());
  const [promos, setPromos] = useState<PromoCode[]>(() => eventService.getPromoCodes());
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showPromoModal, setShowPromoModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newFormat, setNewFormat] = useState<'virtual' | 'in_person'>('virtual');
  const [newLocation, setNewLocation] = useState('Virtual WebRTC Lounge');
  const [newPrice, setNewPrice] = useState('0');
  const [newCategory, setNewCategory] = useState('Language & Cultural Exchange');
  const [newDescription, setNewDescription] = useState('');

  // New Promo Code Form State
  const [promoCodeName, setPromoCodeName] = useState('');
  const [promoDiscountVal, setPromoDiscountVal] = useState('15');
  const [promoDiscountType, setPromoDiscountType] = useState<'percentage' | 'fixed_amount'>('percentage');

  // Security Role Guard: Only org_admin or super_admin may access
  if (currentUser.role !== 'org_admin' && currentUser.role !== 'super_admin') {
    return (
      <div className="max-w-lg mx-auto my-20 p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white mx-auto mb-4">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-2">Organizer Authorization Required</h2>
        <p className="text-xs text-zinc-400 leading-relaxed mb-6">
          You are currently signed in as <strong className="text-white">{currentUser.fullName}</strong> ({currentUser.role}).
          Only registered Event Organizers (<span className="font-mono text-zinc-300">org_admin</span>) or Super Admins can access this hub.
        </p>
        <button
          onClick={onUnauthorizedBack}
          className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          Return to Global Network
        </button>
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: EventItem = {
      id: 'evt-' + Date.now(),
      organizationId: 'org-1',
      organization: {
        id: 'org-1',
        name: 'Global Nomad Explorers',
        slug: 'global-nomads',
        description: 'Worldwide community hosting international cultural exchanges.',
        logoUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200',
        ownerId: currentUser.id,
        isVerified: true,
        memberCount: 2450,
        eventsHosted: events.length + 1,
        createdAt: new Date().toISOString(),
      },
      title: newTitle.trim(),
      description: newDescription || 'Exclusive community gathering hosted on FriendsConnect.',
      bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
      format: newFormat,
      locationName: newLocation,
      ticketPrice: parseFloat(newPrice) || 0,
      currency: 'USD',
      startTime: new Date(Date.now() + 86400000 * 3).toISOString(),
      endTime: new Date(Date.now() + 86400000 * 3 + 7200000).toISOString(),
      timezone: 'UTC',
      category: newCategory,
      currentAttendeesCount: 1,
      tags: ['Official', newFormat === 'virtual' ? 'Virtual' : 'In-Person'],
      createdAt: new Date().toISOString(),
    };

    setEvents(prev => [created, ...prev]);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
    showToast(`Event "${created.title}" published successfully!`);
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeName.trim()) return;

    const code: PromoCode = {
      id: 'prm-' + Date.now(),
      code: promoCodeName.trim().toUpperCase(),
      discountType: promoDiscountType,
      discountValue: parseFloat(promoDiscountVal) || 10,
      timesUsed: 0,
      maxUses: 100,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 60 * 86400000).toISOString(),
      isActive: true,
      minOrderAmount: 10,
    };

    setPromos(prev => [code, ...prev]);
    setShowPromoModal(false);
    setPromoCodeName('');
    showToast(`Promo code ${code.code} is now live!`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-bold border border-zinc-700 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>Event Management & Organization Studio</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Event Organizer Portal</h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl">
            Host and publish virtual WebRTC sessions or in-person mixers, issue discount promo codes, and track ticket registrations.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowPromoModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold transition-all"
          >
            <Tag className="w-4 h-4 text-zinc-300" />
            <span>Issue Promo Code</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Host New Event</span>
          </button>
        </div>
      </div>

      {/* Organization Status & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Organization Status</span>
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-extrabold text-white flex items-center space-x-1.5">
            <span>Verified Host</span>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          </span>
          <span className="text-[11px] text-zinc-400 block mt-1">Official Partner</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Events Published</span>
            <Calendar className="w-4 h-4 text-zinc-400" />
          </div>
          <span className="text-2xl font-extrabold text-white">{events.length}</span>
          <span className="text-[11px] text-zinc-400 block mt-1">Active Community</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Total Attendees</span>
            <Users className="w-4 h-4 text-zinc-400" />
          </div>
          <span className="text-2xl font-extrabold text-white">176</span>
          <span className="text-[11px] text-zinc-400 block mt-1">Registered guests</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Ticket Sales Revenue</span>
            <DollarSign className="w-4 h-4 text-zinc-400" />
          </div>
          <span className="text-2xl font-extrabold text-white font-mono">$2,300.00</span>
          <span className="text-[11px] text-zinc-400 block mt-1">Stripe Payouts Ready</span>
        </div>
      </div>

      {/* Hosted Events List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl mb-8">
        <h3 className="text-base font-bold text-white mb-4">Your Hosted Events</h3>
        <div className="space-y-4">
          {events.map(event => (
            <div
              key={event.id}
              className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-3.5">
                <img
                  src={event.bannerUrl}
                  alt={event.title}
                  className="w-16 h-16 rounded-xl object-cover border border-zinc-800 flex-shrink-0"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        event.format === 'virtual'
                          ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                          : 'bg-white text-black'
                      }`}
                    >
                      {event.format}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {new Date(event.startTime).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{event.title}</h4>
                  <span className="text-xs text-zinc-500 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-zinc-400" />
                    <span>{event.locationName}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 sm:text-right">
                <div>
                  <span className="text-xs font-bold text-white font-mono block">
                    {event.ticketPrice === 0 ? 'FREE' : `$${event.ticketPrice.toFixed(2)}`}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {event.currentAttendeesCount} RSVPs
                  </span>
                </div>
                <span className="px-3 py-1 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold">
                  Published
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Organization Promo Codes */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Active Promo Codes for Your Events</h3>
          <span className="text-xs text-zinc-400">Applied by attendees at checkout</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {promos.map(p => (
            <div key={p.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-xs text-white bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-700">
                  {p.code}
                </span>
                <span className="text-[10px] text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-full font-bold border border-zinc-700">
                  Active
                </span>
              </div>
              <h4 className="text-lg font-bold text-white">
                {p.discountType === 'percentage' ? `${p.discountValue}% OFF` : `$${p.discountValue} OFF`}
              </h4>
              <span className="text-[11px] text-zinc-500 block mt-1">Used {p.timesUsed} times</span>
            </div>
          ))}
        </div>
      </div>

      {/* Host New Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateEvent}
            className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Host & Publish New Event</h3>
            <p className="text-xs text-zinc-400 mb-6">
              Create a virtual WebRTC session or an in-person regional meetup.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. World Food & Language Cafe"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Format</label>
                  <select
                    value={newFormat}
                    onChange={e => setNewFormat(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-white transition-colors"
                  >
                    <option value="virtual">Virtual WebRTC Lounge</option>
                    <option value="in_person">In-Person Meetup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Ticket Price ($ USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 for Free RSVP"
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Location or Room Link</label>
                <input
                  type="text"
                  required
                  placeholder={newFormat === 'virtual' ? 'https://meet.friendsconnect.com/room' : 'Venue address, City, Country'}
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Tell people what to expect, language practice rooms, acoustic sets, etc."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold hover:bg-zinc-700 border border-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Publish Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Issue Promo Code Modal */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreatePromo}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setShowPromoModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Issue Organizer Promo Code</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Create a custom code for your community members to redeem ticket discounts.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Promo Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NOMAD20"
                  value={promoCodeName}
                  onChange={e => setPromoCodeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono uppercase text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Discount Type</label>
                  <select
                    value={promoDiscountType}
                    onChange={e => setPromoDiscountType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-white transition-colors"
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
                    required
                    value={promoDiscountVal}
                    onChange={e => setPromoDiscountVal(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold hover:bg-zinc-700 border border-zinc-700 transition-colors"
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
