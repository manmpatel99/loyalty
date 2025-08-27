import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createPromo, listPromos, updatePromo, deletePromo } from '../controllers/promos.controller.js';

const r = Router();
r.use(requireAuth); // guard in your middleware to ensure role === 'merchant'
r.post('/', createPromo);
r.get('/', listPromos);
r.patch('/:id', updatePromo);
r.delete('/:id', deletePromo);
export default r;
