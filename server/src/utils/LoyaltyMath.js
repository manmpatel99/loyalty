export function computePointsForReceipt(amount, { dollarsPerPoint, bonusThreshold, bonusPoints }) {
  const base = Math.floor(amount / dollarsPerPoint);
  const bonusFloor = amount >= bonusThreshold ? bonusPoints : 0;
  // “At least 3 points if ≥ threshold”
  return Math.max(base, bonusFloor);
}

export function computeCouponDiscount(subtotal, { couponPercent, couponCap }) {
  const percentValue = subtotal * (couponPercent / 100);
  return Math.min(percentValue, couponCap);
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function generateCouponCode() {
  return "CPN-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}
