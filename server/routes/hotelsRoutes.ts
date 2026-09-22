import { Router } from 'express';
import { getNearbyHotels } from '../controllers/hotelsController';

const router = Router();

// GET /api/hotels/nearby?lat=...&lng=...&radius=...&minEcoScore=...&budgetMax=...
router.get('/nearby', getNearbyHotels);

export default router;
