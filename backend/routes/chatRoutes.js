import { Router } from 'express';
import { chat } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/', protect, aiLimiter, chat);

export default router;
