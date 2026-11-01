import React from 'react';
import { Ticket as TicketIcon, CheckCircle, Calendar, MapPin, QrCode, X, Download } from 'lucide-react';
import { Ticket } from '@friends/shared';

interface TicketModalProps {
  ticket: Ticket | null;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ ticket, onClose }) => {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Tag */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-2">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Event Pass Confirmed</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Your official entry voucher is ready.</p>
        </div>

        {/* Ticket Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-lg relative overflow-hidden mb-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <TicketIcon className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Official Event Ticket
              </span>
            </div>
            <span className="text-[11px] font-mono text-black bg-white px-2 py-0.5 rounded-full font-bold">
              Valid Pass
            </span>
          </div>

          <h4 className="text-base font-bold text-white mb-2">{ticket.eventTitle}</h4>

          <div className="space-y-1.5 text-xs text-zinc-300 mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>{new Date(ticket.eventStartTime).toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span>{ticket.eventLocation}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-zinc-800 pt-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase">Attendee</span>
              <span className="text-xs font-semibold text-white">{ticket.attendeeName}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 block uppercase">Ticket Code</span>
              <span className="text-xs font-mono font-bold text-white">{ticket.ticketCode}</span>
            </div>
          </div>

          {/* QR Code Graphic Mock */}
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-center">
            <div className="bg-white p-2.5 rounded-xl shadow-md">
              <QrCode className="w-24 h-24 text-black" />
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Save Ticket to Wallet</span>
        </button>
      </div>
    </div>
  );
};
