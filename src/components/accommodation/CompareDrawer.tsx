import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompare } from '../../context/CompareContext';
import { Layers, X, ArrowRight, Trash2 } from 'lucide-react';
import { EcoScoreBadge } from '../sustainability/EcoScoreBadge';

export const CompareDrawer: React.FC = () => {
  const { 
    selectedProperties, 
    removeFromCompare, 
    clearCompare, 
    isDrawerOpen, 
    setIsDrawerOpen 
  } = useCompare();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isDrawerOpen && selectedProperties.length > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0, x: '-50%' }}
          animate={{ y: 0, opacity: 1, x: '-50%' }}
          exit={{ y: 80, opacity: 0, x: '-50%' }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-1/2 z-50 w-[95%] max-w-4xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-300/80 p-4"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Left header */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-amber-100 text-amber-900 shadow-2xs">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900">
                    Compare Stays ({selectedProperties.length}/4)
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Side-by-side EcoScore and sustainability audit
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="sm:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected thumbnails */}
            <div className="flex items-center gap-2.5 overflow-x-auto w-full sm:w-auto py-1">
              <AnimatePresence>
                {selectedProperties.map(property => (
                  <motion.div 
                    key={property.id}
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative flex items-center gap-2 bg-slate-50 border border-slate-200/90 p-1.5 pr-2.5 rounded-2xl flex-shrink-0 shadow-2xs"
                  >
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="w-9 h-9 rounded-xl object-cover"
                    />
                    <div className="flex flex-col max-w-[110px]">
                      <span className="text-xs font-bold text-slate-800 truncate">{property.name}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">₹{property.price_per_night.toLocaleString('en-IN')}/nt</span>
                    </div>
                    <EcoScoreBadge score={property.calculatedEcoScore} size="sm" />
                    <button
                      onClick={() => removeFromCompare(property.id)}
                      className="ml-1 text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={clearCompare}
                className="text-xs text-slate-500 hover:text-rose-600 font-bold px-2.5 py-2 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={selectedProperties.length < 2}
                onClick={() => {
                  setIsDrawerOpen(false);
                  navigate('/compare');
                }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                  selectedProperties.length >= 2
                    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-900/15'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Compare Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
