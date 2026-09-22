import { SEED_RESTAURANTS } from '../data/seedRestaurants';
import { overpassService } from './overpassService';
import { calculateHaversineDistance, estimateTravelTime } from '../utils/geoUtils';
import { MenuItem, StandardRestaurant } from '../utils/osmParser';
import { mediaEnrichmentService } from './mediaEnrichmentService';
import { googlePlacesService } from './googlePlacesService';

export interface RestaurantFilterOptions {
  lat: number;
  lng: number;
  radiusMeters?: number;
  cuisine?: string;
  vegetarian?: 'true' | 'pure_veg' | 'false' | 'any';
  nonVegetarian?: 'true' | 'false' | 'any';
  budgetLevel?: 'budget' | 'moderate' | 'expensive';
  openNow?: boolean;
}

class RestaurantService {
  private localRestaurants: StandardRestaurant[] = [...SEED_RESTAURANTS];

  async getAll(): Promise<StandardRestaurant[]> {
    return this.localRestaurants;
  }

  async getById(id: string): Promise<StandardRestaurant | null> {
    const local = this.localRestaurants.find(r => r.id === id);
    if (local) return local;

    if (id.startsWith('osm_')) {
      const parts = id.split('_');
      const type = parts[1];
      const osmId = parts[2];
      if (type && osmId) {
        try {
          const query = `[out:json]; ${type}(${osmId}); out center tags;`;
          const elements = await overpassService.executeQuery(query);
          if (elements.length > 0) {
            const parsed = this.localRestaurants.find(r => r.id === id);
            return parsed || null;
          }
        } catch (e) {
          console.warn('Failed to retrieve specific OSM restaurant by ID', e);
        }
      }
    }

    return null;
  }

  async getMenu(id: string): Promise<MenuItem[]> {
    const restaurant = await this.getById(id);
    return restaurant?.menu || [];
  }

  async addMenuItem(restaurantId: string, item: Omit<MenuItem, 'id'>): Promise<MenuItem | null> {
    const rest = this.localRestaurants.find(r => r.id === restaurantId);
    if (rest) {
      const newItem: MenuItem = {
        ...item,
        id: `menu_${Date.now()}`
      };
      rest.menu.push(newItem);
      return newItem;
    }
    return null;
  }

  // Find nearby restaurants with live OSM, Google Places, and verified menu DB fallback
  async getNearby(filters: RestaurantFilterOptions): Promise<StandardRestaurant[]> {
    const {
      lat,
      lng,
      radiusMeters = 5000,
      cuisine,
      vegetarian,
      nonVegetarian,
      budgetLevel
    } = filters;

    const results: StandardRestaurant[] = [];

    // 1. Scan verified local database first
    for (const rest of this.localRestaurants) {
      const dist = calculateHaversineDistance(lat, lng, rest.latitude, rest.longitude);
      if (dist.distanceMeters <= radiusMeters) {
        const travel = estimateTravelTime(dist.distanceMeters);
        const item: StandardRestaurant = {
          ...rest,
          distance: {
            meters: dist.distanceMeters,
            km: dist.distanceKm,
            formatted: dist.formatted,
            drivingMinutes: travel.drivingMinutes,
            formattedTravelTime: travel.formattedDriving
          }
        };
        results.push(item);
      }
    }

    // 2. Fetch live OpenStreetMap restaurants via Overpass
    try {
      const osmRestaurants = await overpassService.fetchNearbyRestaurants(lat, lng, radiusMeters);
      for (const osmRest of osmRestaurants) {
        const isDuplicate = results.some(
          r => r.name.toLowerCase() === osmRest.name.toLowerCase()
        );
        if (!isDuplicate) {
          // Check if local database has attached menu items for this place
          const matchWithMenu = this.localRestaurants.find(
            lr => lr.name.toLowerCase() === osmRest.name.toLowerCase()
          );
          if (matchWithMenu) {
            osmRest.menu = matchWithMenu.menu;
            osmRest.averageMealCostInr = matchWithMenu.averageMealCostInr;
            osmRest.source = 'Verified Partner';
            osmRest.images = matchWithMenu.images;
          } else {
            // Google Places real-time enrichment if configured
            if (googlePlacesService.isConfigured()) {
              const gPlace = await googlePlacesService.searchPlace(osmRest.name, osmRest.latitude, osmRest.longitude);
              if (gPlace) {
                if (gPlace.photos && gPlace.photos.length > 0) osmRest.images = gPlace.photos;
                if (gPlace.rating) osmRest.rating = gPlace.rating;
                if (gPlace.userRatingsTotal) osmRest.userRatingsTotal = gPlace.userRatingsTotal;
                if (gPlace.googleMapsUrl) osmRest.googleMapsUrl = gPlace.googleMapsUrl;
                osmRest.source = 'Google Places';
              }
            } else {
              // Free Wikimedia Commons / photography enrichment
              const photos = await mediaEnrichmentService.resolveRestaurantImages(
                osmRest.name,
                osmRest.category
              );
              if (photos.length > 0) osmRest.images = photos;
            }
          }

          results.push(osmRest);
        }
      }
    } catch (err) {
      console.warn('Overpass OSM restaurant search error; serving verified local database results.');
    }

    // 3. Apply Filters
    let filtered = results;

    if (cuisine && cuisine !== 'all') {
      const reqCuisine = cuisine.toLowerCase().trim();
      filtered = filtered.filter(r =>
        r.cuisine.some(c => c.toLowerCase().includes(reqCuisine)) ||
        r.name.toLowerCase().includes(reqCuisine)
      );
    }

    if (vegetarian === 'pure_veg') {
      filtered = filtered.filter(r => r.dietInfo === 'pure_vegetarian');
    } else if (vegetarian === 'true') {
      filtered = filtered.filter(
        r => r.vegetarian === true || r.dietInfo === 'pure_vegetarian' || r.dietInfo === 'vegetarian_friendly'
      );
    } else if (vegetarian === 'false') {
      filtered = filtered.filter(r => r.dietInfo === 'non_vegetarian' || r.nonVegetarian === true);
    }

    if (nonVegetarian === 'true') {
      filtered = filtered.filter(r => r.nonVegetarian === true || r.dietInfo === 'non_vegetarian' || r.dietInfo === 'vegetarian_friendly');
    }

    if (budgetLevel) {
      filtered = filtered.filter(r => r.priceRange === budgetLevel);
    }

    // Sort closest first
    filtered.sort((a, b) => (a.distance?.meters || 0) - (b.distance?.meters || 0));
    return filtered;
  }
}

export const restaurantService = new RestaurantService();
