import mongoose from 'mongoose';


const posDeviceSchema = new mongoose.Schema(
{
name: { type: String, required: true, trim: true },
keyId: { type: String, required: true, unique: true, index: true },
keyHash: { type: String, required: true },
active: { type: Boolean, default: true, index: true },
lastUsedAt: { type: Date }
},
{ timestamps: true }
);


export default mongoose.model('PosDevice', posDeviceSchema);