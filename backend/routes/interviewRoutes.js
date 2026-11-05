import { Router } from 'express';
import { answerQuestion, generateMore } from '../controllers/interviewController.js';
import { protect } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.use(protect);
router.post('/generate', aiLimiter, generateMore);
router.post('/answer', aiLimiter, answerQuestion);

export default router;
