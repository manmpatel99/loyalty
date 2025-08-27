import Voucher from '../models/Voucher.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

const MEMBER_CAP_CENTS = 4000;
const NONMEMBER_CAP_CENTS = 2500;

// Policy: award points on POST-discount amount
export const AWARD_ON_POST_DISCOUNT = true;

export async function redeemHandler(req, res) {
  // Input: { userId, merchantId, amountCents, category, paidAt, voucherId }
  const { userId, merchantId, amountCents, category, paidAt, voucherId } = req.body;
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
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('User not found');

    let discountCents = 0;
    let voucherUsed = null;

    if (voucherId) {
      const v = await Voucher.findOne({
        _id: voucherId, user: userId, used: false, expiresAt: { $gte: when }
      }).session(session);
      if (!v) throw new Error('Voucher invalid or expired');

      const cap = v.capCents ?? (user.member ? MEMBER_CAP_CENTS : NONMEMBER_CAP_CENTS);
      discountCents = Math.min(Math.floor(amountCents * 0.5), cap);

      // consume fully regardless of whether cap reached
      v.used = true;
      v.usedAt = when;
      voucherUsed = v;
      await v.save({ session });
    }

    const netPayableCents = Math.max(0, amountCents - discountCents);

    // Create a shell transaction here; points will be awarded by /api/earn on net amount
    const bps = category === 'grocery' ? 100 : 250;
    const feeCents = Math.round((amountCents * bps) / 10000);
    const [tx] = await Transaction.create([{
      user: userId,
      merchant: merchantId,
      amountCents,
      category,
      paidAt: when,
      status: 'paid',
      pointsAwarded: 0,   // set by /api/earn call on net amount
      feeBps: bps,
      feeCents
    }], { session });

    if (voucherUsed) {
      voucherUsed.orderRef = tx._id;
      await voucherUsed.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({
      txId: tx._id,
      originalAmountCents: amountCents,
      discountCents,
      netPayableCents,
      voucherApplied: !!voucherUsed,
      voucherId: voucherUsed?._id ?? null,
      // client: now call /api/earn with netPayableCents
      next: AWARD_ON_POST_DISCOUNT
        ? 'Call /api/earn with amountCents = netPayableCents to award points.'
        : 'Award policy is pre-discount; call /api/earn with original amount if desired.'
    });
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    console.error(e);
    return res.status(500).json({ error: 'redeem failed', detail: e.message });
  }
}
