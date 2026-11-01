export type DiscountType = 'percentage' | 'fixed_amount';

export interface PromoCode {
  id: string;
  code: string;
  organizationId?: string; // Optional: If specific to an organization
  eventId?: string; // Optional: If specific to one event
  discountType: DiscountType;
  discountValue: number; // e.g. 20 for 20% or 15 for $15
  maxUses?: number;
  timesUsed: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  minOrderAmount?: number;
}

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';

export interface Order {
  id: string;
  userId: string;
  eventId: string;
  promoCodeId?: string;
  promoCodeString?: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId?: string;
  createdAt: string;
}

export type TicketStatus = 'valid' | 'checked_in' | 'cancelled' | 'transferred';

export interface Ticket {
  id: string;
  ticketCode: string; // e.g. "FRND-EVT-789012"
  orderId: string;
  eventId: string;
  userId: string;
  eventTitle: string;
  eventStartTime: string;
  eventLocation: string;
  attendeeName: string;
  attendeeEmail: string;
  status: TicketStatus;
  qrPayload: string;
  issuedAt: string;
}

export interface PromoValidationResult {
  isValid: boolean;
  error?: string;
  promo?: PromoCode;
  discountAmount: number;
  finalAmount: number;
}
