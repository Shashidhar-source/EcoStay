import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // External Provider Keys
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
  FOURSQUARE_API_KEY: process.env.FOURSQUARE_API_KEY || '',

  // Overpass API Endpoints
  OVERPASS_API_URL: process.env.OVERPASS_API_URL || 'https://overpass-api.de/api/interpreter',
  OVERPASS_FALLBACK_URLS: process.env.OVERPASS_FALLBACK_URLS
    ? process.env.OVERPASS_FALLBACK_URLS.split(',').map(u => u.trim())
    : [
        'https://lz4.overpass-api.de/api/interpreter',
        'https://z.overpass-api.de/api/interpreter',
        'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
      ],

  // Nominatim OpenStreetMap Geocoder
  NOMINATIM_API_URL: process.env.NOMINATIM_API_URL || 'https://nominatim.openstreetmap.org',
  NOMINATIM_USER_AGENT: process.env.NOMINATIM_USER_AGENT || 'EcoStayTravelPlatform/1.0 (contact@ecostay.in)',

  // OSRM Routing
  OSRM_ROUTING_URL: process.env.OSRM_ROUTING_URL || 'http://router.project-osrm.org',

  // Cache & Bounds
  CACHE_TTL_SECONDS: parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10),
  DEFAULT_SEARCH_RADIUS_METERS: parseInt(process.env.DEFAULT_SEARCH_RADIUS_METERS || '5000', 10),
  MAX_SEARCH_RADIUS_METERS: parseInt(process.env.MAX_SEARCH_RADIUS_METERS || '50000', 10)
};
