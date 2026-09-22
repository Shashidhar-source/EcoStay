import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Utensils, Sparkles, CheckCircle2, MapPin, ExternalLink, Leaf } from 'lucide-react';
import { MenuItem, NormalizedPlace } from '../../types';

interface MenuModalProps {
  restaurant: NormalizedPlace | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({ restaurant, isOpen, onClose }) => {
  if (!restaurant) return null;

  const menu = restaurant.menu || [];
  
  // Group menu items by category
  const categories = Array.from(new Set(menu.map(m => m.category || 'mains')));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] z-10"
          >
            
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-eco-dark text-white p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Indian Menu & Prices (₹)
                </span>
                {restaurant.dietInfo === 'pure_vegetarian' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-green-500 text-white shadow-2xs">
                    🥗 100% Pure Veg
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">{restaurant.name}</h2>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{restaurant.address}</span>
              </p>
            </div>

            {/* Menu Items Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {menu.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 shadow-2xs">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800">Menu Details Available at Location</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Estimated average meal cost is <span className="font-bold text-slate-800">₹{restaurant.averageMealCostInr || 250}</span> per person. Call or visit the restaurant for daily fresh seasonal specials.
                  </p>
                  {restaurant.phone && (
                    <div className="pt-2 text-xs font-bold text-eco-primary">
                      📞 Contact: {restaurant.phone}
                    </div>
                  )}
                </div>
              ) : (
                categories.map(cat => {
                  const items = menu.filter(m => (m.category || 'mains') === cat);
                  return (
                    <div key={cat} className="space-y-3">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-eco-primary" />
                        <span className="capitalize">{cat}</span> ({items.length})
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {items.map(item => (
                          <motion.div 
                            key={item.id}
                            whileHover={{ y: -2 }}
                            className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition-all flex flex-col justify-between space-y-2 shadow-2xs group"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-3.5 h-3.5 rounded-xs flex items-center justify-center border text-[8px] font-black ${
                                    item.isVegetarian 
                                      ? 'border-green-600 text-green-600 bg-green-50' 
                                      : 'border-red-600 text-red-600 bg-red-50'
                                  }`}>
                                    ●
                                  </span>
                                  <span className="font-bold text-xs text-slate-900 leading-snug group-hover:text-eco-primary transition-colors">
                                    {item.name}
                                  </span>
                                </div>
                                <span className="font-black text-xs text-eco-primary shrink-0">
                                  ₹{item.priceInr}
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                              {item.isVegan && (
                                <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-sm font-black">
                                  Vegan
                                </span>
                              )}
                              <span className="capitalize">{item.category}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-medium">
                Source: <span className="font-bold text-slate-700">{restaurant.source}</span>
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={restaurant.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Google Maps Directions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
