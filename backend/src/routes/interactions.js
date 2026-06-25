import { Router } from 'express';
import { handleInteraction } from '../controller/interactions.controller.js';

const router = Router();

router.post('/', handleInteraction);

export default router;
