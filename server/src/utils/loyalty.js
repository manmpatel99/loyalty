// server/src/utils/loyalty.js
import Voucher from '../models/Voucher.js';
import PointLot from '../models/PointLot.js';

export const DAILY_CAP = 160;
export const LOT_VALID_DAYS = 180;
export const VOUCHER_POINTS = 2000;
export const MEMBER_CAP_CENTS = 4000;     // $40
export const NONMEMBER_CAP_CENTS = 2500;  // $25

export const addDays = (date, n) => new Date(date.getTime() + n*24*3600*1000);

export const roundTxn = (x) => {
  const floor = Math.floor(x);
  return (x - floor) >= 0.5 ? floor + 1 : floor;
};

export function baseEarnRate(category, isMember) {
  if (category === 'grocery') return isMember ? 1.0 : 0.5;
  if (category === 'dine_in') return 1.0;
  throw new Error('Invalid category');
}

export function feeBpsFor(category) {
  return category === 'grocery' ? 100 : 250; // 1% / 2.5%
}

export function applyPromo(basePts, promo) {
  if (!promo) return basePts;
  if (promo.kind === 'multiplier') return basePts * promo.value;
  if (promo.kind === 'flat_bonus') return basePts + promo.value;
  return basePts;
}

// FIFO auto-voucher conversion at 2000 points
export async function awardAutoVouchers(user, session) {
  const cap = user.member ? MEMBER_CAP_CENTS : NONMEMBER_CAP_CENTS;
  const now = new Date();

  while (user.points >= VOUCHER_POINTS) {
    // consume FIFO from lots
    let need = VOUCHER_POINTS;
    const lots = await PointLot.find({ user: user._id, remaining: { $gt: 0 } })
      .sort({ earnedAt: 1 }).session(session);
    for (const lot of lots) {
      if (need <= 0) break;
      const take = Math.min(need, lot.remaining);
      lot.remaining -= take;
      need -= take;
      await lot.save({ session });
    }
    // mint voucher
    await Voucher.create([{
      user: user._id,
      capCents: cap,
      issuedAt: now,
      expiresAt: addDays(now, LOT_VALID_DAYS),
      used: false
    }], { session });

    user.points -= VOUCHER_POINTS;
    await user.save({ session });
  }
}
