// server/src/cron/jobs.js
import PointLot from '../models/PointLot.js';
import Voucher from '../models/Voucher.js';
import User from '../models/User.js';

const DAY = 24*3600*1000;

export async function runExpiryAndReminders(){
  const now = new Date();

  // Expire lots
  const lots = await PointLot.find({ expiresAt: { $lt: now }, remaining: { $gt: 0 } });
  for (const lot of lots) {
    const u = await User.findById(lot.user);
    if (!u) continue;
    u.points -= lot.remaining;
    lot.remaining = 0;
    await lot.save();
    await u.save();
  }

  // (Optional) no change needed for expired vouchers: they remain unused and filtered in UI

  // Reminders (T-60, T-30) — do simple ±12h window to be robust
  const t60Start = new Date(now.getTime() + 60*DAY - 12*3600*1000);
  const t60End   = new Date(now.getTime() + 60*DAY + 12*3600*1000);
  const t30Start = new Date(now.getTime() + 30*DAY - 12*3600*1000);
  const t30End   = new Date(now.getTime() + 30*DAY + 12*3600*1000);

  const lots60 = await PointLot.find({ remaining: { $gt: 0 }, expiresAt: { $gte: t60Start, $lte: t60End } });
  const lots30 = await PointLot.find({ remaining: { $gt: 0 }, expiresAt: { $gte: t30Start, $lte: t30End } });

  const v60 = await Voucher.find({ used: false, expiresAt: { $gte: t60Start, $lte: t60End } });
  const v30 = await Voucher.find({ used: false, expiresAt: { $gte: t30Start, $lte: t30End } });

  if (lots60.length || v60.length || lots30.length || v30.length) {
    console.log('Reminders due:', {
      lots60: lots60.length, lots30: lots30.length, v60: v60.length, v30: v30.length
    });
    // TODO: push to your email/SMS queue
  }
}

// Kick off daily
setTimeout(() => runExpiryAndReminders().catch(console.error), 15 * 1000); // first run shortly after boot
setInterval(() => runExpiryAndReminders().catch(console.error), 24 * 3600 * 1000);
