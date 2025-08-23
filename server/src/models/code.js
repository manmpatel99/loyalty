import mongoose from 'mongoose';


const codeSchema = new mongoose.Schema(
{
code: { type: String, required: true, unique: true, uppercase: true, trim: true },
points: { type: Number, required: true, min: 1 },
expiresAt: { type: Date },
used: { type: Boolean, default: false },
usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
usedAt: { type: Date },
createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
{ timestamps: true }
);


codeSchema.index({ expiresAt: 1 });


export default mongoose.model('Code', codeSchema);