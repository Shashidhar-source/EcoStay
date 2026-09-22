import { 
  Accommodation, 
  AdminDashboardMetrics, 
  Booking, 
  RecommendationResult, 
  Review, 
  User, 
  UserPreferences, 
  UserRole 
} from '../types';
import { INITIAL_ACCOMMODATIONS, INITIAL_REVIEWS, INITIAL_USERS } from './mockData';
import { calculateEcoScore, generateRecommendations } from './recommendationEngine';

const API_BASE = '/api';

const STORAGE_KEYS = {
  ACCOMMODATIONS: 'ecostay_in_accommodations_v2',
  REVIEWS: 'ecostay_in_reviews_v2',
  WISHLIST: 'ecostay_in_wishlist_v2',
  BOOKINGS: 'ecostay_in_bookings_v2',
  CURRENT_USER: 'ecostay_in_current_user_v2',
  USER_PREFERENCES: 'ecostay_in_user_prefs_v2'
};

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
}

// -------------------------------------------------------------
// Accommodation API Service (Calls Backend REST API with Fallback)
// -------------------------------------------------------------
export const accommodationService = {
  getAll: async (): Promise<Accommodation[]> => {
    try {
      const res = await fetch(`${API_BASE}/accommodations`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Backend /api/accommodations unreachable; using local storage.');
    }
    return getFromStorage<Accommodation[]>(STORAGE_KEYS.ACCOMMODATIONS, INITIAL_ACCOMMODATIONS);
  },

  getById: async (id: string): Promise<Accommodation | null> => {
    try {
      const res = await fetch(`${API_BASE}/accommodations/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn(`Backend /api/accommodations/${id} unreachable; using local storage.`);
    }
    const list = getFromStorage<Accommodation[]>(STORAGE_KEYS.ACCOMMODATIONS, INITIAL_ACCOMMODATIONS);
    return list.find(a => a.id === id) || null;
  },

  save: async (accommodation: Accommodation): Promise<Accommodation> => {
    accommodation.calculatedEcoScore = calculateEcoScore(accommodation.sustainability);

    try {
      const res = await fetch(`${API_BASE}/accommodations/admin/accommodations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accommodation)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Backend save accommodation failed; saving locally.');
    }

    const list = getFromStorage<Accommodation[]>(STORAGE_KEYS.ACCOMMODATIONS, INITIAL_ACCOMMODATIONS);
    const index = list.findIndex(a => a.id === accommodation.id);
    if (index >= 0) {
      list[index] = accommodation;
    } else {
      list.unshift(accommodation);
    }
    setToStorage(STORAGE_KEYS.ACCOMMODATIONS, list);
    return accommodation;
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/accommodations/admin/accommodations/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return true;
    } catch (e) {
      console.warn('Backend delete accommodation failed; deleting locally.');
    }

    const list = getFromStorage<Accommodation[]>(STORAGE_KEYS.ACCOMMODATIONS, INITIAL_ACCOMMODATIONS);
    const filtered = list.filter(a => a.id !== id);
    setToStorage(STORAGE_KEYS.ACCOMMODATIONS, filtered);
    return true;
  },

  resetDefaults: async (): Promise<void> => {
    setToStorage(STORAGE_KEYS.ACCOMMODATIONS, INITIAL_ACCOMMODATIONS);
    setToStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  }
};

// -------------------------------------------------------------
// Recommendation API Service
// -------------------------------------------------------------
export const recommendationService = {
  getRecommendations: async (preferences: UserPreferences): Promise<RecommendationResult[]> => {
    try {
      const res = await fetch(`${API_BASE}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Backend /api/recommendations unreachable; generating recommendations locally.');
    }

    const accommodations = await accommodationService.getAll();
    return generateRecommendations(accommodations, preferences);
  }
};

// -------------------------------------------------------------
// OpenStreetMap & Places API Service (Nearby Hotels, Restaurants, Menus, Geocoding, Routing)
// -------------------------------------------------------------
export const placesService = {
  getNearbyPlaces: async (lat: number, lng: number, radius: number = 5000, type: string = 'all') => {
    const res = await fetch(`${API_BASE}/places/nearby?lat=${lat}&lng=${lng}&radius=${radius}&type=${type}`);
    return res.json();
  },

  getNearbyHotels: async (lat: number, lng: number, radius: number = 5000, minEcoScore?: number, budgetMax?: number, budgetMin?: number) => {
    const params = new URLSearchParams({ lat: lat.toString(), lng: lng.toString(), radius: radius.toString() });
    if (minEcoScore) params.set('minEcoScore', minEcoScore.toString());
    if (budgetMax) params.set('budgetMax', budgetMax.toString());
    if (budgetMin) params.set('budgetMin', budgetMin.toString());
    const res = await fetch(`${API_BASE}/hotels/nearby?${params.toString()}`);
    return res.json();
  },

  getNearbyRestaurants: async (
    lat: number,
    lng: number,
    radius: number = 5000,
    cuisine?: string,
    vegetarian?: string,
    foodType?: string,
    budgetMax?: number,
    budgetMin?: number,
    budgetLevel?: string
  ) => {
    const params = new URLSearchParams({ lat: lat.toString(), lng: lng.toString(), radius: radius.toString() });
    if (cuisine) params.set('cuisine', cuisine);
    if (vegetarian) params.set('vegetarian', vegetarian);
    if (foodType) params.set('foodType', foodType);
    if (budgetMax) params.set('budgetMax', budgetMax.toString());
    if (budgetMin) params.set('budgetMin', budgetMin.toString());
    if (budgetLevel) params.set('budgetLevel', budgetLevel);
    const res = await fetch(`${API_BASE}/restaurants/nearby?${params.toString()}`);
    return res.json();
  },

  getRestaurantDetail: async (id: string) => {
    const res = await fetch(`${API_BASE}/restaurants/${id}`);
    return res.json();
  },

  getRestaurantMenu: async (id: string) => {
    const res = await fetch(`${API_BASE}/restaurants/${id}/menu`);
    return res.json();
  },

  geocode: async (query: string) => {
    const res = await fetch(`${API_BASE}/geocode?q=${encodeURIComponent(query)}`);
    return res.json();
  },

  reverseGeocode: async (lat: number, lng: number) => {
    const res = await fetch(`${API_BASE}/geocode/reverse?lat=${lat}&lng=${lng}`);
    return res.json();
  },

  getRoute: async (startLat: number, startLng: number, endLat: number, endLng: number) => {
    const res = await fetch(`${API_BASE}/route?startLat=${startLat}&startLng=${startLng}&endLat=${endLat}&endLng=${endLng}`);
    return res.json();
  }
};

// -------------------------------------------------------------
// Wishlist API Service
// -------------------------------------------------------------
export const wishlistService = {
  getWishlistIds: async (): Promise<string[]> => {
    return getFromStorage<string[]>(STORAGE_KEYS.WISHLIST, ['eco_1', 'eco_3']);
  },

  toggleWishlist: async (accommodationId: string): Promise<string[]> => {
    const list = getFromStorage<string[]>(STORAGE_KEYS.WISHLIST, ['eco_1', 'eco_3']);
    let updated: string[];
    if (list.includes(accommodationId)) {
      updated = list.filter(id => id !== accommodationId);
    } else {
      updated = [...list, accommodationId];
    }
    setToStorage(STORAGE_KEYS.WISHLIST, updated);
    return updated;
  }
};

// -------------------------------------------------------------
// Bookings API Service
// -------------------------------------------------------------
export const bookingService = {
  getAll: async (): Promise<Booking[]> => {
    return getFromStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, [
      {
        id: 'bk_1',
        user_id: 'user_1',
        accommodation_id: 'eco_1',
        accommodation_name: 'Wayanad Canopy Bamboo Bio-Lodge',
        accommodation_image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80',
        check_in: '2025-06-12',
        check_out: '2025-06-16',
        guests: 2,
        total_price: 26350,
        status: 'confirmed',
        contact_note: 'Requesting EV charging access on arrival and traditional Kerala breakfast.',
        created_at: '2025-02-12T10:30:00Z'
      }
    ]);
  },

  create: async (bookingData: Omit<Booking, 'id' | 'created_at'>): Promise<Booking> => {
    const bookings = await bookingService.getAll();
    const newBooking: Booking = {
      ...bookingData,
      id: `bk_${Date.now()}`,
      created_at: new Date().toISOString()
    };
    bookings.unshift(newBooking);
    setToStorage(STORAGE_KEYS.BOOKINGS, bookings);
    return newBooking;
  }
};

// -------------------------------------------------------------
// Reviews API Service
// -------------------------------------------------------------
export const reviewService = {
  getByAccommodation: async (accommodationId: string): Promise<Review[]> => {
    const list = getFromStorage<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    return list.filter(r => r.accommodation_id === accommodationId && r.status === 'approved');
  },

  getAllForAdmin: async (): Promise<Review[]> => {
    return getFromStorage<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  },

  addReview: async (review: Omit<Review, 'id' | 'created_at' | 'status'>): Promise<Review> => {
    const list = getFromStorage<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    const newReview: Review = {
      ...review,
      id: `rev_${Date.now()}`,
      status: 'approved',
      created_at: new Date().toISOString()
    };
    list.unshift(newReview);
    setToStorage(STORAGE_KEYS.REVIEWS, list);
    return newReview;
  },

  updateStatus: async (reviewId: string, status: 'approved' | 'pending' | 'flagged'): Promise<boolean> => {
    const list = getFromStorage<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    const review = list.find(r => r.id === reviewId);
    if (review) {
      review.status = status;
      setToStorage(STORAGE_KEYS.REVIEWS, list);
      return true;
    }
    return false;
  }
};

// -------------------------------------------------------------
// Auth & Demo Role API Service
// -------------------------------------------------------------
export const authService = {
  getCurrentUser: (): User | null => {
    return getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  },

  switchRole: (role: UserRole): User | null => {
    if (role === 'guest') {
      setToStorage(STORAGE_KEYS.CURRENT_USER, null);
      return null;
    }
    const user = INITIAL_USERS.find(u => u.role === role) || INITIAL_USERS[0];
    setToStorage(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  }
};

// -------------------------------------------------------------
// Admin Dashboard Metrics API
// -------------------------------------------------------------
export const adminService = {
  getMetrics: async (): Promise<AdminDashboardMetrics> => {
    try {
      const res = await fetch(`${API_BASE}/accommodations/admin/metrics`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Backend admin metrics unreachable; computing locally.');
    }

    const accommodations = await accommodationService.getAll();
    const bookings = await bookingService.getAll();
    const reviews = await reviewService.getAllForAdmin();
    
    const avgScore = accommodations.length > 0 
      ? Math.round(accommodations.reduce((acc, a) => acc + (a.calculatedEcoScore || 0), 0) / accommodations.length) 
      : 0;

    const verifiedCount = accommodations.filter(a => a.sustainability.certificationStatus === 'verified').length;

    return {
      totalAccommodations: accommodations.length,
      verifiedAccommodations: verifiedCount,
      averageEcoScore: avgScore,
      totalBookings: bookings.length,
      totalUsers: 142,
      pendingReviewsCount: reviews.filter(r => r.status === 'pending').length,
      carbonOffsetKg: 8420
    };
  },

  getProviderStatus: async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/providers/status`);
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch (e) {
      console.warn('Failed to fetch provider status from backend');
    }
    return {
      success: true,
      summary: { totalProviders: 4, activeProviders: 2, totalRequests: 0, totalErrors: 0, errorRatePercent: 0 },
      providers: [
        { providerName: 'OpenStreetMap Overpass API', status: 'ACTIVE', totalRequests: 0, successfulRequests: 0, failedRequests: 0, avgLatencyMs: 210 },
        { providerName: 'EcoStay Verified Knowledge Base', status: 'ACTIVE', totalRequests: 0, successfulRequests: 0, failedRequests: 0, avgLatencyMs: 15 },
        { providerName: 'Google Places (New) API', status: 'DISABLED', totalRequests: 0, successfulRequests: 0, failedRequests: 0, avgLatencyMs: 0 },
        { providerName: 'Foursquare Places API v3', status: 'DISABLED', totalRequests: 0, successfulRequests: 0, failedRequests: 0, avgLatencyMs: 0 }
      ]
    };
  }
};
