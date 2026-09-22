import { PlaceProvider, PlaceSearchParams, NormalizedPlace, FoodClassification } from './placeProvider.interface';
import { SEED_RESTAURANTS } from '../../data/seedRestaurants';
import { SEED_ACCOMMODATIONS } from '../../data/seedAccommodations';
import { calculateHaversineDistance, estimateTravelTime } from '../../utils/geoUtils';

export class LocalDbProvider implements PlaceProvider {
  readonly name = 'EcoStay Database';

  isAvailable(): boolean {
    return true;
  }

  async searchHotels(params: PlaceSearchParams): Promise<NormalizedPlace[]> {
    const { lat, lng, radiusMeters = 50000 } = params;
    const results: NormalizedPlace[] = [];

    for (const acc of SEED_ACCOMMODATIONS) {
      // Find coordinates if available in mock / seed
      // Map known destination names to lat/lng if not directly on accommodation
      let itemLat = 11.6854;
      let itemLng = 76.1320;

      if (acc.location.toLowerCase().includes('wayanad')) {
        itemLat = 11.6854; itemLng = 76.1320;
      } else if (acc.location.toLowerCase().includes('coorg') || acc.location.toLowerCase().includes('madikeri')) {
        itemLat = 12.4244; itemLng = 75.7382;
      } else if (acc.location.toLowerCase().includes('leh') || acc.location.toLowerCase().includes('ladakh')) {
        itemLat = 34.1526; itemLng = 77.5771;
      } else if (acc.location.toLowerCase().includes('rishikesh')) {
        itemLat = 30.0869; itemLng = 78.2676;
      } else if (acc.location.toLowerCase().includes('spiti')) {
        itemLat = 32.2461; itemLng = 78.0349;
      } else if (acc.location.toLowerCase().includes('kumarakom') || acc.location.toLowerCase().includes('kerala')) {
        itemLat = 9.6175; itemLng = 76.4301;
      }

      const dist = calculateHaversineDistance(lat, lng, itemLat, itemLng);
      if (dist.distanceMeters <= radiusMeters) {
        const travel = estimateTravelTime(dist.distanceMeters);

        const price = acc.price_per_night;
        let priceTier: 'budget' | 'moderate' | 'expensive' | 'luxury' = 'moderate';
        if (price < 3500) priceTier = 'budget';
        else if (price < 7500) priceTier = 'moderate';
        else if (price < 15000) priceTier = 'expensive';
        else priceTier = 'luxury';

        results.push({
          id: acc.id,
          name: acc.name,
          category: acc.property_type as any,
          type: 'stay',
          latitude: itemLat,
          longitude: itemLng,
          address: `${acc.location}, ${acc.country}`,
          phone: '+91 98400 12345',
          website: 'https://ecostay.in/accommodations/' + acc.id,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(acc.name)}&query_place_id=${itemLat},${itemLng}`,
          isOpenNow: true,
          images: acc.images,
          rating: acc.rating,
          userRatingsTotal: acc.review_count,
          priceLevel: priceTier === 'budget' ? 1 : priceTier === 'moderate' ? 2 : 3,
          priceRange: priceTier,
          estimatedPriceInr: acc.price_per_night,
          sustainabilityRating: 'verified',
          sustainabilityEcoScore: acc.calculatedEcoScore,
          sustainabilityDetails: {
            solar: acc.sustainability?.solar > 60,
            organic: acc.sustainability?.local_support > 60,
            greenMaterial: acc.sustainability?.green_construction > 60,
            recycling: acc.sustainability?.waste_management > 60,
            waterConservation: acc.sustainability?.water_conservation > 60
          },
          amenities: acc.amenities,
          bedrooms: acc.bedrooms,
          bathrooms: acc.bathrooms,
          maxGuests: acc.max_guests,
          source: 'EcoStay Database',
          verificationStatus: 'VERIFIED',
          lastUpdated: new Date().toISOString(),
          distance: {
            meters: dist.distanceMeters,
            km: dist.distanceKm,
            formatted: dist.formatted,
            drivingMinutes: travel.drivingMinutes,
            formattedTravelTime: travel.formattedDriving
          }
        });
      }
    }

    return results;
  }

  async searchRestaurants(params: PlaceSearchParams): Promise<NormalizedPlace[]> {
    const { lat, lng, radiusMeters = 50000 } = params;
    const results: NormalizedPlace[] = [];

    for (const rest of SEED_RESTAURANTS) {
      const dist = calculateHaversineDistance(lat, lng, rest.latitude, rest.longitude);
      if (dist.distanceMeters <= radiusMeters) {
        const travel = estimateTravelTime(dist.distanceMeters);

        results.push({
          id: rest.id,
          name: rest.name,
          category: rest.category as any,
          type: 'dining',
          latitude: rest.latitude,
          longitude: rest.longitude,
          address: rest.address,
          phone: rest.phone,
          website: rest.website,
          googleMapsUrl: rest.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rest.name)}&query_place_id=${rest.latitude},${rest.longitude}`,
          isOpenNow: true,
          openingHours: rest.openingHours,
          images: rest.images && rest.images.length > 0 ? rest.images : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'],
          rating: rest.rating || 4.7,
          userRatingsTotal: rest.userRatingsTotal || 64,
          priceLevel: rest.priceRange === 'budget' ? 1 : rest.priceRange === 'moderate' ? 2 : 3,
          priceRange: rest.priceRange,
          averageMealCostInr: rest.averageMealCostInr,
          cuisine: rest.cuisine,
          vegetarian: rest.vegetarian,
          nonVegetarian: rest.nonVegetarian,
          dietInfo: rest.dietInfo as FoodClassification,
          menu: rest.menu,
          source: 'EcoStay Database',
          verificationStatus: 'VERIFIED',
          lastUpdated: new Date().toISOString(),
          distance: {
            meters: dist.distanceMeters,
            km: dist.distanceKm,
            formatted: dist.formatted,
            drivingMinutes: travel.drivingMinutes,
            formattedTravelTime: travel.formattedDriving
          }
        });
      }
    }

    return results;
  }
}
