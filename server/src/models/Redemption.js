import mongoose from 'mongoose';


const redemptionSchema = new mongoose.Schema(
{
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
code: { type: mongoose.Schema.Types.ObjectId, ref: 'Code', required: true },
points: { type: Number, required: true },
kind: { type: String, enum: ['earn', 'adjust'], default: 'earn' },
note: { type: String, trim: true }
},
{ timestamps: true }
);


redemptionSchema.index({ user: 1, createdAt: -1 });


export default mongoose.model('Redemption', redemptionSchema);