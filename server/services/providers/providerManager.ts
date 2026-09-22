import { 
  PlaceProvider, 
  PlaceSearchParams, 
  NormalizedPlace, 
  ProviderTelemetry, 
  FoodClassification 
} from './placeProvider.interface';
import { GooglePlacesProvider } from './googlePlacesProvider';
import { FoursquareProvider } from './foursquareProvider';
import { OsmProvider } from './osmProvider';
import { LocalDbProvider } from './localDbProvider';
import { MenuItem } from '../../utils/osmParser';
import { calculateHaversineDistance } from '../../utils/geoUtils';

class ProviderManager {
  private googleProvider = new GooglePlacesProvider();
  private foursquareProvider = new FoursquareProvider();
  private osmProvider = new OsmProvider();
  private localDbProvider = new LocalDbProvider();

  private telemetry: Map<string, ProviderTelemetry> = new Map([
    ['Google Places', {
      providerName: 'Google Places (New) API',
      status: this.googleProvider.isAvailable() ? 'ACTIVE' : 'DISABLED',
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgLatencyMs: 0,
      lastActive: null,
      lastError: this.googleProvider.isAvailable() ? null : 'API key not provided in environment'
    }],
    ['Foursquare', {
      providerName: 'Foursquare Places API v3',
      status: this.foursquareProvider.isAvailable() ? 'ACTIVE' : 'DISABLED',
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgLatencyMs: 0,
      lastActive: null,
      lastError: this.foursquareProvider.isAvailable() ? null : 'API key not provided in environment'
    }],
    ['OpenStreetMap', {
      providerName: 'OpenStreetMap Overpass API',
      status: 'ACTIVE',
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgLatencyMs: 0,
      lastActive: null,
      lastError: null
    }],
    ['EcoStay Database', {
      providerName: 'EcoStay Verified Knowledge Base',
      status: 'ACTIVE',
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgLatencyMs: 0,
      lastActive: null,
      lastError: null
    }]
  ]);

  private recordTelemetry(providerKey: string, latencyMs: number, success: boolean, errorMsg?: string) {
    const stat = this.telemetry.get(providerKey);
    if (!stat) return;

    stat.totalRequests += 1;
    if (success) {
      stat.successfulRequests += 1;
      stat.lastActive = new Date().toISOString();
    } else {
      stat.failedRequests += 1;
      stat.lastError = errorMsg || 'Unknown provider error';
      if (stat.failedRequests > 5 && stat.status === 'ACTIVE') {
        stat.status = 'DEGRADED';
      }
    }

    stat.avgLatencyMs = Math.round((stat.avgLatencyMs * (stat.totalRequests - 1) + latencyMs) / stat.totalRequests);
  }

  // Get current provider statuses and telemetry for Admin Dashboard
  getProviderStatus(): ProviderTelemetry[] {
    // Refresh availability in case .env was dynamically updated
    const gStat = this.telemetry.get('Google Places');
    if (gStat && !this.googleProvider.isAvailable()) gStat.status = 'DISABLED';
    else if (gStat && this.googleProvider.isAvailable() && gStat.status === 'DISABLED') gStat.status = 'ACTIVE';

    const fStat = this.telemetry.get('Foursquare');
    if (fStat && !this.foursquareProvider.isAvailable()) fStat.status = 'DISABLED';
    else if (fStat && this.foursquareProvider.isAvailable() && fStat.status === 'DISABLED') fStat.status = 'ACTIVE';

    return Array.from(this.telemetry.values());
  }

  // Search Stays across all providers in priority sequence with failover and deduplication
  async searchHotels(params: PlaceSearchParams): Promise<NormalizedPlace[]> {
    const rawResults: NormalizedPlace[] = [];

    // 1. Local Verified DB (Highest priority for certified eco data)
    const t0 = Date.now();
    try {
      const localHotels = await this.localDbProvider.searchHotels(params);
      this.recordTelemetry('EcoStay Database', Date.now() - t0, true);
      rawResults.push(...localHotels);
    } catch (e: any) {
      this.recordTelemetry('EcoStay Database', Date.now() - t0, false, e.message);
    }

    // 2. Google Places (if configured)
    if (this.googleProvider.isAvailable()) {
      const tg = Date.now();
      try {
        const gHotels = await this.googleProvider.searchHotels(params);
        this.recordTelemetry('Google Places', Date.now() - tg, true);
        rawResults.push(...gHotels);
      } catch (e: any) {
        this.recordTelemetry('Google Places', Date.now() - tg, false, e.message);
      }
    }

    // 3. Foursquare (if configured)
    if (this.foursquareProvider.isAvailable()) {
      const tf = Date.now();
      try {
        const fHotels = await this.foursquareProvider.searchHotels(params);
        this.recordTelemetry('Foursquare', Date.now() - tf, true);
        rawResults.push(...fHotels);
      } catch (e: any) {
        this.recordTelemetry('Foursquare', Date.now() - tf, false, e.message);
      }
    }

    // 4. OpenStreetMap (Primary real-time open geospatial layer)
    const tosm = Date.now();
    try {
      const osmHotels = await this.osmProvider.searchHotels(params);
      this.recordTelemetry('OpenStreetMap', Date.now() - tosm, true);
      rawResults.push(...osmHotels);
    } catch (e: any) {
      this.recordTelemetry('OpenStreetMap', Date.now() - tosm, false, e.message);
    }

    // Deduplicate and merge
    const deduplicated = this.deduplicatePlaces(rawResults);

    // Apply filtering
    return this.applyStayFilters(deduplicated, params);
  }

  // Search Restaurants across all providers in priority sequence
  async searchRestaurants(params: PlaceSearchParams): Promise<NormalizedPlace[]> {
    const rawResults: NormalizedPlace[] = [];

    // 1. Local Verified DB (contains verified menu data)
    const t0 = Date.now();
    try {
      const localRestaurants = await this.localDbProvider.searchRestaurants(params);
      this.recordTelemetry('EcoStay Database', Date.now() - t0, true);
      rawResults.push(...localRestaurants);
    } catch (e: any) {
      this.recordTelemetry('EcoStay Database', Date.now() - t0, false, e.message);
    }

    // 2. Google Places (if configured)
    if (this.googleProvider.isAvailable()) {
      const tg = Date.now();
      try {
        const gRest = await this.googleProvider.searchRestaurants(params);
        this.recordTelemetry('Google Places', Date.now() - tg, true);
        rawResults.push(...gRest);
      } catch (e: any) {
        this.recordTelemetry('Google Places', Date.now() - tg, false, e.message);
      }
    }

    // 3. Foursquare (if configured)
    if (this.foursquareProvider.isAvailable()) {
      const tf = Date.now();
      try {
        const fRest = await this.foursquareProvider.searchRestaurants(params);
        this.recordTelemetry('Foursquare', Date.now() - tf, true);
        rawResults.push(...fRest);
      } catch (e: any) {
        this.recordTelemetry('Foursquare', Date.now() - tf, false, e.message);
      }
    }

    // 4. OpenStreetMap
    const tosm = Date.now();
    try {
      const osmRest = await this.osmProvider.searchRestaurants(params);
      this.recordTelemetry('OpenStreetMap', Date.now() - tosm, true);
      rawResults.push(...osmRest);
    } catch (e: any) {
      this.recordTelemetry('OpenStreetMap', Date.now() - tosm, false, e.message);
    }

    // Deduplicate and merge
    const deduplicated = this.deduplicatePlaces(rawResults);

    // Apply filtering (diet, budget, cuisine, etc.)
    return this.applyRestaurantFilters(deduplicated, params);
  }

  // Search all places
  async searchAll(params: PlaceSearchParams): Promise<{ hotels: NormalizedPlace[]; restaurants: NormalizedPlace[] }> {
    const [hotels, restaurants] = await Promise.all([
      this.searchHotels(params),
      this.searchRestaurants(params)
    ]);
    return { hotels, restaurants };
  }

  // Deduplicate and cross-merge data from multiple sources
  private deduplicatePlaces(places: NormalizedPlace[]): NormalizedPlace[] {
    const unique: NormalizedPlace[] = [];

    for (const place of places) {
      const existing = unique.find(u => {
        const nameMatch = this.isSimilarName(u.name, place.name);
        const dist = calculateHaversineDistance(u.latitude, u.longitude, place.latitude, place.longitude);
        return nameMatch && dist.distanceMeters < 300;
      });

      if (!existing) {
        unique.push({ ...place });
      } else {
        // Cross-merge high-value attributes
        if (!existing.menu || existing.menu.length === 0) {
          if (place.menu && place.menu.length > 0) existing.menu = place.menu;
        }
        if (place.sustainabilityRating === 'verified') {
          existing.sustainabilityRating = 'verified';
          existing.sustainabilityEcoScore = place.sustainabilityEcoScore;
          existing.sustainabilityDetails = place.sustainabilityDetails;
        }
        if (existing.images[0]?.includes('unsplash') && place.images[0] && !place.images[0].includes('unsplash')) {
          existing.images = place.images;
        }
        if (place.source === 'Google Places' || place.source === 'EcoStay Database') {
          existing.rating = place.rating;
          existing.userRatingsTotal = place.userRatingsTotal;
        }
        if (place.dietInfo && place.dietInfo !== 'unknown') {
          existing.dietInfo = place.dietInfo;
          existing.vegetarian = place.vegetarian;
          existing.nonVegetarian = place.nonVegetarian;
        }
      }
    }

    // Sort by proximity
    unique.sort((a, b) => (a.distance?.meters || 0) - (b.distance?.meters || 0));
    return unique;
  }

  private isSimilarName(name1: string, name2: string): boolean {
    const clean1 = name1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const clean2 = name2.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean1 === clean2) return true;
    if (clean1.length > 5 && clean2.length > 5) {
      if (clean1.includes(clean2) || clean2.includes(clean1)) return true;
    }
    return false;
  }

  private applyStayFilters(stays: NormalizedPlace[], params: PlaceSearchParams): NormalizedPlace[] {
    let filtered = [...stays];

    if (params.minRating) {
      filtered = filtered.filter(s => s.rating >= params.minRating!);
    }

    if (params.budgetMax) {
      filtered = filtered.filter(s => !s.estimatedPriceInr || s.estimatedPriceInr <= params.budgetMax!);
    }

    if (params.budgetMin) {
      filtered = filtered.filter(s => !s.estimatedPriceInr || s.estimatedPriceInr >= params.budgetMin!);
    }

    return filtered;
  }

  private applyRestaurantFilters(restaurants: NormalizedPlace[], params: PlaceSearchParams): NormalizedPlace[] {
    let filtered = [...restaurants];

    // Food Classification / Dietary filter
    if (params.foodType && params.foodType !== 'all') {
      if (params.foodType === 'pure_vegetarian') {
        filtered = filtered.filter(r => r.dietInfo === 'pure_vegetarian');
      } else if (params.foodType === 'vegetarian_friendly') {
        filtered = filtered.filter(r => r.dietInfo === 'vegetarian_friendly' || r.dietInfo === 'pure_vegetarian' || r.vegetarian === true);
      } else if (params.foodType === 'non_vegetarian') {
        filtered = filtered.filter(r => r.dietInfo === 'non_vegetarian' || r.nonVegetarian === true);
      }
    } else if (params.vegetarian === 'pure_veg') {
      filtered = filtered.filter(r => r.dietInfo === 'pure_vegetarian');
    } else if (params.vegetarian === 'true') {
      filtered = filtered.filter(r => r.vegetarian === true || r.dietInfo === 'pure_vegetarian' || r.dietInfo === 'vegetarian_friendly');
    } else if (params.vegetarian === 'false') {
      filtered = filtered.filter(r => r.dietInfo === 'non_vegetarian' || r.nonVegetarian === true);
    }

    if (params.cuisine && params.cuisine !== 'all') {
      const q = params.cuisine.toLowerCase();
      filtered = filtered.filter(r => 
        r.cuisine?.some(c => c.toLowerCase().includes(q)) || 
        r.name.toLowerCase().includes(q)
      );
    }

    // Affordable Food Budget Filters (Under 100, 100-200, 200-400, 400+)
    if (params.budgetMax) {
      filtered = filtered.filter(r => !r.averageMealCostInr || r.averageMealCostInr <= params.budgetMax!);
    }
    if (params.budgetMin) {
      filtered = filtered.filter(r => !r.averageMealCostInr || r.averageMealCostInr >= params.budgetMin!);
    }

    if (params.minRating) {
      filtered = filtered.filter(r => r.rating >= params.minRating!);
    }

    return filtered;
  }
}

export const providerManager = new ProviderManager();
