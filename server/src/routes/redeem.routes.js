import { Router } from 'express';
import { redeemHandler } from '../controllers/redeem.controller.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();
r.post('/', requireAuth, redeemHandler);
export default r;