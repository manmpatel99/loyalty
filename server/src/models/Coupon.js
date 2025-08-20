import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const CouponSchema = new mongoose.Schema({
  customerId: { type: ObjectId, ref: "User", index: true, required: true },
  code: { type: String, unique: true, index: true, required: true },
  percentOff: { type: Number, default: 50 },  // 50% off
  maxDiscount: { type: Number, default: 40 }, // cap $40
  issuedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },  // issued + 6 months
  redeemedAt: { type: Date },
  status: { type: String, enum: ["active", "redeemed", "expired"], default: "active", index: true }
}, { timestamps: true });

export default mongoose.model("Coupon", CouponSchema);
