import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ENV } from './config/env';

// Route Imports
import placesRoutes from './routes/placesRoutes';
import hotelsRoutes from './routes/hotelsRoutes';
import restaurantsRoutes from './routes/restaurantsRoutes';
import geocodeRoutes from './routes/geocodeRoutes';
import routeRoutes from './routes/routeRoutes';
import accommodationsRoutes from './routes/accommodationsRoutes';
import adminRoutes from './routes/adminRoutes';
import { generateRecommendations } from './controllers/accommodationsController';

const app = express();

// Security & Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root & Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'EcoStay API Backend',
    version: '1.2.0',
    endpoints: {
      places: '/api/places/nearby?lat=...&lng=...&radius=...&type=...',
      hotels: '/api/hotels/nearby?lat=...&lng=...&radius=...',
      restaurants: '/api/restaurants/nearby?lat=...&lng=...',
      restaurantDetail: '/api/restaurants/:id',
      restaurantMenu: '/api/restaurants/:id/menu',
      geocode: '/api/geocode?q=...',
      reverseGeocode: '/api/geocode/reverse?lat=...&lng=...',
      route: '/api/route?startLat=...&startLng=...&endLat=...&endLng=...',
      accommodations: '/api/accommodations',
      recommendations: 'POST /api/recommendations',
      adminProvidersStatus: '/api/admin/providers/status'
    }
  });
});

// Mount Routes
app.use('/api/places', placesRoutes);
app.use('/api/hotels', hotelsRoutes);
app.use('/api/restaurants', restaurantsRoutes);
app.use('/api/geocode', geocodeRoutes);
app.use('/api/search', geocodeRoutes); // Alias for location search
app.use('/api/route', routeRoutes);
app.use('/api/accommodations', accommodationsRoutes);
app.use('/api/admin', adminRoutes);
app.post('/api/recommendations', generateRecommendations);

// 404 Handler for undefined API routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `API route '${req.method} ${req.originalUrl}' not found`
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(ENV.PORT, () => {
    console.log(`\n=================================================`);
    console.log(`🌿 EcoStay Sustainable Travel Backend Server`);
    console.log(`🚀 Running at: http://localhost:${ENV.PORT}`);
    console.log(`📡 Overpass API: ${ENV.OVERPASS_API_URL}`);
    console.log(`🗺️  Nominatim Geocoder: ${ENV.NOMINATIM_API_URL}`);
    console.log(`🚗 OSRM Routing: ${ENV.OSRM_ROUTING_URL}`);
    console.log(`=================================================\n`);
  });
}

export default app;
