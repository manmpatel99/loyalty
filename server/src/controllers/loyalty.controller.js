import Redemption from '../models/Redemption.js';


export async function getBalance(req, res) {
res.json({ ok: true, balance: req.user.points || 0 });
}


export async function getHistory(req, res) {
const list = await Redemption.find({ user: req.user._id })
.sort({ createdAt: -1 })
.limit(100)
.populate('code', 'code points')
.lean();
res.json({ ok: true, history: list });
}