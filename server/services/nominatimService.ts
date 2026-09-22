import { ENV } from '../config/env';
import { cacheService } from './cacheService';

export interface GeocodeResult {
  placeId: number;
  displayName: string;
  name: string;
  type: string;
  category: string;
  latitude: number;
  longitude: number;
  address?: Record<string, string>;
  boundingBox?: [number, number, number, number];
}

class NominatimService {
  // Search address/city to coordinates (Forward Geocoding)
  async geocode(query: string, limit: number = 5): Promise<GeocodeResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const cacheKey = `geocode_${cleanQuery.toLowerCase()}_${limit}`;
    const cached = cacheService.get<GeocodeResult[]>(cacheKey);
    if (cached) return cached;

    const url = new URL(`${ENV.NOMINATIM_API_URL}/search`);
    url.searchParams.set('q', cleanQuery);
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('countrycodes', 'in'); // prioritize India

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': ENV.NOMINATIM_USER_AGENT,
          'Accept-Language': 'en'
        }
      });

      if (!response.ok) {
        throw new Error(`Nominatim error: HTTP ${response.status}`);
      }

      const data = await response.json();
      const results: GeocodeResult[] = (data || []).map((item: any) => ({
        placeId: item.place_id,
        displayName: item.display_name,
        name: item.name || item.display_name.split(',')[0],
        type: item.type,
        category: item.class,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        address: item.address,
        boundingBox: item.boundingbox ? item.boundingbox.map(Number) : undefined
      }));

      // Cache for 24 hours
      cacheService.set(cacheKey, results, 86400);
      return results;
    } catch (error) {
      console.error('Geocoding service failure:', error);
      throw error;
    }
  }

  // Reverse Geocoding (Coordinates to Place Name)
  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
    const cacheKey = `reverse_${lat.toFixed(4)}_${lng.toFixed(4)}`;
    const cached = cacheService.get<GeocodeResult>(cacheKey);
    if (cached) return cached;

    const url = new URL(`${ENV.NOMINATIM_API_URL}/reverse`);
    url.searchParams.set('lat', lat.toString());
    url.searchParams.set('lon', lng.toString());
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': ENV.NOMINATIM_USER_AGENT,
          'Accept-Language': 'en'
        }
      });

      if (!response.ok) {
        throw new Error(`Nominatim reverse error: HTTP ${response.status}`);
      }

      const item = await response.json();
      if (!item || item.error) return null;

      const result: GeocodeResult = {
        placeId: item.place_id,
        displayName: item.display_name,
        name: item.name || item.display_name.split(',')[0],
        type: item.type,
        category: item.class,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        address: item.address
      };

      cacheService.set(cacheKey, result, 86400);
      return result;
    } catch (error) {
      console.error('Reverse geocoding failure:', error);
      return null;
    }
  }
}

export const nominatimService = new NominatimService();
