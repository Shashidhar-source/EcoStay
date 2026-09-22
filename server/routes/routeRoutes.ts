import { Router } from 'express';
import { getRouteDistance } from '../controllers/routingController';

const router = Router();

// GET /api/route?startLat=...&startLng=...&endLat=...&endLng=...
router.get('/', getRouteDistance);

export default router;
