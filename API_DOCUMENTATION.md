# EcoStay Multi-Provider API Documentation

This document provides comprehensive technical documentation for the EcoStay REST API backend and Multi-Provider Discovery Engine, covering provider abstractions (Google Places, Foursquare, OpenStreetMap Overpass, EcoStay Verified Knowledge Base), food classification, itemized menu management, geocoding, OSRM routing, and administrator telemetry monitoring.

---

## 📡 1. Provider Abstraction Architecture

EcoStay implements an intelligent multi-provider discovery pipeline with priority ordering, graceful failover, cross-provider deduplication, and telemetry tracking:

```
[Incoming Request: Lat, Lng, Radius, Filters]
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│               Provider Orchestrator Layer               │
├────────────────────────────────────────────────────────┤
│ 1. EcoStay Verified Database (High-trust eco audits & ₹ menus)
│ 2. Google Places (New) API (Optional `GOOGLE_MAPS_API_KEY`)
│ 3. Foursquare Places v3 API (Optional `FOURSQUARE_API_KEY`)
│ 4. OpenStreetMap / Overpass (100% Free & Open Geo Layer)
└────────────────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│ Deduplication (<300m + normalized name) & Data Fusion  │
└────────────────────────────────────────────────────────┘
                     │
                     ▼
[Normalized Data Stream: Stays, Dining, Menus, Freshness Badges]
```

### Provider Matrix

| Provider | Supported Discoveries | Key Required? | Freshness Status | Role in EcoStay |
| :--- | :--- | :--- | :--- | :--- |
| **EcoStay Verified DB** | Stays, Dining, Menus, EcoScores | None | `VERIFIED` | Primary ground truth for 6-pillar GRIHA/IGBC eco scores and verified INR menu prices. |
| **Google Places (New)** | Hotels, Dining, Photos, Ratings | `GOOGLE_MAPS_API_KEY` | `LIVE` | Real-time high-resolution place photos, live ratings, and direct Google Maps navigation links. |
| **Foursquare Places v3** | Hotels, Cafes, Restaurants | `FOURSQUARE_API_KEY` | `LIVE` | Secondary live commercial place search with operating hours and categories. |
| **OpenStreetMap Overpass** | Stays, Dining, Hostels, Dhabas | None (100% Free) | `CACHED` / `LIVE` | Open geospatial backbone operating globally with zero API key dependencies. |

---

## ⚙️ 2. Environment Configuration (`.env`)

```env
PORT=5000
NODE_ENV=development

# Optional External API Keys
GOOGLE_MAPS_API_KEY=
FOURSQUARE_API_KEY=

# OpenStreetMap & Geocoding Endpoints
OVERPASS_API_URL=https://overpass-api.de/api/interpreter
NOMINATIM_API_URL=https://nominatim.openstreetmap.org
NOMINATIM_USER_AGENT=EcoStayTravelPlatform/1.0 (contact@ecostay.in)
OSRM_ROUTING_URL=http://router.project-osrm.org

# Performance & Search Defaults
CACHE_TTL_SECONDS=3600
DEFAULT_SEARCH_RADIUS_METERS=5000
MAX_SEARCH_RADIUS_METERS=50000
```

---

## 🚀 3. REST API Endpoints Reference

### 1. Unified Nearby Places
- **Endpoint**: `GET /api/places/nearby`
- **Query Parameters**:
  - `lat` (required): Latitude (`number`)
  - `lng` (required): Longitude (`number`)
  - `radius` (optional): Search radius in meters (default: `5000`, max: `50000`)
  - `type` (optional): `'stay'` | `'hotel'` | `'dining'` | `'restaurant'` | `'all'` (default: `'all'`)
- **Sample Response**:
```json
{
  "success": true,
  "source": "Multi-Provider Engine (Google Places + Foursquare + OSM + EcoStay DB)",
  "center": { "lat": 11.6854, "lng": 76.1320 },
  "radiusMeters": 10000,
  "count": 42,
  "data": {
    "hotels": [...],
    "restaurants": [...],
    "all": [...]
  }
}
```

---

### 2. Nearby Hotels & Eco-Stays
- **Endpoint**: `GET /api/hotels/nearby`
- **Query Parameters**:
  - `lat` (required): Latitude
  - `lng` (required): Longitude
  - `radius` (optional): Radius in meters
  - `minEcoScore` (optional): Minimum calculated EcoScore (60–95)
  - `budgetMax` (optional): Maximum nightly price in ₹ INR
  - `budgetMin` (optional): Minimum nightly price in ₹ INR
  - `minRating` (optional): Minimum rating (e.g. `4.0`)
- **Sample Response Item**:
```json
{
  "id": "eco_1",
  "name": "Wayanad Canopy Bamboo Bio-Lodge",
  "category": "treehouse",
  "type": "stay",
  "latitude": 11.6854,
  "longitude": 76.1320,
  "address": "Meppadi, Wayanad, Kerala, India",
  "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Wayanad...",
  "images": ["https://images.unsplash.com/..."],
  "rating": 4.9,
  "userRatingsTotal": 128,
  "priceRange": "budget",
  "estimatedPriceInr": 4850,
  "sustainabilityRating": "verified",
  "sustainabilityEcoScore": 96,
  "sustainabilityDetails": {
    "solar": true,
    "organic": true,
    "greenMaterial": true,
    "recycling": true,
    "waterConservation": true
  },
  "source": "EcoStay Database",
  "verificationStatus": "VERIFIED",
  "lastUpdated": "2026-09-21T16:25:20.000Z",
  "distance": {
    "meters": 0,
    "km": 0,
    "formatted": "0 m",
    "drivingMinutes": 0,
    "formattedTravelTime": "0 mins"
  }
}
```

---

### 3. Nearby Dining & Food Discovery
- **Endpoint**: `GET /api/restaurants/nearby`
- **Query Parameters**:
  - `lat` (required): Latitude
  - `lng` (required): Longitude
  - `radius` (optional): Radius in meters
  - `foodType` (optional): `'pure_vegetarian'` | `'vegetarian_friendly'` | `'non_vegetarian'` | `'mixed'` | `'all'`
  - `budgetMax` (optional): Maximum average meal cost in ₹ INR (e.g. `100`, `200`, `400`)
  - `budgetMin` (optional): Minimum average meal cost in ₹ INR
  - `cuisine` (optional): Cuisine substring (e.g. `'kerala'`, `'ayurvedic'`, `'south indian'`, `'dhaba'`)
  - `minRating` (optional): Rating threshold
- **Sample Response Item**:
```json
{
  "id": "rest_wayanad_1",
  "name": "Malabar Heritage Organic Thali House",
  "category": "restaurant",
  "type": "dining",
  "latitude": 11.6880,
  "longitude": 76.1345,
  "address": "Near Pookode Lake Road, Wayanad, Kerala, 673576",
  "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=...",
  "images": ["https://images.unsplash.com/..."],
  "rating": 4.8,
  "userRatingsTotal": 64,
  "priceRange": "budget",
  "averageMealCostInr": 280,
  "cuisine": ["Kerala", "South Indian", "Ayurvedic", "Organic"],
  "vegetarian": true,
  "nonVegetarian": false,
  "dietInfo": "pure_vegetarian",
  "source": "EcoStay Database",
  "verificationStatus": "VERIFIED",
  "menu": [
    {
      "id": "m1_1",
      "name": "Grand Wayanad Organic Sadhya Thali",
      "description": "Traditional 24-item feast served on banana leaf with organic red rice",
      "priceInr": 280,
      "category": "thali",
      "isVegetarian": true,
      "isVegan": false
    }
  ],
  "distance": {
    "meters": 395,
    "km": 0.4,
    "formatted": "395 m",
    "drivingMinutes": 2,
    "formattedTravelTime": "2 mins"
  }
}
```

---

### 4. Itemized Menu Retrieval & Addition
- **GET** `/api/restaurants/:id/menu`
  - Returns itemized menu with dish names, descriptions, INR prices, dietary tags.
- **POST** `/api/restaurants/:id/menu`
  - Body:
  ```json
  {
    "name": "Organic Kerala Coconut Kokum Cooler",
    "description": "Chilled tender coconut water with crushed fresh kokum and mint",
    "priceInr": 90,
    "category": "beverages",
    "isVegetarian": true,
    "isVegan": true
  }
  ```

---

### 5. Multi-Provider Telemetry & Health Monitoring
- **Endpoint**: `GET /api/admin/providers/status`
- **Sample Response**:
```json
{
  "success": true,
  "timestamp": "2026-09-21T16:25:20.832Z",
  "summary": {
    "totalProviders": 4,
    "activeProviders": 2,
    "totalRequests": 10,
    "totalErrors": 0,
    "errorRatePercent": 0
  },
  "providers": [
    {
      "providerName": "Google Places (New) API",
      "status": "DISABLED",
      "totalRequests": 0,
      "successfulRequests": 0,
      "failedRequests": 0,
      "avgLatencyMs": 0,
      "lastActive": null,
      "lastError": "API key not provided in environment"
    },
    {
      "providerName": "Foursquare Places API v3",
      "status": "DISABLED",
      "totalRequests": 0,
      "successfulRequests": 0,
      "failedRequests": 0,
      "avgLatencyMs": 0,
      "lastActive": null,
      "lastError": "API key not provided in environment"
    },
    {
      "providerName": "OpenStreetMap Overpass API",
      "status": "ACTIVE",
      "totalRequests": 5,
      "successfulRequests": 5,
      "failedRequests": 0,
      "avgLatencyMs": 210,
      "lastActive": "2026-09-21T16:25:20.000Z",
      "lastError": null
    },
    {
      "providerName": "EcoStay Verified Knowledge Base",
      "status": "ACTIVE",
      "totalRequests": 5,
      "successfulRequests": 5,
      "failedRequests": 0,
      "avgLatencyMs": 8,
      "lastActive": "2026-09-21T16:25:20.000Z",
      "lastError": null
    }
  ]
}
```

---

### 6. Geocoding & Route Calculation
- `GET /api/geocode?q=Wayanad`
- `GET /api/geocode/reverse?lat=11.6854&lng=76.1320`
- `GET /api/route?startLat=11.6854&startLng=76.1320&endLat=12.4244&endLng=75.7382`

---

## 🧪 4. Automated Testing

Run the comprehensive test suite verifying all 12 discovery and management endpoints:

```bash
npm run test:api
```
