import { AccommodationEntity, SEED_ACCOMMODATIONS } from '../data/seedAccommodations';
import { overpassService } from './overpassService';
import { calculateHaversineDistance, estimateTravelTime } from '../utils/geoUtils';
import { StandardHotel } from '../utils/osmParser';
import { mediaEnrichmentService } from './mediaEnrichmentService';
import { googlePlacesService } from './googlePlacesService';

class AccommodationService {
  private accommodations: AccommodationEntity[] = [...SEED_ACCOMMODATIONS];

  async getAll(): Promise<AccommodationEntity[]> {
    return this.accommodations;
  }

  async getById(id: string): Promise<AccommodationEntity | null> {
    const found = this.accommodations.find(a => a.id === id);
    return found || null;
  }

  async save(accommodation: AccommodationEntity): Promise<AccommodationEntity> {
    const idx = this.accommodations.findIndex(a => a.id === accommodation.id);
    if (idx >= 0) {
      this.accommodations[idx] = accommodation;
    } else {
      this.accommodations.unshift(accommodation);
    }
    return accommodation;
  }

  async delete(id: string): Promise<boolean> {
    const initialLen = this.accommodations.length;
    this.accommodations = this.accommodations.filter(a => a.id !== id);
    return this.accommodations.length < initialLen;
  }

  async resetDefaults(): Promise<void> {
    this.accommodations = [...SEED_ACCOMMODATIONS];
  }

  // Get nearby accommodations combining verified EcoStay listings and live OpenStreetMap/Google Places hotels
  async getNearby(
    lat: number,
    lng: number,
    radiusMeters: number = 10000,
    minEcoScore?: number,
    budgetMax?: number
  ): Promise<StandardHotel[]> {
    const results: StandardHotel[] = [];

    // 1. Check local verified database first
    for (const acc of this.accommodations) {
      const dist = calculateHaversineDistance(lat, lng, acc.latitude, acc.longitude);
      if (dist.distanceMeters <= radiusMeters) {
        const travel = estimateTravelTime(dist.distanceMeters);
        
        if (budgetMax && acc.price_per_night > budgetMax) continue;
        if (minEcoScore && acc.calculatedEcoScore < minEcoScore) continue;

        let priceRange: StandardHotel['priceRange'] = 'moderate';
        if (acc.price_per_night <= 4000) priceRange = 'budget';
        else if (acc.price_per_night >= 10000) priceRange = 'expensive';

        results.push({
          id: acc.id,
          name: acc.name,
          type: acc.property_type,
          propertyTypeCategory: acc.property_type,
          latitude: acc.latitude,
          longitude: acc.longitude,
          address: `${acc.location}, ${acc.country}`,
          distance: {
            meters: dist.distanceMeters,
            km: dist.distanceKm,
            formatted: dist.formatted,
            drivingMinutes: travel.drivingMinutes,
            formattedTravelTime: travel.formattedDriving
          },
          phone: '+91 800 326 7829',
          website: 'https://ecostay.in',
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(acc.name)}`,
          openingHours: '24/7 Front Desk',
          images: acc.images,
          sustainability: 'verified',
          sustainabilityDetails: {
            solar: acc.sustainability.solar >= 75,
            organic: acc.sustainability.local_support >= 75,
            greenMaterial: acc.sustainability.green_construction >= 75,
            recycling: acc.sustainability.waste_management >= 75
          },
          priceRange,
          estimatedPriceInr: acc.price_per_night,
          stars: 5,
          rating: acc.rating,
          userRatingsTotal: acc.review_count,
          amenities: acc.amenities,
          source: 'EcoStay Database'
        });
      }
    }

    // 2. Fetch live OpenStreetMap hotels via Overpass API
    try {
      const osmHotels = await overpassService.fetchNearbyHotels(lat, lng, radiusMeters);
      for (const osmHotel of osmHotels) {
        const isDuplicate = results.some(
          r => r.name.toLowerCase() === osmHotel.name.toLowerCase()
        );
        if (!isDuplicate) {
          // Enrich with real-time Google Places photos/ratings if Google API Key is provided
          if (googlePlacesService.isConfigured()) {
            const gPlace = await googlePlacesService.searchPlace(osmHotel.name, osmHotel.latitude, osmHotel.longitude);
            if (gPlace) {
              if (gPlace.photos && gPlace.photos.length > 0) osmHotel.images = gPlace.photos;
              if (gPlace.rating) osmHotel.rating = gPlace.rating;
              if (gPlace.userRatingsTotal) osmHotel.userRatingsTotal = gPlace.userRatingsTotal;
              if (gPlace.googleMapsUrl) osmHotel.googleMapsUrl = gPlace.googleMapsUrl;
              osmHotel.source = 'Google Places';
            }
          } else {
            // Free enrichment via Wikimedia Commons / high-res curated photos
            const photos = await mediaEnrichmentService.resolveAccommodationImages(
              osmHotel.name,
              osmHotel.propertyTypeCategory
            );
            if (photos.length > 0) osmHotel.images = photos;
          }

          results.push(osmHotel);
        }
      }
    } catch (err) {
      console.warn('Overpass OSM query encountered an issue. Returning verified local database results.');
    }

    // Sort by distance
    results.sort((a, b) => (a.distance?.meters || 0) - (b.distance?.meters || 0));
    return results;
  }
}

export const accommodationService = new AccommodationService();
