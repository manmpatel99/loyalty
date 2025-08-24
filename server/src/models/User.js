import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // identity
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name:         { type: String, trim: true },
  phone:        { type: String, trim: true, unique: true, sparse: true }, // add phone login later

  // roles
  role:         { type: String, enum: ['user','merchant','admin','pos'], default: 'user' },

  // membership
  member:           { type: Boolean, default: false },
  memberStartedAt:  { type: Date },
  memberTrialEndsAt:{ type: Date },  // 30-day free trial end
  memberRenewsAt:   { type: Date },  // monthly renewal anchor

  // rolling points cache (authoritative balance = sum(PointLot.remaining))
  points:       { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
