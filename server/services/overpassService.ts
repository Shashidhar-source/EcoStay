import { ENV } from '../config/env';
import { cacheService } from './cacheService';
import { 
  OSMElement, 
  parseOsmHotel, 
  parseOsmRestaurant, 
  StandardHotel, 
  StandardRestaurant 
} from '../utils/osmParser';

export class OverpassService {
  private endpoints: string[];

  constructor() {
    this.endpoints = [ENV.OVERPASS_API_URL, ...ENV.OVERPASS_FALLBACK_URLS];
  }

  // Execute raw Overpass QL query with fallback servers and retries
  async executeQuery(query: string, timeoutMs: number = 4000): Promise<OSMElement[]> {
    const cacheKey = `overpass_${Buffer.from(query).toString('base64').slice(0, 48)}`;
    const cached = cacheService.get<OSMElement[]>(cacheKey);
    if (cached) {
      return cached;
    }

    let lastError: Error | null = null;

    for (const endpoint of this.endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': ENV.NOMINATIM_USER_AGENT
          },
          body: `data=${encodeURIComponent(query)}`,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Overpass server ${endpoint} returned HTTP ${response.status}`);
        }

        const data = await response.json();
        const elements: OSMElement[] = data?.elements || [];

        // Cache successful query result for 1 hour
        cacheService.set(cacheKey, elements, ENV.CACHE_TTL_SECONDS);
        return elements;
      } catch (err: any) {
        lastError = err;
        console.warn(`Overpass endpoint ${endpoint} failed (${err.message}). Trying fallback endpoint...`);
      }
    }

    throw new Error(`All Overpass API endpoints failed. Last error: ${lastError?.message || 'Unknown'}`);
  }

  // Fetch Nearby Hotels from OpenStreetMap
  async fetchNearbyHotels(
    lat: number,
    lng: number,
    radiusMeters: number = ENV.DEFAULT_SEARCH_RADIUS_METERS
  ): Promise<StandardHotel[]> {
    const boundedRadius = Math.min(radiusMeters, ENV.MAX_SEARCH_RADIUS_METERS);
    
    // Build Overpass QL for accommodations
    const query = `
      [out:json][timeout:15];
      (
        node["tourism"~"hotel|hostel|guest_house|camp_site|chalet"](around:${boundedRadius},${lat},${lng});
        way["tourism"~"hotel|hostel|guest_house|camp_site|chalet"](around:${boundedRadius},${lat},${lng});
        relation["tourism"~"hotel|hostel|guest_house|camp_site|chalet"](around:${boundedRadius},${lat},${lng});
      );
      out center tags;
    `;

    try {
      const elements = await this.executeQuery(query);
      const hotels: StandardHotel[] = [];

      for (const element of elements) {
        const hotel = parseOsmHotel(element, lat, lng);
        if (hotel) {
          hotels.push(hotel);
        }
      }

      // Sort closest first
      hotels.sort((a, b) => (a.distance?.meters || 0) - (b.distance?.meters || 0));
      return hotels;
    } catch (error) {
      console.error('Failed to fetch hotels from Overpass:', error);
      throw error;
    }
  }

  // Fetch Nearby Restaurants & Food Outlets from OpenStreetMap
  async fetchNearbyRestaurants(
    lat: number,
    lng: number,
    radiusMeters: number = ENV.DEFAULT_SEARCH_RADIUS_METERS
  ): Promise<StandardRestaurant[]> {
    const boundedRadius = Math.min(radiusMeters, ENV.MAX_SEARCH_RADIUS_METERS);

    // Build Overpass QL for food outlets
    const query = `
      [out:json][timeout:15];
      (
        node["amenity"~"restaurant|cafe|fast_food|food_court"](around:${boundedRadius},${lat},${lng});
        way["amenity"~"restaurant|cafe|fast_food|food_court"](around:${boundedRadius},${lat},${lng});
        relation["amenity"~"restaurant|cafe|fast_food|food_court"](around:${boundedRadius},${lat},${lng});
      );
      out center tags;
    `;

    try {
      const elements = await this.executeQuery(query);
      const restaurants: StandardRestaurant[] = [];

      for (const element of elements) {
        const rest = parseOsmRestaurant(element, lat, lng);
        if (rest) {
          restaurants.push(rest);
        }
      }

      // Sort closest first
      restaurants.sort((a, b) => (a.distance?.meters || 0) - (b.distance?.meters || 0));
      return restaurants;
    } catch (error) {
      console.error('Failed to fetch restaurants from Overpass:', error);
      throw error;
    }
  }
}

export const overpassService = new OverpassService();
