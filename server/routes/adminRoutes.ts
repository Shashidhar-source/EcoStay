import { Router } from 'express';
import { getProviderStatus } from '../controllers/adminController';

const router = Router();

// GET /api/admin/providers/status
router.get('/providers/status', getProviderStatus);

export default router;
