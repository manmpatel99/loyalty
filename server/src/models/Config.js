import mongoose from "mongoose";
const ConfigSchema = new mongoose.Schema({
  dollarsPerPoint: { type: Number, default: 80 },
  bonusThreshold:  { type: Number, default: 180 },
  bonusPoints:     { type: Number, default: 3 },   // ≥$180 receipt earns AT LEAST 3 points
  redeemPoints:    { type: Number, default: 20 },  // 20 points → coupon
  couponPercent:   { type: Number, default: 50 },  // 50% off
  couponCap:       { type: Number, default: 40 },  // max $40 off
  couponValidityDays: { type: Number, default: 180 } // 6 months
}, { timestamps: true });

export default mongoose.model("Config", ConfigSchema);
