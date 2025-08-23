import { Router } from 'express';
import { asyncHandler } from '../utils/serverUtils.js';
import { requireAuth } from '../middleware/auth.js';
import { getMe } from '../controllers/user.controller.js';


const router = Router();


router.get('/me', requireAuth, asyncHandler(getMe));


export default router;