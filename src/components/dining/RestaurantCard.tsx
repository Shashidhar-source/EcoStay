import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Utensils, Star, ExternalLink, Sparkles } from 'lucide-react';
import { NormalizedPlace } from '../../types';

interface RestaurantCardProps {
  restaurant: NormalizedPlace;
  onViewMenu: (restaurant: NormalizedPlace) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onViewMenu }) => {
  const freshnessColors: Record<string, string> = {
    LIVE: 'bg-emerald-500 text-white',
    VERIFIED: 'bg-eco-primary text-white',
    RECENT: 'bg-blue-600 text-white',
    CACHED: 'bg-slate-600 text-white',
    ESTIMATED: 'bg-amber-600 text-white',
    UNKNOWN: 'bg-slate-400 text-white'
  };

  const affordabilityBadge = () => {
    const cost = restaurant.averageMealCostInr || 250;
    if (cost <= 200) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
          🟢 Budget Friendly
        </span>
      );
    } else if (cost <= 400) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800 border border-teal-300">
          🟢 Affordable
        </span>
      );
    } else if (cost <= 800) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
          🟡 Moderate
        </span>
      );
    } else {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
          🟠 Premium
        </span>
      );
    }
  };

  const dietBadge = () => {
    switch (restaurant.dietInfo) {
      case 'pure_vegetarian':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-green-100 text-green-900 border border-green-300 flex items-center gap-1 shadow-2xs">
            🥗 Pure Veg
          </span>
        );
      case 'vegetarian_friendly':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            🌱 Veg Friendly
          </span>
        );
      case 'non_vegetarian':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
            🍗 Non-Veg Available
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
            Multi-Diet
          </span>
        );
    }
  };

  const imageSrc = restaurant.images && restaurant.images.length > 0
    ? restaurant.images[0]
    : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-eco-md transition-shadow duration-300 overflow-hidden flex flex-col justify-between group"
    >
      
      {/* Image & Badges */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600 ease-out"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Subtle Dark Bottom Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20 pointer-events-none" />

        {/* Freshness Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs ${
            freshnessColors[restaurant.verificationStatus] || freshnessColors.CACHED
          }`}>
            ● {restaurant.verificationStatus}
          </span>
          {restaurant.isOpenNow !== null && restaurant.isOpenNow !== undefined && (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
              restaurant.isOpenNow ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'
            }`}>
              {restaurant.isOpenNow ? 'Open Now' : 'Closed'}
            </span>
          )}
        </div>

        {/* Distance Badge */}
        {restaurant.distance && (
          <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-md border border-white/10">
            <Navigation className="w-3 h-3 text-eco-primary" />
            <span>{restaurant.distance.formatted}</span>
            {restaurant.distance.drivingMinutes && (
              <span className="text-slate-300 font-normal">({restaurant.distance.drivingMinutes}m drive)</span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-black text-slate-900 text-base leading-snug group-hover:text-eco-primary transition-colors line-clamp-1">
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0 bg-amber-50 text-amber-900 border border-amber-200/60 px-2 py-0.5 rounded-lg text-xs font-black">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{restaurant.rating ? restaurant.rating.toFixed(1) : '4.5'}</span>
            </div>
          </div>

          {/* Address */}
          <p className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{restaurant.address}</span>
          </p>

          {/* Diet, Affordability & Cuisine */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {dietBadge()}
            {affordabilityBadge()}
            {restaurant.cuisine?.slice(0, 2).map((c, i) => (
              <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-semibold">
                {c}
              </span>
            ))}
          </div>

        </div>

        {/* Price & Actions */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Average Meal Cost
              </span>
              <span className="text-base font-black text-slate-900">
                ₹{restaurant.averageMealCostInr || 250}{' '}
                <span className="text-xs font-normal text-slate-500">/ person</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">
              Source: {restaurant.source}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onViewMenu(restaurant)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-eco-dark text-xs font-bold transition-colors border border-emerald-200 shadow-2xs"
            >
              <Utensils className="w-3.5 h-3.5 text-eco-primary" />
              <span>View Menu (₹)</span>
            </motion.button>

            <motion.a
              whileTap={{ scale: 0.97 }}
              href={restaurant.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <span>Directions</span>
              <ExternalLink className="w-3 h-3" />
            </motion.a>
          </div>
        </div>

      </div>

    </motion.div>
  );
};
