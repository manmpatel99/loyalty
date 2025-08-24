import mongoose from 'mongoose';

const txSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  merchant:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // role='merchant'
  amountCents: { type: Number, required: true, min: 0 }, // store money in cents
  category:    { type: String, enum: ['grocery','dine_in'], required: true },
  paidAt:      { type: Date, required: true },
  status:      { type: String, enum: ['paid','refunded'], default: 'paid' },
  pointsAwarded: { type: Number, default: 0 },
  feeBps:      { type: Number, required: true },   // 100 = 1%, 250 = 2.5%
  feeCents:    { type: Number, required: true }
}, { timestamps: true });

txSchema.index({ user: 1, paidAt: -1 });         // for daily-cap queries
txSchema.index({ merchant: 1, paidAt: -1 });     // merchant reports

export default mongoose.model('Transaction', txSchema);
