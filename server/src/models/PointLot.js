import mongoose from 'mongoose';

const pointLot = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  points:    { type: Number, required: true },   // earned (after rounding & cap)
  remaining: { type: Number, required: true },   // decremented on voucher conversion/spend
  earnedAt:  { type: Date, required: true },
  expiresAt: { type: Date, required: true },     // earnedAt + 180 days
  txn:       { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }
}, { timestamps: true });

pointLot.index({ user: 1, expiresAt: 1 });
pointLot.index({ user: 1, earnedAt: 1 });

export default mongoose.model('PointLot', pointLot);
