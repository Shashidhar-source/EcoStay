import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Leaf, 
  Heart, 
  Layers, 
  User, 
  ShieldCheck, 
  Compass, 
  HelpCircle,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';

export const Navbar: React.FC = () => {
  const { currentUser, role } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const { selectedProperties, setIsDrawerOpen } = useCompare();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header 
      className={`sticky top-[37px] z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-xs' 
          : 'bg-white/95 backdrop-blur-md border-b border-emerald-100/80 shadow-2xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-eco-dark to-eco-primary flex items-center justify-center text-white shadow-md shadow-emerald-900/15"
            >
              <Leaf className="w-5 h-5 text-emerald-300" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-eco-dark flex items-center gap-0.5">
                Eco<span className="text-eco-primary">Stay</span>
              </span>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase -mt-1">
                Sustainable Discovery
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <Link
              to="/explore"
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive('/explore')
                  ? 'bg-emerald-50 text-eco-dark shadow-2xs border border-emerald-200/60'
                  : 'text-slate-600 hover:text-eco-dark hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4 text-eco-primary" />
              <span>Explore Stays & Food</span>
            </Link>

            <Link
              to="/how-it-works"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive('/how-it-works')
                  ? 'bg-emerald-50 text-eco-dark shadow-2xs border border-emerald-200/60'
                  : 'text-slate-600 hover:text-eco-dark hover:bg-slate-50'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>EcoScore System</span>
            </Link>

            {/* Compare Trigger Button */}
            {selectedProperties.length > 0 && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200 shadow-2xs"
              >
                <Layers className="w-4 h-4 text-amber-700" />
                <span>Compare</span>
                <span className="bg-amber-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {selectedProperties.length}
                </span>
              </motion.button>
            )}

            {/* Wishlist Link */}
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive('/dashboard')
                  ? 'bg-emerald-50 text-eco-dark shadow-2xs border border-emerald-200/60'
                  : 'text-slate-600 hover:text-eco-dark hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse-subtle">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Admin Dashboard button if role is admin */}
            {role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all border ${
                  isActive('/admin')
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                    : 'bg-amber-50 text-amber-900 border-amber-300/80 hover:bg-amber-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Admin Dashboard</span>
              </Link>
            )}
          </nav>

          {/* User Profile / Status */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2.5 pl-2.5 pr-4 py-1 rounded-full border border-slate-200/90 hover:border-eco-primary transition-all bg-slate-50/60 hover:bg-white shadow-2xs group"
              >
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-emerald-500 group-hover:scale-105 transition-transform"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-slate-800 leading-tight">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold capitalize">
                    {currentUser.role}
                  </span>
                </div>
              </Link>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/explore"
                  className="bg-eco-primary hover:bg-eco-dark text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-900/10 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Start Exploring</span>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {wishlistCount > 0 && (
              <Link to="/dashboard" className="p-2 text-rose-500 relative">
                <Heart className="w-5 h-5 fill-rose-500" />
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 overflow-hidden shadow-lg"
          >
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-eco-dark font-bold text-xs transition-colors"
            >
              <Compass className="w-4 h-4 text-eco-primary" />
              <span>Explore Stays & Food</span>
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-eco-dark font-bold text-xs transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>How EcoScore Works</span>
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-eco-dark font-bold text-xs transition-colors"
            >
              <User className="w-4 h-4 text-eco-primary" />
              <span>My Dashboard & Wishlist ({wishlistCount})</span>
            </Link>
            {role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-amber-900 bg-amber-50 font-black text-xs border border-amber-200 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Admin Portal</span>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
