import { sanitizeUser } from '../utils/serverUtils.js';


export async function getMe(req, res) {
res.json({ ok: true, user: sanitizeUser(req.user) });
}