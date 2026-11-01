import React, { useState } from 'react';
import {
  CreditCard,
  Tag,
  CheckCircle2,
  X,
  Lock,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { EventItem, PromoValidationResult, Ticket } from '@friends/shared';
import { eventService } from '../../services/eventService';

interface StripeCheckoutModalProps {
  isOpen: boolean;
  event: EventItem;
  userId: string;
  userName: string;
  userEmail: string;
  onClose: () => void;
  onTicketIssued: (ticket: Ticket) => void;
}

export const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({
  isOpen,
  event,
  userId,
  userName,
  userEmail,
  onClose,
  onTicketIssued,
}) => {
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [promoResult, setPromoResult] = useState<PromoValidationResult | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState<string>('12/28');
  const [cardCvc, setCardCvc] = useState<string>('892');

  if (!isOpen) return null;

  const originalPrice = event.ticketPrice;
  const isFree = originalPrice === 0;

  const handleApplyPromo = () => {
    if (!promoCodeInput.trim()) return;
    setPromoError(null);

    const result = eventService.validatePromoCode(promoCodeInput, originalPrice, event.id);
    if (!result.isValid) {
      setPromoError(result.error || 'Invalid promo code');
      setPromoResult(null);
    } else {
      setPromoResult(result);
    }
  };

  const finalPayable = promoResult?.isValid ? promoResult.finalAmount : originalPrice;
  const discountGiven = promoResult?.isValid ? promoResult.discountAmount : 0;

  const handleCompletePayment = async () => {
    setIsProcessing(true);
    try {
      const { ticket } = await eventService.processPaymentAndIssueTicket(
        userId,
        userName,
        userEmail,
        event,
        promoResult || undefined
      );
      setIsProcessing(false);
      onTicketIssued(ticket);
    } catch (err: any) {
      setIsProcessing(false);
      alert('Payment failed: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Event Checkout & Ticket</h3>
            <p className="text-xs text-zinc-400 flex items-center space-x-1">
              <Lock className="w-3 h-3 text-zinc-400" />
              <span>Encrypted via Stripe Gateway & 256-bit SSL</span>
            </p>
          </div>
        </div>

        {/* Event Snapshot */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 mb-6 flex space-x-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
            <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white truncate">{event.title}</h4>
            <div className="flex items-center space-x-1 text-xs text-zinc-400 mt-1">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>{new Date(event.startTime).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-zinc-400 mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span className="truncate">{event.locationName}</span>
            </div>
          </div>
        </div>

        {/* Promo Code Input Section */}
        {!isFree && (
          <div className="mb-6">
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5 text-zinc-400" />
              <span>Have a Promo / Discount Code?</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Try 'FRIENDS2026' or 'EARLYBIRD10'"
                value={promoCodeInput}
                onChange={e => setPromoCodeInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                className="flex-1 px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 text-xs font-mono uppercase focus:outline-none focus:border-white transition-all"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold border border-zinc-700 transition-all"
              >
                Apply
              </button>
            </div>

            {promoError && (
              <p className="text-[11px] text-zinc-400 mt-1.5 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 text-red-400" />
                <span>{promoError}</span>
              </p>
            )}

            {promoResult?.isValid && (
              <div className="mt-2 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span className="font-semibold">Promo Applied ({promoResult.promo?.code})</span>
                </div>
                <span className="font-mono">-${discountGiven.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* Price Breakdown */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 mb-6 space-y-2 text-xs">
          <div className="flex justify-between text-zinc-400">
            <span>Ticket Price ({event.format.toUpperCase()} entry)</span>
            <span className="font-medium text-white">
              {isFree ? 'Free ($0.00)' : `$${originalPrice.toFixed(2)}`}
            </span>
          </div>
          {discountGiven > 0 && (
            <div className="flex justify-between text-zinc-300">
              <span>Promo Discount Applied</span>
              <span className="font-mono">-${discountGiven.toFixed(2)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm font-bold text-white">
            <span>Total Payable</span>
            <span className="text-white font-mono text-base">${finalPayable.toFixed(2)}</span>
          </div>
        </div>

        {/* Stripe Card Element Simulation (if not free) */}
        {!isFree && finalPayable > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-xs font-semibold text-zinc-300 block mb-2">Card Details (Stripe Test)</span>
            <div className="space-y-2">
              <input
                type="text"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-white font-mono"
              />
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={cardExp}
                  onChange={e => setCardExp(e.target.value)}
                  className="w-1/2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-white font-mono"
                />
                <input
                  type="text"
                  value={cardCvc}
                  onChange={e => setCardCvc(e.target.value)}
                  className="w-1/2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleCompletePayment}
          disabled={isProcessing}
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all"
        >
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Processing with Stripe...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>{isFree || finalPayable === 0 ? 'Confirm Free RSVP' : `Pay $${finalPayable.toFixed(2)} & Get Ticket`}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
