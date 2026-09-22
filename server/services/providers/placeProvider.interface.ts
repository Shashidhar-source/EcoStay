import { MenuItem } from '../../utils/osmParser';

export type DataFreshnessStatus = 'LIVE' | 'RECENT' | 'CACHED' | 'VERIFIED' | 'ESTIMATED' | 'UNKNOWN';

export type FoodClassification = 'pure_vegetarian' | 'vegetarian_friendly' | 'non_vegetarian' | 'mixed' | 'unknown';

export type BudgetTier = 'budget' | 'moderate' | 'expensive' | 'luxury' | 'unknown';

export type PlaceCategory = 
  | 'hotel' 
  | 'eco_lodge' 
  | 'glamping' 
  | 'boutique_hotel' 
  | 'treehouse' 
  | 'cabin' 
  | 'villa' 
  | 'hostel' 
  | 'guest_house'
  | 'restaurant' 
  | 'cafe' 
  | 'dhaba' 
  | 'fast_food' 
  | 'food_court' 
  | 'bakery';

export interface NormalizedPlace {
  id: string;
  name: string;
  category: PlaceCategory;
  type: 'stay' | 'dining';
  latitude: number;
  longitude: number;
  address: string;
  phone?: string | null;
  website?: string | null;
  googleMapsUrl: string;
  isOpenNow?: boolean | null;
  openingHours?: string | null;
  images: string[];
  rating: number;
  userRatingsTotal: number;
  priceLevel?: number | null; // 0=Free, 1=Inexpensive, 2=Moderate, 3=Expensive, 4=Very Expensive
  priceRange: BudgetTier;
  estimatedPriceInr?: number;
  averageMealCostInr?: number | null;
  
  // Food & Dining specifics
  cuisine?: string[];
  vegetarian?: boolean | null;
  nonVegetarian?: boolean | null;
  dietInfo?: FoodClassification;
  menu?: MenuItem[];

  // Stay & Eco specifics
  sustainabilityRating?: 'verified' | 'eco_friendly' | 'unknown';
  sustainabilityEcoScore?: number;
  sustainabilityDetails?: {
    solar?: boolean;
    organic?: boolean;
    greenMaterial?: boolean;
    recycling?: boolean;
    waterConservation?: boolean;
  };
  amenities?: string[];
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;

  // Provenance & Freshness
  source: 'Google Places' | 'Foursquare' | 'OpenStreetMap' | 'EcoStay Database' | 'Hybrid' | 'Community Database';
  verificationStatus: DataFreshnessStatus;
  lastUpdated: string; // ISO 8601 timestamp

  // Distance information relative to query coordinates
  distance?: {
    meters: number;
    km: number;
    formatted: string;
    drivingMinutes?: number;
    formattedTravelTime?: string;
  };
}

export interface PlaceSearchParams {
  lat: number;
  lng: number;
  radiusMeters?: number;
  query?: string;
  minRating?: number;
  budgetMax?: number;
  budgetMin?: number;
  cuisine?: string;
  foodType?: FoodClassification | 'all';
  vegetarian?: 'true' | 'pure_veg' | 'false' | 'any';
  nonVegetarian?: 'true' | 'false' | 'any';
  openNow?: boolean;
}

export interface ProviderTelemetry {
  providerName: string;
  status: 'ACTIVE' | 'STANDBY' | 'DEGRADED' | 'DISABLED';
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  cacheHits: number;
  cacheMisses: number;
  avgLatencyMs: number;
  lastActive: string | null;
  lastError: string | null;
}

export interface PlaceProvider {
  readonly name: string;
  isAvailable(): boolean;
  searchHotels(params: PlaceSearchParams): Promise<NormalizedPlace[]>;
  searchRestaurants(params: PlaceSearchParams): Promise<NormalizedPlace[]>;
  getPlaceDetails?(id: string): Promise<NormalizedPlace | null>;
}
