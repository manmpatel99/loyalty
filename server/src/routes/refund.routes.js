import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { refundHandler } from '../controllers/refund.controller.js';

const r = Router();
r.post('/:txId', requireAuth, refundHandler);
export default r;
