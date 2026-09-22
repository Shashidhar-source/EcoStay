// User Roles and Identity
export type UserRole = 'guest' | 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  created_at: string;
}

// Sustainability Breakdown (0 - 100 per category)
export interface SustainabilityMetrics {
  id?: string;
  accommodation_id?: string;
  solar: number;             // Renewable energy (solar, wind, geothermal) - 25% weight
  water_conservation: number;// Low flow, greywater, rainwater - 20% weight
  waste_management: number;  // Composting, recycling, zero plastic - 20% weight
  energy_efficiency: number; // LED, smart thermostats, heat pumps - 15% weight
  local_support: number;     // Local organic sourcing, local staff - 10% weight
  green_construction: number;// Timber, recycled materials, LEED/BREEAM - 10% weight
  certificationStatus?: 'verified' | 'self_reported' | 'pending';
  certificationIssuer?: string;
  highlights?: string[];
}

export interface Amenity {
  id: string;
  name: string;
  icon?: string;
  category: 'sustainability' | 'comfort' | 'nature' | 'wellness';
}

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  accommodation_id: string;
  rating: number; // 1-5
  comment: string;
  status: 'approved' | 'pending' | 'flagged';
  sustainability_comment?: string;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  accommodation_id: string;
  accommodation_name?: string;
  accommodation_image?: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  contact_note?: string;
  created_at: string;
}

export interface Accommodation {
  id: string;
  name: string;
  tagline: string;
  location: string;
  country: string;
  property_type: 'eco_lodge' | 'glamping' | 'boutique_hotel' | 'treehouse' | 'cabin' | 'villa';
  description: string;
  price_per_night: number;
  rating: number;
  review_count: number;
  status: 'active' | 'draft' | 'archived';
  images: string[];
  amenities: string[]; // Amenity IDs or names
  sustainability: SustainabilityMetrics;
  calculatedEcoScore: number; // Calculated overall 0-100 score
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  featured?: boolean;
}

// User Sustainability Search Preferences
export interface UserPreferences {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  maxBudget?: number;
  propertyType?: string;
  priorities: {
    solar: boolean;
    water: boolean;
    waste: boolean;
    energy: boolean;
    community: boolean;
    construction: boolean;
  };
}

// Recommendation Result with Explainability
export interface RecommendationResult {
  accommodation: Accommodation;
  matchScore: number; // 0-100 overall composite match
  sustainabilityScore: number;
  matchReasons: string[];
  preferenceMatchScore: number;
  locationMatchScore: number;
  budgetMatchScore: number;
  ratingScore: number;
}

export interface AdminDashboardMetrics {
  totalAccommodations: number;
  verifiedAccommodations: number;
  averageEcoScore: number;
  totalBookings: number;
  totalUsers: number;
  pendingReviewsCount: number;
  carbonOffsetKg: number;
}

// Data Freshness and Multi-Provider Types
export type DataFreshnessStatus = 'LIVE' | 'RECENT' | 'CACHED' | 'VERIFIED' | 'ESTIMATED' | 'UNKNOWN';

export type FoodClassification = 'pure_vegetarian' | 'vegetarian_friendly' | 'non_vegetarian' | 'mixed' | 'unknown';

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  priceInr: number;
  category: 'starters' | 'mains' | 'beverages' | 'desserts' | 'thali' | 'breakfast';
  isVegetarian: boolean;
  isVegan?: boolean;
}

export interface NormalizedPlace {
  id: string;
  name: string;
  category: string;
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
  priceLevel?: number | null;
  priceRange: 'budget' | 'moderate' | 'expensive' | 'luxury' | 'unknown';
  estimatedPriceInr?: number;
  averageMealCostInr?: number | null;
  cuisine?: string[];
  vegetarian?: boolean | null;
  nonVegetarian?: boolean | null;
  dietInfo?: FoodClassification;
  menu?: MenuItem[];
  sustainabilityRating?: 'verified' | 'eco_friendly' | 'unknown';
  sustainabilityEcoScore?: number;
  amenities?: string[];
  source: 'Google Places' | 'Foursquare' | 'OpenStreetMap' | 'EcoStay Database' | 'Hybrid' | 'Community Database';
  verificationStatus: DataFreshnessStatus;
  lastUpdated: string;
  distance?: {
    meters: number;
    km: number;
    formatted: string;
    drivingMinutes?: number;
    formattedTravelTime?: string;
  };
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
