import bcrypt from 'bcryptjs';
import { createHash } from 'node:crypto';
import PosDevice from '../models/PosDevice.js';


// Compute a deterministic, non-secret ID for a POS key
export function posKeyId(rawKey) {
return createHash('sha256').update(String(rawKey)).digest('hex');
}


/**
* Middleware that authorizes POS requests:
* - Prefer matching a stored PosDevice by keyId + bcrypt compare
* - Fallback to legacy single POS_KEY in .env (optional)
* - Attaches req.posDevice if authorized
*/
export async function requirePosKey(req, res, next) {
const rawKey = req.headers['x-pos-key'];
if (!rawKey) return res.status(403).json({ ok: false, error: 'Missing x-pos-key' });


// Try DB-backed POS devices first
const id = posKeyId(rawKey);
const device = await PosDevice.findOne({ keyId: id, active: true });
if (device && await bcrypt.compare(String(rawKey), device.keyHash)) {
device.lastUsedAt = new Date();
await device.save();
req.posDevice = { id: device._id.toString(), name: device.name };
return next();
}


// Fallback: single POS key in .env (backward compatibility)
if (process.env.POS_KEY && rawKey === process.env.POS_KEY) {
req.posDevice = { id: 'env-pos', name: 'ENV_POS' };
return next();
}


return res.status(403).json({ ok: false, error: 'Invalid POS key' });
}