import mongoose from 'mongoose';


const userSchema = new mongoose.Schema(
{
email: { type: String, required: true, unique: true, lowercase: true, trim: true },
passwordHash: { type: String, required: true },
name: { type: String, trim: true },
phone: { type: String, trim: true },
role: { type: String, enum: ['user', 'admin', 'pos'], default: 'user' },
points: { type: Number, default: 0 }
},
{ timestamps: true }
);




export default mongoose.model('User', userSchema);