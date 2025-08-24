import mongoose from 'mongoose';

const promo = new mongoose.Schema({
  merchant:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true, trim: true },
  kind:        { type: String, enum: ['multiplier','flat_bonus'], required: true },
  value:       { type: Number, required: true }, // e.g., 1.2 or +10
  categoryIn:  [{ type: String, enum: ['grocery','dine_in'] }],
  membersOnly: { type: Boolean, default: false },
  startsAt:    { type: Date, required: true },
  endsAt:      { type: Date, required: true },
  active:      { type: Boolean, default: true }
}, { timestamps: true });

promo.index({ merchant: 1, active: 1, startsAt: 1, endsAt: 1 });

export default mongoose.model('Promotion', promo);
