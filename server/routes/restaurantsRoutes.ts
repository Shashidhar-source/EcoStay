import { Router } from 'express';
import { 
  getNearbyRestaurants, 
  getRestaurantById, 
  getRestaurantMenu,
  addRestaurantMenuItem
} from '../controllers/restaurantsController';

const router = Router();

// GET /api/restaurants/nearby?lat=...&lng=...&radius=...&cuisine=...&vegetarian=...&budgetLevel=...
router.get('/nearby', getNearbyRestaurants);

// GET /api/restaurants/:id
router.get('/:id', getRestaurantById);

// GET /api/restaurants/:id/menu
router.get('/:id/menu', getRestaurantMenu);

// POST /api/restaurants/:id/menu
router.post('/:id/menu', addRestaurantMenuItem);

export default router;
