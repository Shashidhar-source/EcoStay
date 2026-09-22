import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  MapPin, 
  Sun, 
  Droplets, 
  Trash2, 
  Zap, 
  Users, 
  Hammer, 
  RotateCcw,
  Check,
  Navigation,
  Utensils,
  Hotel,
  Compass,
  Loader2
} from 'lucide-react';
import { recommendationService, placesService } from '../services/api';
import { RecommendationResult, UserPreferences, NormalizedPlace, FoodClassification } from '../types';
import { AccommodationCard } from '../components/accommodation/AccommodationCard';
import { RestaurantCard } from '../components/dining/RestaurantCard';
import { MenuModal } from '../components/dining/MenuModal';

export const Explore: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode: Stays vs Dining
  const [activeMode, setActiveMode] = useState<'stays' | 'dining'>('stays');

  // Search parameters state
  const [destination, setDestination] = useState<string>(searchParams.get('destination') || '');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('');

  // Stays Filters
  const [maxBudget, setMaxBudget] = useState<number>(Number(searchParams.get('maxBudget')) || 15000);
  const [propertyType, setPropertyType] = useState<string>(searchParams.get('type') || 'all');
  const [minEcoScore, setMinEcoScore] = useState<number>(75);
  const [priorities, setPriorities] = useState({
    solar: searchParams.getAll('priority').includes('solar'),
    water: searchParams.getAll('priority').includes('water'),
    waste: searchParams.getAll('priority').includes('waste'),
    energy: searchParams.getAll('priority').includes('energy'),
    community: searchParams.getAll('priority').includes('community'),
    construction: searchParams.getAll('priority').includes('construction')
  });

  // Dining Filters
  const [foodType, setFoodType] = useState<FoodClassification | 'all'>('all');
  const [foodBudgetBracket, setFoodBudgetBracket] = useState<'all' | 'under100' | '100to200' | '200to400' | 'above400'>('all');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [diningSortBy, setDiningSortBy] = useState<'distance' | 'price_asc' | 'rating'>('distance');

  // Sorting for Stays
  const [sortBy, setSortBy] = useState<'match' | 'ecoscore' | 'price_asc' | 'price_desc' | 'rating'>('match');

  // Data states
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [restaurants, setRestaurants] = useState<NormalizedPlace[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Menu Modal state
  const [selectedRestaurant, setSelectedRestaurant] = useState<NormalizedPlace | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Handle GPS location detection
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Detecting your GPS location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setIsLocating(false);
        setLocationStatus(`📍 Live location acquired (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);

        // Reverse geocode to get friendly location name
        try {
          const rev = await placesService.reverseGeocode(latitude, longitude);
          if (rev.success && rev.data?.displayName) {
            setDestination(rev.data.name || rev.data.displayName.split(',')[0]);
          }
        } catch (e) {
          // ignore
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationStatus('Could not get GPS location. Using default Indian destinations.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Fetch Stays recommendations
  const fetchStays = async () => {
    setIsLoading(true);
    const prefs: UserPreferences = {
      destination,
      maxBudget,
      propertyType: propertyType === 'all' ? undefined : propertyType,
      priorities
    };

    try {
      const results = await recommendationService.getRecommendations(prefs);
      let filtered = results;
      if (propertyType !== 'all') {
        filtered = filtered.filter(r => r.accommodation.property_type === propertyType);
      }
      filtered = filtered.filter(r => r.accommodation.calculatedEcoScore >= minEcoScore);

      if (sortBy === 'match') {
        filtered.sort((a, b) => b.matchScore - a.matchScore);
      } else if (sortBy === 'ecoscore') {
        filtered.sort((a, b) => b.accommodation.calculatedEcoScore - a.accommodation.calculatedEcoScore);
      } else if (sortBy === 'price_asc') {
        filtered.sort((a, b) => a.accommodation.price_per_night - b.accommodation.price_per_night);
      } else if (sortBy === 'price_desc') {
        filtered.sort((a, b) => b.accommodation.price_per_night - a.accommodation.price_per_night);
      } else if (sortBy === 'rating') {
        filtered.sort((a, b) => b.accommodation.rating - a.accommodation.rating);
      }

      setRecommendations(filtered);
    } catch (e) {
      console.error('Failed to load stays', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Dining places
  const fetchDining = async () => {
    setIsLoading(true);

    let lat = userCoords?.lat || 11.6854; // Default to Wayanad/Kerala if not set
    let lng = userCoords?.lng || 76.1320;

    // If destination search query is typed and no GPS selected, geocode it
    if (destination && !userCoords) {
      try {
        const geo = await placesService.geocode(destination);
        if (geo.success && geo.data && geo.data.length > 0) {
          lat = geo.data[0].latitude;
          lng = geo.data[0].longitude;
        }
      } catch (e) {
        console.warn('Geocoding fallback', e);
      }
    }

    let budgetMin: number | undefined;
    let budgetMaxVal: number | undefined;

    if (foodBudgetBracket === 'under100') {
      budgetMaxVal = 100;
    } else if (foodBudgetBracket === '100to200') {
      budgetMin = 100;
      budgetMaxVal = 200;
    } else if (foodBudgetBracket === '200to400') {
      budgetMin = 200;
      budgetMaxVal = 400;
    } else if (foodBudgetBracket === 'above400') {
      budgetMin = 400;
    }

    try {
      const res = await placesService.getNearbyRestaurants(
        lat,
        lng,
        radiusKm * 1000,
        selectedCuisine === 'all' ? undefined : selectedCuisine,
        foodType === 'pure_vegetarian' ? 'pure_veg' : undefined,
        foodType !== 'all' ? foodType : undefined,
        budgetMaxVal,
        budgetMin
      );

      if (res.success && Array.isArray(res.data)) {
        let list: NormalizedPlace[] = res.data;

        // Apply sorting
        if (diningSortBy === 'distance') {
          list.sort((a, b) => (a.distance?.meters || 0) - (b.distance?.meters || 0));
        } else if (diningSortBy === 'price_asc') {
          list.sort((a, b) => (a.averageMealCostInr || 0) - (b.averageMealCostInr || 0));
        } else if (diningSortBy === 'rating') {
          list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }

        setRestaurants(list);
      } else {
        setRestaurants([]);
      }
    } catch (e) {
      console.error('Failed to load restaurants', e);
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeMode === 'stays') {
      fetchStays();
    } else {
      fetchDining();
    }
  }, [
    activeMode, 
    destination, 
    userCoords, 
    radiusKm, 
    maxBudget, 
    propertyType, 
    minEcoScore, 
    priorities, 
    sortBy, 
    foodType, 
    foodBudgetBracket, 
    selectedCuisine, 
    diningSortBy
  ]);

  const togglePriority = (key: keyof typeof priorities) => {
    setPriorities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetFilters = () => {
    setDestination('');
    setUserCoords(null);
    setLocationStatus('');
    setMaxBudget(15000);
    setPropertyType('all');
    setMinEcoScore(75);
    setPriorities({
      solar: false,
      water: false,
      waste: false,
      energy: false,
      community: false,
      construction: false
    });
    setFoodType('all');
    setFoodBudgetBracket('all');
    setSelectedCuisine('all');
    setSortBy('match');
    setDiningSortBy('distance');
  };

  const priorityConfig: Array<{ key: keyof typeof priorities; label: string; icon: any; color: string }> = [
    { key: 'solar', label: '100% Solar & Renewable', icon: Sun, color: 'text-amber-600' },
    { key: 'water', label: 'Rainwater & Bawadi Harvesting', icon: Droplets, color: 'text-sky-600' },
    { key: 'waste', label: 'Zero Single-Use Plastic', icon: Trash2, color: 'text-purple-600' },
    { key: 'energy', label: 'Passive Thermal Architecture', icon: Zap, color: 'text-yellow-600' },
    { key: 'community', label: 'Local Community & Tribal Support', icon: Users, color: 'text-teal-600' },
    { key: 'construction', label: 'Vernacular Bamboo & Mud Build', icon: Hammer, color: 'text-green-700' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-eco-dark to-eco-primary rounded-3xl p-6 sm:p-8 text-white shadow-eco-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-100 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Live Multi-Provider Discovery Engine (India)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Explore Affordable Stays & Pure Indian Dining
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl leading-relaxed">
            Discover verified eco-stays, nearby budget dining, pure vegetarian thali houses, and real menu prices in ₹ (INR).
          </p>
        </div>

        {/* Quick Search & Location Tools */}
        <div className="w-full md:w-96 space-y-2">
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                if (userCoords) setUserCoords(null);
              }}
              placeholder="Search Wayanad, Leh, Coorg, Rishikesh..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-xs font-semibold focus:outline-hidden shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-md transition-colors border border-white/20"
            >
              {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
              <span>{isLocating ? 'Locating...' : '📍 Use My Live Location'}</span>
            </button>

            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/20 backdrop-blur-md focus:outline-hidden"
              title="Search Radius"
            >
              <option value="1" className="text-slate-900">1 km</option>
              <option value="3" className="text-slate-900">3 km</option>
              <option value="5" className="text-slate-900">5 km</option>
              <option value="10" className="text-slate-900">10 km</option>
              <option value="25" className="text-slate-900">25 km</option>
              <option value="50" className="text-slate-900">50 km</option>
            </select>
          </div>

          {locationStatus && (
            <p className="text-[11px] text-emerald-100 font-semibold px-1">
              {locationStatus}
            </p>
          )}
        </div>
      </div>

      {/* Mode Switcher Tabs (Stays vs Dining) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveMode('stays')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeMode === 'stays'
                ? 'bg-white text-eco-dark shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Hotel className="w-4 h-4 text-eco-primary" />
            <span>🌿 Eco & Budget Stays</span>
          </button>

          <button
            onClick={() => setActiveMode('dining')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeMode === 'dining'
                ? 'bg-white text-eco-dark shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Utensils className="w-4 h-4 text-amber-600" />
            <span>🍽️ Affordable Dining & Menus</span>
          </button>
        </div>

        {/* Dietary Quick Filter Pills (Shown in Dining mode) */}
        {activeMode === 'dining' && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFoodType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                foodType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Dining
            </button>
            <button
              onClick={() => setFoodType('pure_vegetarian')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                foodType === 'pure_vegetarian'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-50 text-green-800 border border-green-200 hover:bg-green-100'
              }`}
            >
              <span>🥗 Pure Veg</span>
            </button>
            <button
              onClick={() => setFoodType('vegetarian_friendly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                foodType === 'vegetarian_friendly'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span>🌱 Veg Friendly</span>
            </button>
            <button
              onClick={() => setFoodType('non_vegetarian')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                foodType === 'non_vegetarian'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span>🍗 Non-Veg</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Layout: Filters Sidebar + Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 h-fit sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <SlidersHorizontal className="w-4 h-4 text-eco-primary" />
              <span>{activeMode === 'stays' ? 'Stay Filters' : 'Dining Filters'}</span>
            </div>
            <button
              onClick={resetFilters}
              className="text-xs text-slate-400 hover:text-eco-primary flex items-center gap-1 font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* STAYS FILTERS */}
          {activeMode === 'stays' ? (
            <>
              {/* Sustainability Priorities */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Sustainability Priorities (Weighted)
                </label>
                <div className="space-y-2">
                  {priorityConfig.map(({ key, label, icon: Icon, color }) => {
                    const checked = priorities[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => togglePriority(key)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
                          checked
                            ? 'bg-emerald-50 border-eco-primary text-eco-dark font-bold'
                            : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${color}`} />
                          <span className="truncate">{label}</span>
                        </div>
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                          checked ? 'bg-eco-primary border-eco-primary text-white' : 'border-slate-300'
                        }`}>
                          {checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minimum EcoScore Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Minimum EcoScore</span>
                  <span className="text-eco-primary">{minEcoScore}/100</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="95"
                  step="5"
                  value={minEcoScore}
                  onChange={(e) => setMinEcoScore(Number(e.target.value))}
                  className="w-full accent-eco-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                  <span>Grade C (60)</span>
                  <span>Grade A+ (95)</span>
                </div>
              </div>

              {/* Maximum Price Per Night in INR */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Max Budget / Night</span>
                  <span className="text-eco-primary">₹{maxBudget.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="20000"
                  step="500"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  className="w-full accent-eco-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                  <span>₹2,000</span>
                  <span>₹20,000+</span>
                </div>
              </div>

              {/* Property Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-eco-primary"
                >
                  <option value="all">All Eco Types</option>
                  <option value="treehouse">Canopy Bamboo Treehouses</option>
                  <option value="cabin">Passive Solar Earth-Cabins</option>
                  <option value="glamping">Desert & Himalayan Glamping</option>
                  <option value="villa">Agroforest Coffee Villas</option>
                  <option value="boutique_hotel">Wildlife & Heritage Lodges</option>
                  <option value="eco_lodge">Vedic Forest Retreats</option>
                </select>
              </div>
            </>
          ) : (
            /* DINING FILTERS */
            <>
              {/* Food Budget Brackets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Affordable Food Budget
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'all', label: 'All Budgets' },
                    { key: 'under100', label: 'Under ₹100' },
                    { key: '100to200', label: '₹100–₹200' },
                    { key: '200to400', label: '₹200–₹400' },
                    { key: 'above400', label: '₹400+' }
                  ].map(b => (
                    <button
                      key={b.key}
                      onClick={() => setFoodBudgetBracket(b.key as any)}
                      className={`p-2 rounded-xl text-xs font-bold border text-center transition-all ${
                        foodBudgetBracket === b.key
                          ? 'bg-eco-primary text-white border-eco-primary shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cuisine Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Cuisine
                </label>
                <select
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-eco-primary"
                >
                  <option value="all">All Cuisines</option>
                  <option value="kerala">Kerala & Sadhya</option>
                  <option value="south indian">South Indian</option>
                  <option value="north indian">North Indian</option>
                  <option value="ayurvedic">Ayurvedic & Sattvic</option>
                  <option value="himalayan">Himalayan & Tibetan</option>
                  <option value="kodava">Coorg Kodava</option>
                  <option value="dhaba">Highway Dhaba</option>
                  <option value="cafe">Eco Cafe</option>
                </select>
              </div>

              {/* Distance Radius */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Search Radius</span>
                  <span className="text-eco-primary">{radiusKm} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full accent-eco-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                  <span>1 km (Walking)</span>
                  <span>50 km (Regional)</span>
                </div>
              </div>
            </>
          )}

        </aside>

        {/* Results Grid */}
        <main className="lg:col-span-3 space-y-6">
          
          {/* Results Summary & Sort Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Found{' '}
                <span className="text-eco-primary font-black">
                  {activeMode === 'stays' ? recommendations.length : restaurants.length}
                </span>{' '}
                {activeMode === 'stays' ? 'verified Indian eco-stays' : 'nearby dining spots & eateries'}
              </span>
              {destination && (
                <span className="text-xs text-slate-500">
                  near "{destination}"
                </span>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Sort by:</span>
              {activeMode === 'stays' ? (
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="text-xs font-bold p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden focus:border-eco-primary"
                >
                  <option value="match">Smart Match (Weighted Recommendation)</option>
                  <option value="ecoscore">Highest EcoScore (A+ First)</option>
                  <option value="price_asc">Price: Low to High (₹)</option>
                  <option value="price_desc">Price: High to Low (₹)</option>
                  <option value="rating">Guest Rating</option>
                </select>
              ) : (
                <select
                  value={diningSortBy}
                  onChange={(e: any) => setDiningSortBy(e.target.value)}
                  className="text-xs font-bold p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden focus:border-eco-primary"
                >
                  <option value="distance">Distance: Closest First</option>
                  <option value="price_asc">Meal Price: Low to High (₹)</option>
                  <option value="rating">Highest Rated</option>
                </select>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs">
                <Loader2 className="w-4 h-4 text-eco-primary animate-spin" />
                <span>
                  {activeMode === 'stays' 
                    ? 'Discovering sustainable stays & calculating EcoScores near you...' 
                    : 'Searching local eateries, pure-veg dhabas & authentic Indian menus...'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} className="bg-white rounded-3xl border border-slate-200/80 p-4 space-y-4 shadow-xs">
                    <div className="w-full aspect-16/10 rounded-2xl skeleton-shimmer" />
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 rounded-lg skeleton-shimmer" />
                      <div className="h-3 w-1/2 rounded-lg skeleton-shimmer" />
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="h-5 w-24 rounded-lg skeleton-shimmer" />
                      <div className="h-7 w-16 rounded-xl skeleton-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeMode === 'stays' ? (
            recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map(rec => (
                  <AccommodationCard
                    key={rec.accommodation.id}
                    accommodation={rec.accommodation}
                    recommendation={rec}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No accommodations matched your filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try loosening your budget, lowering the minimum EcoScore, or clearing the destination search.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-eco-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-eco-dark transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )
          ) : (
            restaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map(rest => (
                  <RestaurantCard
                    key={rest.id}
                    restaurant={rest}
                    onViewMenu={(r) => {
                      setSelectedRestaurant(r);
                      setIsMenuOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Utensils className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No dining places found for selected filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try increasing your search radius or switching dietary preferences to all dining.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-eco-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-eco-dark transition-colors"
                >
                  Reset Dining Filters
                </button>
              </div>
            )
          )}

        </main>

      </div>

      {/* Itemized Menu Modal */}
      <MenuModal
        restaurant={selectedRestaurant}
        isOpen={isMenuOpen}
        onClose={() => {
          setIsMenuOpen(false);
          setSelectedRestaurant(null);
        }}
      />

    </div>
  );
};
