import { Router } from 'express';
import { getWallet } from '../controllers/wallet.controller.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();
r.get('/', requireAuth, getWallet);
export default r;
