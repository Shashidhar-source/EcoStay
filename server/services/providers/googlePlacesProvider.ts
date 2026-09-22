import { PlaceProvider, PlaceSearchParams, NormalizedPlace, PlaceCategory, FoodClassification } from './placeProvider.interface';
import { calculateHaversineDistance, estimateTravelTime } from '../../utils/geoUtils';
import { cacheService } from '../cacheService';

export class GooglePlacesProvider implements PlaceProvider {
  readonly name = 'Google Places';
  private apiKey: string | null;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || null;
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.trim() !== '' && !this.apiKey.includes('your_');
  }

  async searchHotels(params: PlaceSearchParams): Promise<NormalizedPlace[]> {
    if (!this.isAvailable()) return [];
    return this.queryPlaces(params, 'lodging', 'hotel');
  }

  async searchRestaurants(params: PlaceSearchParams): Promise<NormalizedPlace[]> {
    if (!this.isAvailable()) return [];
    return this.queryPlaces(params, 'restaurant', 'restaurant');
  }

  private async queryPlaces(
    params: PlaceSearchParams,
    typeParam: string,
    placeType: 'hotel' | 'restaurant'
  ): Promise<NormalizedPlace[]> {
    const { lat, lng, radiusMeters = 5000, query } = params;
    const cacheKey = `gplaces_${placeType}_${lat.toFixed(3)}_${lng.toFixed(3)}_${radiusMeters}_${query || ''}`;
    
    const cached = cacheService.get<NormalizedPlace[]>(cacheKey);
    if (cached) return cached;

    try {
      const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
      url.searchParams.set('location', `${lat},${lng}`);
      url.searchParams.set('radius', Math.min(radiusMeters, 50000).toString());
      url.searchParams.set('type', typeParam);
      if (query) url.searchParams.set('keyword', query);
      url.searchParams.set('key', this.apiKey!);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url.toString(), { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) return [];

      const data = await response.json();
      if (data.status !== 'OK' || !Array.isArray(data.results)) {
        return [];
      }

      const places: NormalizedPlace[] = [];

      for (const item of data.results) {
        const itemLat = item.geometry?.location?.lat;
        const itemLng = item.geometry?.location?.lng;
        if (!itemLat || !itemLng) continue;

        const dist = calculateHaversineDistance(lat, lng, itemLat, itemLng);
        const travel = estimateTravelTime(dist.distanceMeters);

        const photos: string[] = [];
        if (item.photos && item.photos.length > 0) {
          for (const p of item.photos.slice(0, 3)) {
            photos.push(
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${p.photo_reference}&key=${this.apiKey}`
            );
          }
        }

        const priceLevel = item.price_level;
        let priceRange: 'budget' | 'moderate' | 'expensive' | 'luxury' | 'unknown' = 'unknown';
        let estimatedPriceInr: number | undefined;
        let averageMealCostInr: number | undefined;

        if (priceLevel === 0 || priceLevel === 1) {
          priceRange = 'budget';
          estimatedPriceInr = 1800;
          averageMealCostInr = 200;
        } else if (priceLevel === 2) {
          priceRange = 'moderate';
          estimatedPriceInr = 4500;
          averageMealCostInr = 500;
        } else if (priceLevel === 3) {
          priceRange = 'expensive';
          estimatedPriceInr = 9000;
          averageMealCostInr = 1200;
        } else if (priceLevel === 4) {
          priceRange = 'luxury';
          estimatedPriceInr = 18000;
          averageMealCostInr = 2500;
        }

        const nameLower = (item.name || '').toLowerCase();
        let dietInfo: FoodClassification = 'unknown';
        let vegetarian: boolean | null = null;
        let nonVegetarian: boolean | null = null;

        if (nameLower.includes('pure veg') || nameLower.includes('shudh shakahari') || nameLower.includes('jain')) {
          dietInfo = 'pure_vegetarian';
          vegetarian = true;
          nonVegetarian = false;
        } else if (nameLower.includes('veg') && !nameLower.includes('non-veg') && !nameLower.includes('non veg')) {
          dietInfo = 'vegetarian_friendly';
          vegetarian = true;
        } else if (nameLower.includes('non veg') || nameLower.includes('chicken') || nameLower.includes('biryani') || nameLower.includes('fish')) {
          dietInfo = 'non_vegetarian';
          vegetarian = false;
          nonVegetarian = true;
        }

        const category: PlaceCategory = placeType === 'hotel' ? 'hotel' : 'restaurant';

        const place: NormalizedPlace = {
          id: `gplace_${item.place_id}`,
          name: item.name,
          category,
          type: placeType === 'hotel' ? 'stay' : 'dining',
          latitude: itemLat,
          longitude: itemLng,
          address: item.vicinity || item.formatted_address || 'Address on Google Maps',
          googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${item.place_id}`,
          isOpenNow: item.opening_hours?.open_now ?? null,
          images: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'],
          rating: item.rating || 4.2,
          userRatingsTotal: item.user_ratings_total || 1,
          priceLevel,
          priceRange,
          estimatedPriceInr: placeType === 'hotel' ? estimatedPriceInr : undefined,
          averageMealCostInr: placeType === 'restaurant' ? averageMealCostInr : undefined,
          cuisine: placeType === 'restaurant' ? ['Multi-Cuisine', 'Indian'] : undefined,
          vegetarian,
          nonVegetarian,
          dietInfo: placeType === 'restaurant' ? dietInfo : undefined,
          source: 'Google Places',
          verificationStatus: 'LIVE',
          lastUpdated: new Date().toISOString(),
          distance: {
            meters: dist.distanceMeters,
            km: dist.distanceKm,
            formatted: dist.formatted,
            drivingMinutes: travel.drivingMinutes,
            formattedTravelTime: travel.formattedDriving
          }
        };

        places.push(place);
      }

      cacheService.set(cacheKey, places, 3600 * 2); // Cache for 2 hours
      return places;
    } catch (err) {
      console.warn('GooglePlacesProvider request failed:', err);
      return [];
    }
  }
}
