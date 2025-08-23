import Code from '../models/code.js';
import User from '../models/User.js';
import Redemption from '../models/Redemption.js';
import { generateCode } from '../utils/generateCode.js';
import { isExpired } from '../utils/LoyaltyMath.js';


function adminHeaderOK(req) {
return req.headers['x-admin-key'] && req.headers['x-admin-key'] === process.env.ADMIN_KEY;
}


export async function createCode(req, res) {
// Allow via admin header OR logged-in admin role
const byHeader = adminHeaderOK(req);
const byRole = req.user && req.user.role === 'admin';
if (!byHeader && !byRole) return res.status(403).json({ ok: false, error: 'Forbidden' });


const { points, expiresAt, prefix } = req.body;
const codeStr = generateCode(prefix || 'RC');


const code = await Code.create({
code: codeStr,
points,
expiresAt: expiresAt ? new Date(expiresAt) : undefined,
createdBy: byRole ? req.user._id : undefined
});


res.status(201).json({ ok: true, code });
}


export async function validateCode(req, res) {
const { code } = req.query;
const doc = await Code.findOne({ code: String(code).toUpperCase() });
if (!doc) return res.json({ ok: true, valid: false, reason: 'NOT_FOUND' });
if (doc.used) return res.json({ ok: true, valid: false, reason: 'USED' });
if (isExpired(doc.expiresAt)) return res.json({ ok: true, valid: false, reason: 'EXPIRED' });
return res.json({ ok: true, valid: true, points: doc.points, expiresAt: doc.expiresAt });
}


export async function redeemCode(req, res) {
const { code } = req.body;
const user = req.user;


const doc = await Code.findOne({ code: String(code).toUpperCase() });
if (!doc) return res.status(404).json({ ok: false, error: 'Code not found' });
if (doc.used) return res.status(400).json({ ok: false, error: 'Code already used' });
if (isExpired(doc.expiresAt)) return res.status(400).json({ ok: false, error: 'Code expired' });


// Mark used
doc.used = true;
doc.usedBy = user._id;
doc.usedAt = new Date();
await doc.save();


// Add points
user.points = (user.points || 0) + doc.points;
await user.save();


// Log redemption
await Redemption.create({
user: user._id,
code: doc._id,
points: doc.points,
kind: 'earn',
note: `Redeemed code ${doc.code}`
});

res.json({
  ok: true,
  message: 'Code redeemed',
  code: doc.code,
  addpoints,
  balance: user.points
})
}
