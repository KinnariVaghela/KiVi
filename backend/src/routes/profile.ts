import { Router }      from 'express';
import { requireAuth } from '../middleware/auth';
import { getProfile, updateProfile } from '../controller/profile.controller';

const router = Router();

router.get('/',   requireAuth, getProfile);    
router.patch('/', requireAuth, updateProfile); 

export default router;
