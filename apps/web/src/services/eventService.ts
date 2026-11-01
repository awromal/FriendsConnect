import {
  EventItem,
  PromoCode,
  PromoValidationResult,
  calculatePromoDiscount,
  Ticket,
  Order,
} from '@friends/shared';
import { INITIAL_EVENTS, INITIAL_PROMO_CODES } from './mockData';

const TICKETS_KEY = 'friends_app_user_tickets';

export const eventService = {
  getEvents(): EventItem[] {
    return [...INITIAL_EVENTS];
  },

  getEventById(id: string): EventItem | undefined {
    return INITIAL_EVENTS.find(e => e.id === id);
  },

  getPromoCodes(): PromoCode[] {
    return [...INITIAL_PROMO_CODES];
  },

  validatePromoCode(codeStr: string, originalAmount: number, eventId?: string): PromoValidationResult {
    const clean = codeStr.trim().toUpperCase();
    const found = INITIAL_PROMO_CODES.find(p => p.code.toUpperCase() === clean);

    if (!found) {
      return {
        isValid: false,
        error: `Code "${codeStr}" is not recognized or does not exist.`,
        discountAmount: 0,
        finalAmount: originalAmount,
      };
    }

    return calculatePromoDiscount(found, originalAmount, eventId);
  },

  // Simulates Stripe payment processing and issues a ticket
  async processPaymentAndIssueTicket(
    userId: string,
    userName: string,
    userEmail: string,
    event: EventItem,
    promoResult?: PromoValidationResult
  ): Promise<{ order: Order; ticket: Ticket }> {
    // 1-second simulated Stripe authorization
    await new Promise(res => setTimeout(res, 1000));

    const finalAmount = promoResult?.isValid ? promoResult.finalAmount : event.ticketPrice;
    const discountAmount = promoResult?.isValid ? promoResult.discountAmount : 0;

    const orderId = 'ord-' + Date.now();
    const order: Order = {
      id: orderId,
      userId,
      eventId: event.id,
      promoCodeId: promoResult?.promo?.id,
      promoCodeString: promoResult?.promo?.code,
      originalAmount: event.ticketPrice,
      discountAmount,
      finalAmount,
      currency: event.currency,
      paymentStatus: 'succeeded',
      stripePaymentIntentId: 'pi_' + Math.random().toString(36).substring(2, 16),
      createdAt: new Date().toISOString(),
    };

    // Increment promo usage if used
    if (promoResult?.promo) {
      promoResult.promo.timesUsed += 1;
    }

    const ticketCode = `FRND-${event.title.substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const ticket: Ticket = {
      id: 'tkt-' + Date.now(),
      ticketCode,
      orderId,
      eventId: event.id,
      userId,
      eventTitle: event.title,
      eventStartTime: event.startTime,
      eventLocation: event.locationName,
      attendeeName: userName,
      attendeeEmail: userEmail,
      status: 'valid',
      qrPayload: JSON.stringify({ code: ticketCode, eventId: event.id, userId }),
      issuedAt: new Date().toISOString(),
    };

    // Store in user tickets
    const existingTickets = this.getUserTickets();
    existingTickets.push(ticket);
    localStorage.setItem(TICKETS_KEY, JSON.stringify(existingTickets));

    return { order, ticket };
  },

  getUserTickets(): Ticket[] {
    const raw = localStorage.getItem(TICKETS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },
};
