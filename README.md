# EcoStay: Sustainable Indian Stays & Affordable Discovery Platform

> **"Stay Better. Travel Greener."**  
> A full-stack, location-aware travel & dining discovery platform built with React 18, TypeScript, Tailwind CSS, Vite, Express, and a Multi-Provider Geospatial Engine.

---

## 🌟 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run backend API server
npm run server

# 3. Run frontend development server (with /api proxy to :5000)
npm run dev

# 4. Run automated test suite (12 backend endpoints verification)
npm run test:api

# 5. Production build
npm run build
```

---

## 🗺️ Multi-Provider Discovery Engine

EcoStay connects seamlessly to multiple real-world geospatial and place data providers with automatic failover, deduplication, and caching:

1. **EcoStay Verified Knowledge Base**: High-trust ground truth for 6-pillar GRIHA/IGBC green audits, itemized menus, and authentic dish prices in ₹ INR.
2. **Google Places (New) API**: High-resolution photography, live ratings, reviews, and Google Maps direct directions (configured via `GOOGLE_MAPS_API_KEY`).
3. **Foursquare Places API v3**: Operational status, opening hours, and commercial categories (configured via `FOURSQUARE_API_KEY`).
4. **OpenStreetMap Overpass API**: 100% free and open geospatial backbone for nearby hotels, resorts, homestays, dhabas, and eateries without API keys.

---

## 🥗 Food & Dining Discovery

- **Dietary Classifications**:
  - `🥗 100% Pure Veg` (Shudh Shakahari & Sattvic)
  - `🌱 Veg Friendly` (Extensive vegetarian options)
  - `🍗 Non-Veg Available`
- **Affordable Food Budgets**:
  - Under ₹100
  - ₹100–₹200
  - ₹200–₹400
  - ₹400+
- **Itemized Menus in ₹ INR**:
  - Modal with dish names, descriptions, categories (Thali, Mains, Starters, Beverages), and prices.
  - POST API for adding new verified menu items.

---

## 🌿 6-Pillar GRIHA / IGBC EcoScore Methodology

$$\text{EcoScore} = 0.25 \cdot \text{Solar} + 0.20 \cdot \text{Water} + 0.20 \cdot \text{Waste} + 0.15 \cdot \text{Energy} + 0.10 \cdot \text{Community} + 0.10 \cdot \text{Construction}$$

---

## 📊 Admin Dashboard & API Telemetry

- **Live Data Sources Monitor**: Ping status, request counter, average latency (ms), and error tracking across Google Places, Foursquare, OSM, and EcoStay DB.
- **Accommodations Management**: Full CRUD with live EcoScore preview badge.
- **Review Moderation**: Approve or flag community eco observations.
