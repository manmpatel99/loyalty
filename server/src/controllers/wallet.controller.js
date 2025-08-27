import PointLot from '../models/PointLot.js';
import Voucher from '../models/Voucher.js';
import User from '../models/User.js';

export async function getWallet(req, res) {
  const userId = req.user._id;

  const [user, lots, vouchers] = await Promise.all([
    User.findById(userId).lean(),
    PointLot.find({ user: userId })
      .select('remaining earnedAt expiresAt')
      .sort({ expiresAt: 1 }).lean(),
    Voucher.find({ user: userId, used: false })
      .select('capCents issuedAt expiresAt')
      .sort({ expiresAt: 1 }).lean()
  ]);

  const now = Date.now();
  const in60d = 60 * 24 * 3600 * 1000;

  const expiringSoon = {
    points: lots.filter(l => l.remaining > 0 && (new Date(l.expiresAt).getTime() - now) <= in60d),
    vouchers: vouchers.filter(v => (new Date(v.expiresAt).getTime() - now) <= in60d),
  };

  res.json({
    balance: user?.points ?? 0,
    lots,
    vouchers,
    expiringSoon
  });
}
