import { Router } from 'express';
import { deleteResume, getResume, listResumes, uploadResume as uploadResumeHandler } from '../controllers/resumeController.js';
import { protect } from '../middleware/auth.js';
import { uploadResume } from '../middleware/upload.js';

const router = Router();

router.use(protect);
router.post('/upload', uploadResume.single('resume'), uploadResumeHandler);
router.get('/', listResumes);
router.get('/:id', getResume);
router.delete('/:id', deleteResume);

export default router;
