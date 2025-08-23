import { Router } from 'express';
import { asyncHandler } from '../utils/serverUtils.js';
import { requireAuth } from '../middleware/auth.js';
import { createCode, redeemCode, validateCode } from '../controllers/code.controller.js';
import { createCodeValidators, redeemCodeValidators, validateCodeValidators, handleValidation } from '../middleware/validators.js';


const router = Router();


// Create code (via x-admin-key or admin user)
router.post('/create', createCodeValidators, handleValidation, asyncHandler(createCode));


// Validate a code without redeeming
router.get('/validate', validateCodeValidators, handleValidation, asyncHandler(validateCode));


// Redeem a code (adds points, logs history)
router.post('/redeem', requireAuth, redeemCodeValidators, handleValidation, asyncHandler(redeemCode));


export default router;