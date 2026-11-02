import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Ticket as TicketIcon,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { EventItem, Ticket } from '@friends/shared';
import { eventService } from '../../services/eventService';
import { StripeCheckoutModal } from '../checkout/StripeCheckoutModal';
import { TicketModal } from '../tickets/TicketModal';

interface EventsViewProps {
  currentUserId: string;
  currentUserName: string;
  currentUserEmail: string;
}

export const EventsView: React.FC<EventsViewProps> = ({
  currentUserId,
  currentUserName,
  currentUserEmail,
}) => {
  const [events] = useState<EventItem[]>(eventService.getEvents());
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [issuedTicket, setIssuedTicket] = useState<Ticket | null>(null);
  const [userTickets, setUserTickets] = useState<Ticket[]>(eventService.getUserTickets());

  const handleCheckout = (event: EventItem) => {
    setSelectedEvent(event);
  };

  const handleTicketIssued = (ticket: Ticket) => {
    setSelectedEvent(null);
    setIssuedTicket(ticket);
    setUserTickets(eventService.getUserTickets());
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-800/40 text-red-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>Community Events & Organizations</span>
          </div>
          <h1 className="text-3xl font-black text-white">Global Events & <span className="text-red-500">Experiences</span></h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl">
            Join virtual rooms, cultural exchanges, and local international mixers organized by verified global communities.
          </p>
        </div>

        {userTickets.length > 0 && (
          <div className="bg-zinc-900/90 border border-red-900/40 px-4 py-2.5 rounded-2xl flex items-center space-x-3 shadow-lg shadow-red-950/20">
            <TicketIcon className="w-5 h-5 text-red-400" />
            <div>
              <span className="text-xs text-zinc-400 block">Your Active Tickets</span>
              <span className="text-sm font-bold text-white">{userTickets.length} Event Pass(es)</span>
            </div>
          </div>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(event => {
          const isFree = event.ticketPrice === 0;

          return (
            <div
              key={event.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-red-500/40 transition-all flex flex-col shadow-lg hover:shadow-xl hover:shadow-red-950/20 group"
            >
              {/* Event Banner */}
              <div className="relative h-48 w-full bg-zinc-950 overflow-hidden">
                <img
                  src={event.bannerUrl}
                  alt={event.title}
                  className="w-full h-full object-cover transform hover:scale-105 transition-all duration-500"
                />
                <div className="absolute top-3 left-3 flex space-x-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md uppercase tracking-wider ${
                      event.format === 'virtual'
                        ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
                        : 'bg-zinc-800 text-white border border-zinc-700'
                    }`}
                  >
                    {event.format === 'virtual' ? 'Virtual WebRTC' : 'In-Person'}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/80 text-zinc-200 backdrop-blur-md border border-zinc-700">
                    {event.category}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full shadow-lg ${
                      isFree
                        ? 'bg-zinc-800 text-white border border-zinc-700'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-black shadow-md shadow-red-950/60'
                    }`}
                  >
                    {isFree ? 'FREE RSVP' : `$${event.ticketPrice.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Event Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Organization Info */}
                  {event.organization && (
                    <div className="flex items-center space-x-2 text-xs text-zinc-300 mb-2">
                      <span className="font-semibold">{event.organization.name}</span>
                      {event.organization.isVerified && (
                        <span title="Verified Organization">
                          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                        </span>
                      )}
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{event.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    {event.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-zinc-300">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{new Date(event.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="truncate">{event.locationName}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-zinc-400">
                      <Users className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{event.currentAttendeesCount} attendees registered</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {event.tags.map(t => (
                      <span key={t} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md border border-zinc-700/50">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleCheckout(event)}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-950/60"
                  >
                    <TicketIcon className="w-3.5 h-3.5" />
                    <span>{isFree ? 'Join Event' : 'Get Tickets'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Modal */}
      {selectedEvent && (
        <StripeCheckoutModal
          isOpen={true}
          event={selectedEvent}
          userId={currentUserId}
          userName={currentUserName}
          userEmail={currentUserEmail}
          onClose={() => setSelectedEvent(null)}
          onTicketIssued={handleTicketIssued}
        />
      )}

      {/* Ticket Pass Modal */}
      {issuedTicket && (
        <TicketModal ticket={issuedTicket} onClose={() => setIssuedTicket(null)} />
      )}
    </div>
  );
};
