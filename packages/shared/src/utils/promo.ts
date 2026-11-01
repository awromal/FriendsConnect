import type { PromoCode, PromoValidationResult } from '../types/payment';

export function calculatePromoDiscount(
  promo: PromoCode,
  originalAmount: number,
  eventId?: string
): PromoValidationResult {
  const now = new Date();
  const validFrom = new Date(promo.validFrom);
  const validUntil = new Date(promo.validUntil);

  if (!promo.isActive) {
    return {
      isValid: false,
      error: 'This promo code is no longer active.',
      discountAmount: 0,
      finalAmount: originalAmount,
    };
  }

  if (now < validFrom || now > validUntil) {
    return {
      isValid: false,
      error: 'This promo code has expired or is not yet valid.',
      discountAmount: 0,
      finalAmount: originalAmount,
    };
  }

  if (promo.maxUses !== undefined && promo.timesUsed >= promo.maxUses) {
    return {
      isValid: false,
      error: 'This promo code has reached its maximum usage limit.',
      discountAmount: 0,
      finalAmount: originalAmount,
    };
  }

  if (promo.eventId && eventId && promo.eventId !== eventId) {
    return {
      isValid: false,
      error: 'This promo code is not valid for this specific event.',
      discountAmount: 0,
      finalAmount: originalAmount,
    };
  }

  if (promo.minOrderAmount && originalAmount < promo.minOrderAmount) {
    return {
      isValid: false,
      error: `Minimum order amount of $${promo.minOrderAmount} required for this promo code.`,
      discountAmount: 0,
      finalAmount: originalAmount,
    };
  }

  let discountAmount = 0;
  if (promo.discountType === 'percentage') {
    discountAmount = (originalAmount * promo.discountValue) / 100;
  } else if (promo.discountType === 'fixed_amount') {
    discountAmount = promo.discountValue;
  }

  // Ensure discount does not exceed original amount
  discountAmount = Math.min(discountAmount, originalAmount);
  // Round to 2 decimal places
  discountAmount = Math.round(discountAmount * 100) / 100;
  const finalAmount = Math.max(0, Math.round((originalAmount - discountAmount) * 100) / 100);

  return {
    isValid: true,
    promo,
    discountAmount,
    finalAmount,
  };
}
