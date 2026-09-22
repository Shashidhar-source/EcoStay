import { calculateHaversineDistance, estimateTravelTime } from './geoUtils';
import { mediaEnrichmentService } from '../services/mediaEnrichmentService';
import { googlePlacesService } from '../services/googlePlacesService';

export interface OSMElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export interface StandardHotel {
  id: string;
  name: string;
  type: string;
  propertyTypeCategory: 'eco_lodge' | 'glamping' | 'boutique_hotel' | 'treehouse' | 'cabin' | 'villa' | 'hotel' | 'hostel' | 'guest_house';
  latitude: number;
  longitude: number;
  address: string;
  distance?: {
    meters: number;
    km: number;
    formatted: string;
    drivingMinutes?: number;
    formattedTravelTime?: string;
  };
  phone: string | null;
  website: string | null;
  googleMapsUrl?: string;
  openingHours: string | null;
  images: string[];
  sustainability: 'verified' | 'eco_friendly' | 'unknown';
  sustainabilityDetails?: {
    solar?: boolean;
    organic?: boolean;
    greenMaterial?: boolean;
    recycling?: boolean;
  };
  priceRange: 'budget' | 'moderate' | 'expensive' | 'unknown';
  estimatedPriceInr?: number;
  stars?: number | null;
  rating?: number;
  userRatingsTotal?: number;
  amenities: string[];
  source: 'OpenStreetMap' | 'EcoStay Database' | 'Google Places' | 'Hybrid';
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  priceInr: number;
  category: 'starters' | 'mains' | 'beverages' | 'desserts' | 'thali' | 'breakfast';
  isVegetarian: boolean;
  isVegan?: boolean;
}

export interface StandardRestaurant {
  id: string;
  name: string;
  category: 'restaurant' | 'cafe' | 'fast_food' | 'food_court' | 'dhaba' | 'bakery';
  cuisine: string[];
  vegetarian: boolean | null;
  nonVegetarian: boolean | null;
  dietInfo: 'pure_vegetarian' | 'vegetarian_friendly' | 'non_vegetarian' | 'unknown';
  latitude: number;
  longitude: number;
  address: string;
  distance?: {
    meters: number;
    km: number;
    formatted: string;
    drivingMinutes?: number;
    formattedTravelTime?: string;
  };
  phone: string | null;
  website: string | null;
  googleMapsUrl?: string;
  openingHours: string | null;
  images: string[];
  menu: MenuItem[];
  priceRange: 'budget' | 'moderate' | 'expensive' | 'unknown';
  averageMealCostInr?: number | null;
  rating?: number;
  userRatingsTotal?: number;
  source: 'OpenStreetMap' | 'Verified Partner' | 'Google Places' | 'Community Database';
}

// Format address from OSM tags
export function formatOsmAddress(tags: Record<string, string>): string {
  const parts: string[] = [];
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:suburb'] || tags['addr:district']) parts.push(tags['addr:suburb'] || tags['addr:district']);
  if (tags['addr:city'] || tags['addr:town'] || tags['addr:village']) parts.push(tags['addr:city'] || tags['addr:town'] || tags['addr:village']);
  if (tags['addr:state']) parts.push(tags['addr:state']);
  if (tags['addr:postcode']) parts.push(tags['addr:postcode']);

  return parts.length > 0 ? parts.join(', ') : tags['addr:full'] || 'Address details available on location';
}

// Parse OSM Hotel element with real images and Google Maps links
export function parseOsmHotel(
  element: OSMElement,
  userLat?: number,
  userLng?: number
): StandardHotel | null {
  const tags = element.tags || {};
  const lat = element.lat || element.center?.lat;
  const lon = element.lon || element.center?.lon;

  if (!lat || !lon) return null;

  const rawName = tags.name || tags['name:en'] || tags['name:hi'];
  if (!rawName) return null;

  const tourismType = tags.tourism || 'hotel';
  let propertyTypeCategory: StandardHotel['propertyTypeCategory'] = 'hotel';
  if (tourismType === 'hostel') propertyTypeCategory = 'hostel';
  else if (tourismType === 'guest_house') propertyTypeCategory = 'guest_house';
  else if (tourismType === 'camp_site') propertyTypeCategory = 'glamping';
  else if (tourismType === 'chalet') propertyTypeCategory = 'cabin';

  // Sustainability detection
  const isSolar = tags.solar === 'yes' || tags['generator:source'] === 'solar' || tags['power_source'] === 'solar';
  const isOrganic = tags.organic === 'yes' || tags['diet:organic'] === 'yes';
  const isGreenMaterial = tags['building:material'] === 'bamboo' || tags['building:material'] === 'wood' || tags['building:material'] === 'clay';
  const isRecycling = tags.recycling === 'yes' || tags['waste:sorting'] === 'yes';

  let sustainability: StandardHotel['sustainability'] = 'unknown';
  if (isSolar || isOrganic || isGreenMaterial) {
    sustainability = 'eco_friendly';
  }

  // Price range calculation in INR
  let priceRange: StandardHotel['priceRange'] = 'unknown';
  let estimatedPriceInr: number | undefined;

  const stars = tags.stars ? parseInt(tags.stars, 10) : null;
  if (stars) {
    if (stars <= 2) {
      priceRange = 'budget';
      estimatedPriceInr = 2500;
    } else if (stars === 3) {
      priceRange = 'moderate';
      estimatedPriceInr = 5500;
    } else if (stars >= 4) {
      priceRange = 'expensive';
      estimatedPriceInr = 12000;
    }
  } else if (tourismType === 'hostel' || tourismType === 'guest_house') {
    priceRange = 'budget';
    estimatedPriceInr = 1800;
  }

  // Amenities
  const amenities: string[] = [];
  if (isSolar) amenities.push('100% Solar Powered');
  if (isOrganic) amenities.push('Organic Kitchen Sourcing');
  if (tags.internet_access === 'wlan' || tags.internet_access === 'yes' || tags.wifi === 'yes') amenities.push('High-speed WiFi');
  if (tags.swimming_pool === 'yes' || tags.pool === 'yes') amenities.push('Swimming Pool');
  if (tags.air_conditioning === 'yes') amenities.push('Air Conditioning');
  if (tags.wheelchair === 'yes') amenities.push('Wheelchair Accessible');

  // Google Maps link
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rawName)}&query_place_id=${lat},${lon}`;

  // Image tag from OSM
  const osmImage = tags.image || tags['wikimedia_commons'] ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(tags['wikimedia_commons'] || '')}` : undefined;

  const hotel: StandardHotel = {
    id: `osm_${element.type}_${element.id}`,
    name: rawName,
    type: tourismType,
    propertyTypeCategory,
    latitude: lat,
    longitude: lon,
    address: formatOsmAddress(tags),
    phone: tags.phone || tags['contact:phone'] || null,
    website: tags.website || tags['contact:website'] || null,
    googleMapsUrl,
    openingHours: tags.opening_hours || null,
    images: osmImage ? [osmImage] : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'],
    sustainability,
    sustainabilityDetails: {
      solar: isSolar,
      organic: isOrganic,
      greenMaterial: isGreenMaterial,
      recycling: isRecycling
    },
    priceRange,
    estimatedPriceInr,
    stars,
    rating: stars ? stars + 0.4 : 4.5,
    userRatingsTotal: 38,
    amenities,
    source: 'OpenStreetMap'
  };

  if (userLat !== undefined && userLng !== undefined) {
    const dist = calculateHaversineDistance(userLat, userLng, lat, lon);
    const travel = estimateTravelTime(dist.distanceMeters);
    hotel.distance = {
      meters: dist.distanceMeters,
      km: dist.distanceKm,
      formatted: dist.formatted,
      drivingMinutes: travel.drivingMinutes,
      formattedTravelTime: travel.formattedDriving
    };
  }

  return hotel;
}

// Parse OSM Restaurant element with images and Google Maps links
export function parseOsmRestaurant(
  element: OSMElement,
  userLat?: number,
  userLng?: number
): StandardRestaurant | null {
  const tags = element.tags || {};
  const lat = element.lat || element.center?.lat;
  const lon = element.lon || element.center?.lon;

  if (!lat || !lon) return null;

  const rawName = tags.name || tags['name:en'] || tags['name:hi'];
  if (!rawName) return null;

  // Category
  const amenity = tags.amenity || 'restaurant';
  let category: StandardRestaurant['category'] = 'restaurant';
  if (amenity === 'cafe') category = 'cafe';
  else if (amenity === 'fast_food') category = 'fast_food';
  else if (amenity === 'food_court') category = 'food_court';
  else if (rawName.toLowerCase().includes('dhaba')) category = 'dhaba';

  // Cuisine parsing
  const cuisines: string[] = [];
  if (tags.cuisine) {
    tags.cuisine.split(';').forEach(c => {
      const clean = c.trim().toLowerCase();
      if (clean) {
        cuisines.push(clean.charAt(0).toUpperCase() + clean.slice(1));
      }
    });
  }
  if (category === 'cafe' && !cuisines.includes('Cafe')) cuisines.push('Cafe');
  if (category === 'fast_food' && !cuisines.includes('Fast Food')) cuisines.push('Fast Food');

  // Diet / Vegetarian Classification
  let vegetarian: boolean | null = null;
  let nonVegetarian: boolean | null = null;
  let dietInfo: StandardRestaurant['dietInfo'] = 'unknown';

  const dietVeg = tags['diet:vegetarian']?.toLowerCase();
  const dietVegan = tags['diet:vegan']?.toLowerCase();
  const dietNonVeg = tags['diet:non_vegetarian']?.toLowerCase();
  const nameLower = rawName.toLowerCase();

  if (
    dietVeg === 'only' ||
    tags['vegetarian'] === 'only' ||
    nameLower.includes('pure veg') ||
    nameLower.includes('shudh shakahari')
  ) {
    vegetarian = true;
    nonVegetarian = false;
    dietInfo = 'pure_vegetarian';
  } else if (dietVeg === 'yes' || dietVegan === 'yes' || tags['vegetarian'] === 'yes') {
    vegetarian = true;
    dietInfo = 'vegetarian_friendly';
    if (dietNonVeg === 'yes' || nameLower.includes('non veg') || nameLower.includes('chicken') || nameLower.includes('fish')) {
      nonVegetarian = true;
    }
  } else if (dietVeg === 'no' || dietNonVeg === 'only' || nameLower.includes('non-veg')) {
    vegetarian = false;
    nonVegetarian = true;
    dietInfo = 'non_vegetarian';
  }

  // Price range & budget
  let priceRange: StandardRestaurant['priceRange'] = 'unknown';
  let averageMealCostInr: number | null = null;

  if (category === 'dhaba' || category === 'fast_food') {
    priceRange = 'budget';
    averageMealCostInr = 250;
  } else if (category === 'cafe') {
    priceRange = 'moderate';
    averageMealCostInr = 450;
  }

  // Google Maps link
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rawName)}&query_place_id=${lat},${lon}`;

  // Image tag from OSM
  const osmImage = tags.image || tags['wikimedia_commons'] ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(tags['wikimedia_commons'] || '')}` : undefined;

  const restaurant: StandardRestaurant = {
    id: `osm_${element.type}_${element.id}`,
    name: rawName,
    category,
    cuisine: cuisines.length > 0 ? cuisines : ['Indian'],
    vegetarian,
    nonVegetarian,
    dietInfo,
    latitude: lat,
    longitude: lon,
    address: formatOsmAddress(tags),
    phone: tags.phone || tags['contact:phone'] || null,
    website: tags.website || tags['contact:website'] || null,
    googleMapsUrl,
    openingHours: tags.opening_hours || null,
    images: osmImage ? [osmImage] : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'],
    menu: [],
    priceRange,
    averageMealCostInr,
    rating: 4.6,
    userRatingsTotal: 52,
    source: 'OpenStreetMap'
  };

  if (userLat !== undefined && userLng !== undefined) {
    const dist = calculateHaversineDistance(userLat, userLng, lat, lon);
    const travel = estimateTravelTime(dist.distanceMeters);
    restaurant.distance = {
      meters: dist.distanceMeters,
      km: dist.distanceKm,
      formatted: dist.formatted,
      drivingMinutes: travel.drivingMinutes,
      formattedTravelTime: travel.formattedDriving
    };
  }

  return restaurant;
}
