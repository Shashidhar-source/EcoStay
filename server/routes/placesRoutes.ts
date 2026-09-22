import { Router } from 'express';
import { getNearbyPlaces } from '../controllers/placesController';

const router = Router();

// GET /api/places/nearby?lat=15.85&lng=74.50&radius=5000&type=restaurant|hotel|all
router.get('/nearby', getNearbyPlaces);

export default router;
