import { PlaceProvider, PlaceSearchParams, NormalizedPlace } from './placeProvider.interface';
import { overpassService } from '../overpassService';
import { mediaEnrichmentService } from '../mediaEnrichmentService';
import { cacheService } from '../cacheService';

export class OsmProvider implements PlaceProvider {
  readonly name = 'OpenStreetMap';

  isAvailable(): boolean {
    return true; // Always available as free and open geospatial layer
  }

  async searchHotels(params: PlaceSearchParams): Promise<NormalizedPlace[]> {
    const { lat, lng, radiusMeters = 5000 } = params;
    const cacheKey = `osm_hotels_${lat.toFixed(3)}_${lng.toFixed(3)}_${radiusMeters}`;

    const cached = cacheService.get<NormalizedPlace[]>(cacheKey);
    if (cached) return cached;

    try {
      const hotels = await overpassService.fetchNearbyHotels(lat, lng, radiusMeters);
      const normalized: NormalizedPlace[] = [];

      for (const h of hotels) {
        // Resolve images if placeholder
        let images = h.images;
        if (!images || images.length === 0 || images[0].includes('unsplash')) {
          const enriched = mediaEnrichmentService.resolveAccommodationImages(h.name, h.propertyTypeCategory);
          if (enriched.length > 0) images = enriched;
        }

        normalized.push({
          id: h.id,
          name: h.name,
          category: h.propertyTypeCategory,
          type: 'stay',
          latitude: h.latitude,
          longitude: h.longitude,
          address: h.address,
          phone: h.phone,
          website: h.website,
          googleMapsUrl: h.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name)}&query_place_id=${h.latitude},${h.longitude}`,
          isOpenNow: null,
          openingHours: h.openingHours,
          images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'],
          rating: h.rating || 4.4,
          userRatingsTotal: h.userRatingsTotal || 24,
          priceLevel: h.stars ? Math.min(4, Math.max(1, Math.floor(h.stars * 0.8))) : 2,
          priceRange: h.priceRange,
          estimatedPriceInr: h.estimatedPriceInr || 3200,
          sustainabilityRating: h.sustainability,
          sustainabilityDetails: h.sustainabilityDetails,
          amenities: h.amenities,
          source: 'OpenStreetMap',
          verificationStatus: 'CACHED',
          lastUpdated: new Date().toISOString(),
          distance: h.distance
        });
      }

      cacheService.set(cacheKey, normalized, 3600);
      return normalized;
    } catch (err) {
      console.warn('OsmProvider searchHotels failed:', err);
      return [];
    }
  }

  async searchRestaurants(params: PlaceSearchParams): Promise<NormalizedPlace[]> {
    const { lat, lng, radiusMeters = 5000 } = params;
    const cacheKey = `osm_restaurants_${lat.toFixed(3)}_${lng.toFixed(3)}_${radiusMeters}`;

    const cached = cacheService.get<NormalizedPlace[]>(cacheKey);
    if (cached) return cached;

    try {
      const restaurants = await overpassService.fetchNearbyRestaurants(lat, lng, radiusMeters);
      const normalized: NormalizedPlace[] = [];

      for (const r of restaurants) {
        let images = r.images;
        if (!images || images.length === 0 || images[0].includes('unsplash')) {
          const enriched = mediaEnrichmentService.resolveRestaurantImages(r.name, r.category);
          if (enriched.length > 0) images = enriched;
        }

        normalized.push({
          id: r.id,
          name: r.name,
          category: r.category,
          type: 'dining',
          latitude: r.latitude,
          longitude: r.longitude,
          address: r.address,
          phone: r.phone,
          website: r.website,
          googleMapsUrl: r.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name)}&query_place_id=${r.latitude},${r.longitude}`,
          isOpenNow: null,
          openingHours: r.openingHours,
          images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'],
          rating: r.rating || 4.5,
          userRatingsTotal: r.userRatingsTotal || 35,
          priceLevel: r.priceRange === 'budget' ? 1 : r.priceRange === 'moderate' ? 2 : 3,
          priceRange: r.priceRange,
          averageMealCostInr: r.averageMealCostInr || 280,
          cuisine: r.cuisine,
          vegetarian: r.vegetarian,
          nonVegetarian: r.nonVegetarian,
          dietInfo: r.dietInfo,
          menu: r.menu,
          source: 'OpenStreetMap',
          verificationStatus: 'CACHED',
          lastUpdated: new Date().toISOString(),
          distance: r.distance
        });
      }

      cacheService.set(cacheKey, normalized, 3600);
      return normalized;
    } catch (err) {
      console.warn('OsmProvider searchRestaurants failed:', err);
      return [];
    }
  }
}
