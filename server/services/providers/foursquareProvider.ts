import { PlaceProvider, PlaceSearchParams, NormalizedPlace, PlaceCategory, FoodClassification } from './placeProvider.interface';
import { calculateHaversineDistance, estimateTravelTime } from '../../utils/geoUtils';
import { cacheService } from '../cacheService';

export class FoursquareProvider implements PlaceProvider {
  readonly name = 'Foursquare';
  private apiKey: string | null;

  constructor() {
    this.apiKey = process.env.FOURSQUARE_API_KEY || null;
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.trim() !== '' && !this.apiKey.includes('your_');
  }

  async searchHotels(params: PlaceSearchParams): Promise<NormalizedPlace[]> {
    if (!this.isAvailable()) return [];
    return this.queryFoursquare(params, '19014', 'hotel'); // 19014 = Hotel and Motel
  }

  async searchRestaurants(params: PlaceSearchParams): Promise<NormalizedPlace[]> {
    if (!this.isAvailable()) return [];
    return this.queryFoursquare(params, '13065', 'restaurant'); // 13065 = Restaurant
  }

  private async queryFoursquare(
    params: PlaceSearchParams,
    categoryId: string,
    placeType: 'hotel' | 'restaurant'
  ): Promise<NormalizedPlace[]> {
    const { lat, lng, radiusMeters = 5000, query } = params;
    const cacheKey = `fsq_${placeType}_${lat.toFixed(3)}_${lng.toFixed(3)}_${radiusMeters}_${query || ''}`;

    const cached = cacheService.get<NormalizedPlace[]>(cacheKey);
    if (cached) return cached;

    try {
      const url = new URL('https://api.foursquare.com/v3/places/search');
      url.searchParams.set('ll', `${lat},${lng}`);
      url.searchParams.set('radius', Math.min(radiusMeters, 50000).toString());
      url.searchParams.set('categories', categoryId);
      url.searchParams.set('fields', 'fsq_id,name,geocodes,location,categories,rating,stats,price,photos,tel,website,hours');
      url.searchParams.set('limit', '30');
      if (query) url.searchParams.set('query', query);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': this.apiKey!,
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!response.ok) return [];

      const data = await response.json();
      if (!Array.isArray(data.results)) return [];

      const places: NormalizedPlace[] = [];

      for (const item of data.results) {
        const itemLat = item.geocodes?.main?.latitude;
        const itemLng = item.geocodes?.main?.longitude;
        if (!itemLat || !itemLng) continue;

        const dist = calculateHaversineDistance(lat, lng, itemLat, itemLng);
        const travel = estimateTravelTime(dist.distanceMeters);

        const photos: string[] = [];
        if (Array.isArray(item.photos)) {
          for (const p of item.photos.slice(0, 3)) {
            if (p.prefix && p.suffix) {
              photos.push(`${p.prefix}original${p.suffix}`);
            }
          }
        }

        const priceLevel = item.price; // 1 to 4
        let priceRange: 'budget' | 'moderate' | 'expensive' | 'luxury' | 'unknown' = 'unknown';
        let estimatedPriceInr: number | undefined;
        let averageMealCostInr: number | undefined;

        if (priceLevel === 1) {
          priceRange = 'budget';
          estimatedPriceInr = 2000;
          averageMealCostInr = 220;
        } else if (priceLevel === 2) {
          priceRange = 'moderate';
          estimatedPriceInr = 4500;
          averageMealCostInr = 550;
        } else if (priceLevel === 3) {
          priceRange = 'expensive';
          estimatedPriceInr = 8500;
          averageMealCostInr = 1100;
        } else if (priceLevel === 4) {
          priceRange = 'luxury';
          estimatedPriceInr = 16000;
          averageMealCostInr = 2400;
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
        } else if (nameLower.includes('non veg') || nameLower.includes('chicken') || nameLower.includes('biryani')) {
          dietInfo = 'non_vegetarian';
          vegetarian = false;
          nonVegetarian = true;
        }

        const category: PlaceCategory = placeType === 'hotel' ? 'hotel' : 'restaurant';

        const place: NormalizedPlace = {
          id: `fsq_${item.fsq_id}`,
          name: item.name,
          category,
          type: placeType === 'hotel' ? 'stay' : 'dining',
          latitude: itemLat,
          longitude: itemLng,
          address: item.location?.formatted_address || item.location?.address || 'Address on Foursquare',
          phone: item.tel || null,
          website: item.website || null,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name)}&query_place_id=${itemLat},${itemLng}`,
          isOpenNow: item.hours?.is_open_now ?? null,
          images: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'],
          rating: item.rating ? Math.round((item.rating / 2) * 10) / 10 : 4.3, // Foursquare ratings are 0-10 -> map to 0-5
          userRatingsTotal: item.stats?.total_ratings || item.stats?.total_photos || 12,
          priceLevel,
          priceRange,
          estimatedPriceInr: placeType === 'hotel' ? estimatedPriceInr : undefined,
          averageMealCostInr: placeType === 'restaurant' ? averageMealCostInr : undefined,
          cuisine: Array.isArray(item.categories) ? item.categories.map((c: any) => c.name) : ['Local Cuisine'],
          vegetarian,
          nonVegetarian,
          dietInfo: placeType === 'restaurant' ? dietInfo : undefined,
          source: 'Foursquare',
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

      cacheService.set(cacheKey, places, 3600 * 2);
      return places;
    } catch (err) {
      console.warn('FoursquareProvider request failed:', err);
      return [];
    }
  }
}
