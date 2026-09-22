import { cacheService } from './cacheService';

export interface GooglePlaceEnrichment {
  placeId: string;
  name: string;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number; // 0 = Free, 1 = Inexpensive, 2 = Moderate, 3 = Expensive, 4 = Very Expensive
  formattedAddress?: string;
  photos?: string[];
  googleMapsUrl?: string;
  isOpenNow?: boolean;
}

export class GooglePlacesService {
  private apiKey: string | null;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || null;
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim() !== '' && !this.apiKey.includes('your_');
  }

  // Search Google Places for live photos, real ratings, price level, and Google Maps URL
  async searchPlace(
    name: string,
    lat: number,
    lng: number
  ): Promise<GooglePlaceEnrichment | null> {
    if (!this.isConfigured()) return null;

    const cacheKey = `gplaces_${name.toLowerCase()}_${lat.toFixed(3)}_${lng.toFixed(3)}`;
    const cached = cacheService.get<GooglePlaceEnrichment>(cacheKey);
    if (cached !== null) return cached;

    try {
      const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
      url.searchParams.set('keyword', name);
      url.searchParams.set('location', `${lat},${lng}`);
      url.searchParams.set('radius', '1000');
      url.searchParams.set('key', this.apiKey!);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(url.toString(), { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) return null;

      const data = await res.json();
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const place = data.results[0];

        // Format photo URLs
        const photos: string[] = [];
        if (place.photos && place.photos.length > 0) {
          for (const p of place.photos.slice(0, 3)) {
            photos.push(
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${p.photo_reference}&key=${this.apiKey}`
            );
          }
        }

        const enrichment: GooglePlaceEnrichment = {
          placeId: place.place_id,
          name: place.name,
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          priceLevel: place.price_level,
          formattedAddress: place.vicinity,
          photos: photos.length > 0 ? photos : undefined,
          googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
          isOpenNow: place.opening_hours?.open_now
        };

        cacheService.set(cacheKey, enrichment, 86400 * 3); // Cache for 3 days
        return enrichment;
      }
    } catch (e) {
      console.warn('Google Places API request encountered an error; using fallback data.');
    }

    return null;
  }
}

export const googlePlacesService = new GooglePlacesService();
