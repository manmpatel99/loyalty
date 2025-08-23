import jwt from 'jsonwebtoken';
import User from '../models/User.js';


export async function requireAuth(req, res, next) {
try {
const hdr = req.headers.authorization || '';
const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
if (!token) return res.status(401).json({ ok: false, error: 'Missing token' });


const payload = jwt.verify(token, process.env.JWT_SECRET);
const user = await User.findById(payload.id);
if (!user) return res.status(401).json({ ok: false, error: 'User not found' });


req.user = user;
next();
} catch (err) {
return res.status(401).json({ ok: false, error: 'Invalid token' });
}
}


export function requireRole(...roles) {
return (req, res, next) => {
if (!req.user) return res.status(401).json({ ok: false, error: 'Unauthorized' });
if (!roles.includes(req.user.role)) return res.status(403).json({ ok: false, error: 'Forbidden' });
next();
};
}