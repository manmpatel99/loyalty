import Transaction from '../models/Transaction.js';
import PointLot from '../models/PointLot.js';
import User from '../models/User.js';

export async function refundHandler(req, res) {
  // URL: /api/refunds/:txId
  const { txId } = req.params;
  const session = await Transaction.startSession();
  session.startTransaction();

  try {
    const tx = await Transaction.findById(txId).session(session);
    if (!tx) return res.status(404).json({ error: 'tx not found' });
    if (tx.status === 'refunded') return res.json({ ok: true, alreadyRefunded: true });

    // mark refunded
    tx.status = 'refunded';
    await tx.save({ session });

    // create a negative lot to reverse awarded points
    if (tx.pointsAwarded && tx.pointsAwarded > 0) {
      await PointLot.create([{
        user: tx.user,
        points: -tx.pointsAwarded,
        remaining: 0,                  // a negative lot is non-spendable
        earnedAt: tx.paidAt,
        expiresAt: tx.paidAt
      }], { session });

      const u = await User.findById(tx.user).session(session);
      u.points -= tx.pointsAwarded;   // may go negative; UI should reflect debt
      await u.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
    res.json({ ok: true });
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    console.error(e);
    res.status(500).json({ error: 'refund failed', detail: e.message });
  }
}
