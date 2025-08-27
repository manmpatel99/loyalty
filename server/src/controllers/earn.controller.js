import Transaction from '../models/Transaction.js';
import PointLot from '../models/PointLot.js';
import Promotion from '../models/Promotion.js';
import User from '../models/User.js';
import {
  DAILY_CAP, LOT_VALID_DAYS,
  addDays, roundTxn, baseEarnRate, feeBpsFor, applyPromo, awardAutoVouchers
} from '../utils/loyalty.js';

async function getActivePromo(merchantId, when, category, isMember) {
  const promos = await Promotion.find({
    merchant: merchantId,
    active: true,
    startsAt: { $lte: when },
    endsAt:   { $gte: when },
  }).lean();

  return promos.find(p =>
    (!p.categoryIn?.length || p.categoryIn.includes(category)) &&
    (!p.membersOnly || isMember)
  );
}

async function todayAwardedPoints(userId, when) {
  const start = new Date(when); start.setHours(0,0,0,0);
  const end = new Date(when);   end.setHours(23,59,59,999);
  const agg = await Transaction.aggregate([
    { $match: { user: userId, status: 'paid', paidAt: { $gte: start, $lte: end } } },
    { $group: { _id: null, sum: { $sum: '$pointsAwarded' } } }
  ]);
  return agg?.[0]?.sum ?? 0;
}

export async function earnHandler(req, res) {
  const { userId, merchantId, amountCents, category, paidAt } = req.body;
  if (!userId || !merchantId || !amountCents || !category || !paidAt) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  if (!['grocery','dine_in'].includes(category)) {
    return res.status(400).json({ error: 'Bad category' });
  }

  const when = new Date(paidAt);
  const session = await Transaction.startSession();
  session.startTransaction();

  try {
    const [user, merchant] = await Promise.all([
      User.findById(userId).session(session),
      User.findById(merchantId).session(session)
    ]);
    if (!user || !merchant) throw new Error('Bad user/merchant');

    const isMember = !!user.member;
    const rate = baseEarnRate(category, isMember);
    const basePts = (amountCents / 100) * rate;

    const promo = await getActivePromo(merchant._id, when, category, isMember);
    const promoted = applyPromo(basePts, promo);

    // per-txn rounding
    let rounded = roundTxn(promoted);

    // daily cap clamp
    const todaySoFar = await todayAwardedPoints(user._id, when);
    const left = Math.max(0, DAILY_CAP - todaySoFar);
    const toAward = Math.min(rounded, left);

    // transaction + fee
    const bps = feeBpsFor(category);
    const feeCents = Math.round((amountCents * bps) / 10000);
    const [tx] = await Transaction.create([{
      user: user._id,
      merchant: merchant._id,
      amountCents,
      category,
      paidAt: when,
      status: 'paid',
      pointsAwarded: toAward,
      feeBps: bps,
      feeCents
    }], { session });

    // lot & user balance
    if (toAward > 0) {
      await PointLot.create([{
        user: user._id,
        points: toAward,
        remaining: toAward,
        earnedAt: when,
        expiresAt: addDays(when, LOT_VALID_DAYS),
        txn: tx._id
      }], { session });

      user.points += toAward;
      await user.save({ session });
    }

    // auto-voucher loop
    await awardAutoVouchers(user, session);

    await session.commitTransaction();
    session.endSession();

    return res.json({
      txId: tx._id,
      pointsAwarded: toAward,
      todayRemainingCap: Math.max(0, left - toAward),
      balance: user.points,
      promoApplied: promo ? { kind: promo.kind, value: promo.value, name: promo.name } : null,
      feeCents
    });
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    console.error(e);
    return res.status(500).json({ error: 'earn failed', detail: e.message });
  }
}
