import { Router } from "express";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";
import Config from "../models/Config.js";
import mongoose from "mongoose";
import { computeCouponDiscount } from "../utils/LoyaltyMath.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

/** POST /api/loyalty/quote
 * body: { subtotal }
 * return: { discount, payable, couponCode } if an active coupon exists
 */
router.post("/quote", requireAuth, [
  body("subtotal").isFloat({ min: 0.01 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { subtotal } = req.body;
  const user = await User.findById(req.user.uid);
  if (!user) return res.status(404).json({ error: "User not found" });

  const coupon = await Coupon.findOne({
    customerId: user._id,
    status: "active",
    expiresAt: { $gte: new Date() }
  }).sort({ issuedAt: 1 });

  if (!coupon) return res.json({ ok: true, discount: 0, payable: Number(subtotal), couponCode: null });

  const discount = computeCouponDiscount(Number(subtotal), {
    couponPercent: coupon.percentOff,
    couponCap: coupon.maxDiscount
  });

  res.json({ ok: true, discount, payable: Math.max(0, Number(subtotal) - discount), couponCode: coupon.code });
});

/** POST /api/loyalty/redeem
 * body: { subtotal, couponCode }
 * marks coupon used and returns final payable
 */
router.post("/redeem", requireAuth, [
  body("subtotal").isFloat({ min: 0.01 }),
  body("couponCode").isString().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { subtotal, couponCode } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(req.user.uid).session(session);
    if (!user) throw new Error("User not found");

    const coupon = await Coupon.findOne({ customerId: user._id, code: couponCode }).session(session);
    if (!coupon || coupon.status !== "active" || coupon.expiresAt < new Date()) {
      throw new Error("Coupon not available");
    }

    const discount = computeCouponDiscount(Number(subtotal), {
      couponPercent: coupon.percentOff,
      couponCap: coupon.maxDiscount
    });

    coupon.status = "redeemed";
    coupon.redeemedAt = new Date();
    await coupon.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ ok: true, discount, payable: Math.max(0, Number(subtotal) - discount) });
  } catch (e) {
    await session.abortTransaction(); session.endSession();
    res.status(400).json({ error: e.message || "Redeem failed" });
  }
});

export default router;
