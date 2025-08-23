import { Router } from 'express';
import { asyncHandler } from '../utils/serverUtils.js';
import { register, login, me } from '../controllers/auth.controller.js';
import { registerValidators, loginValidators, handleValidation } from '../middleware/validators.js';
import { requireAuth } from '../middleware/auth.js';


const router = Router();


router.post('/register', registerValidators, handleValidation, asyncHandler(register));
router.post('/login', loginValidators, handleValidation, asyncHandler(login));
router.get('/me', requireAuth, asyncHandler(me));


export default router;

