import mongoose from 'mongoose';

const voucher = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  capCents:  { type: Number, required: true },   // 4000 (member) or 2500 (non-member)
  issuedAt:  { type: Date, required: true },
  expiresAt: { type: Date, required: true },     // +180 days
  used:      { type: Boolean, default: false },
  usedAt:    { type: Date },
  orderRef:  { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' } // set when applied
}, { timestamps: true });

voucher.index({ user: 1, used: 1, expiresAt: 1 });

export default mongoose.model('Voucher', voucher);
