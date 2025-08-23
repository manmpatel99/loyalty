import { Router } from 'express';
import { asyncHandler } from '../utils/serverUtils.js';
import { requireAuth } from '../middleware/auth.js';
import { getBalance, getHistory } from '../controllers/loyalty.controller.js';


const router = Router();


router.get('/balance', requireAuth, asyncHandler(getBalance));
router.get('/history', requireAuth, asyncHandler(getHistory));
export default router;

