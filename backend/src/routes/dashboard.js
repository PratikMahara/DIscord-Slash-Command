import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getLogs, getStats } from '../controller/dashboard.controller.js';

const router = Router();

router.get('/logs',  requireAuth, getLogs);
router.get('/stats', requireAuth, getStats);

export default router;
