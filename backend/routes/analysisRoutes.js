import { Router } from 'express';
import { createAnalysis, deleteAnalysis, getAnalysis, listAnalyses } from '../controllers/analysisController.js';
import { protect } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.use(protect);
router.post('/analyze', aiLimiter, createAnalysis);
router.get('/history', listAnalyses);
router.get('/:id', getAnalysis);
router.delete('/:id', deleteAnalysis);

export default router;
