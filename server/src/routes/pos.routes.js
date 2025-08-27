import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { asyncHandler } from '../utils/serverUtils.js';
import User from '../models/User.js';
import { redeemCode as redeemCodeCore } from '../controllers/code.controller.js';
import { requirePosKey } from '../middleware/posAuth.js';
import { createPosDevice, listPosDevices, deletePosDevice } from '../controllers/pos.controller.js';
import { handleValidation } from '../middleware/validators.js';



const router = Router();


// Per-POS-key rate limiter (30 requests/minute). Adjust as needed.
const posLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String(req.headers['x-pos-key'] || ipKeyGenerator(req))
});


// ----- Admin POS device management -----
router.post(
  '/devices',
  [body('name').isString().trim().isLength({ min: 1 }), body('key').optional().isString().isLength({ min: 8 })],
  handleValidation,
  asyncHandler(createPosDevice)
);



r.post('/paid', requireAuth, posPaid);

router.get('/devices', asyncHandler(listPosDevices));


router.delete('/devices/:id', asyncHandler(deletePosDevice));


// ----- POS redeem endpoint (shop terminal) -----
/**
* POST /api/pos/redeem
* headers: x-pos-key: <store device key>
* body: { code: "RC-XXXX-XXXX", userEmail: "customer@email.com" }
*/
router.post('/redeem', posLimiter, requirePosKey, asyncHandler(async (req, res, next) => {
const { userEmail, code } = req.body || {};
if (!userEmail || !code) return res.status(400).json({ ok: false, error: 'userEmail and code required' });


const user = await User.findOne({ email: String(userEmail).toLowerCase() });
if (!user) return res.status(404).json({ ok: false, error: 'User not found' });


// Reuse core redeem logic by attaching the user to the request
req.user = user;
req.body = { code };
return redeemCodeCore(req, res, next);
}));


export default router;

