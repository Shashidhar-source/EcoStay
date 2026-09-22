import { Router } from 'express';
import { geocodeLocation, reverseGeocodeLocation } from '../controllers/geocodingController';

const router = Router();

// GET /api/geocode?q=...
router.get('/', geocodeLocation);

// GET /api/geocode/reverse?lat=...&lng=...
router.get('/reverse', reverseGeocodeLocation);

export default router;
