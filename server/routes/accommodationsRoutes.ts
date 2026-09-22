import { Router } from 'express';
import { 
  getAllAccommodations, 
  getAccommodationById, 
  generateRecommendations, 
  saveAccommodation, 
  deleteAccommodation, 
  getAdminMetrics 
} from '../controllers/accommodationsController';

const router = Router();

// GET /api/accommodations
router.get('/', getAllAccommodations);

// GET /api/accommodations/:id
router.get('/:id', getAccommodationById);

// POST /api/recommendations
router.post('/recommendations', generateRecommendations);

// Admin endpoints
router.get('/admin/metrics', getAdminMetrics);
router.post('/admin/accommodations', saveAccommodation);
router.put('/admin/accommodations/:id', saveAccommodation);
router.delete('/admin/accommodations/:id', deleteAccommodation);

export default router;
