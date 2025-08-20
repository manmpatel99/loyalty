import { Router } from "express";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";
import Config from "../models/Config.js";
import mongoose from "mongoose";
import { computePointsForReceipt, addDays, generateCouponCode } from "../utils/LoyaltyMath.js";
import { requireAuth } from "../middleware/auth.js"; // protect if only logged-in can accrue

const router = Router();

/** POST /api/pos/close
 * body: { amount }  (user is identified by JWT req.user.uid)
 * returns: { pointsEarned, newBalance, issuedCoupons: [{code, expiresAt}] }
 */
router.post("/close", requireAuth, [
  body("amount").isFloat({ min: 0.01 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { amount } = req.body;
  const cfg = await (Config.findOne() || new Config({}).save());
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(req.user.uid).session(session);
    if (!user) throw new Error("User not found");

    // calc points
    const points = computePointsForReceipt(Number(amount), cfg);

    // update balance
    user.points += points;
    await user.save({ session });

    // issue coupons for every 20 points crossed
    const issued = [];
    while (user.points >= cfg.redeemPoints) {
      user.points -= cfg.redeemPoints;
      const code = generateCouponCode();
      const coupon = await Coupon.create([{
        customerId: user._id,
        code,
        percentOff: cfg.couponPercent,
        maxDiscount: cfg.couponCap,
        issuedAt: new Date(),
        expiresAt: addDays(new Date(), cfg.couponValidityDays),
        status: "active"
      }], { session }).then(d => d[0]);

      issued.push({ code: coupon.code, expiresAt: coupon.expiresAt });
    }

    await user.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.json({ ok: true, pointsEarned: points, newBalance: user.points, issuedCoupons: issued });
  } catch (e) {
    await session.abortTransaction(); session.endSession();
    res.status(500).json({ error: "Failed to process receipt", detail: e.message });
  }
});

export default router;
