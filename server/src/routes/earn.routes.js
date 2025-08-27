import { Router } from 'express';
import { earnHandler } from '../controllers/earn.controller.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();
r.post('/', requireAuth, earnHandler);
export default r;
