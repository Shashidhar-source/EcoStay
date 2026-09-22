import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Leaf, 
  Sun, 
  Droplets, 
  Trash2, 
  Zap, 
  Users, 
  Hammer, 
  Sparkles, 
  ArrowRight,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Building,
  TreePine
} from 'lucide-react';
import { accommodationService } from '../services/api';
import { Accommodation } from '../types';
import { AccommodationCard } from '../components/accommodation/AccommodationCard';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [featuredStays, setFeaturedStays] = useState<Accommodation[]>([]);
  const [destination, setDestination] = useState('');
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(['solar', 'waste']);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    accommodationService.getAll().then(stays => {
      setFeaturedStays(stays.filter(s => s.featured).slice(0, 4));
    });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (destination.trim()) queryParams.set('destination', destination.trim());
    selectedPriorities.forEach(p => queryParams.append('priority', p));
    navigate(`/explore?${queryParams.toString()}`);
  };

  const togglePriority = (key: string) => {
    setSelectedPriorities(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const priorityOptions = [
    { key: 'solar', label: '100% Solar & Clean Energy', icon: Sun },
    { key: 'water', label: 'Rainwater & Bawadi Harvesting', icon: Droplets },
    { key: 'waste', label: 'Zero Single-Use Plastic & Compost', icon: Trash2 },
    { key: 'energy', label: 'Passive Climate Thermal Design', icon: Zap },
    { key: 'community', label: 'Local Tribal & Community Impact', icon: Users },
    { key: 'construction', label: 'Indigenous Bamboo & Mud Timber', icon: Hammer },
  ];

  const popularDestinations = [
    { name: 'Kerala', tag: 'Wayanad Canopy & Backwaters' },
    { name: 'Ladakh', tag: 'Leh Passive Solar Earth-Homes' },
    { name: 'Coorg', tag: 'Organic Coffee Agroforests' },
    { name: 'Rishikesh', tag: 'Ganga Vedic Wellness' },
    { name: 'Spiti Valley', tag: 'High-Altitude Solar Domes' },
    { name: 'Meghalaya', tag: 'Living Root Bridge Hamlets' }
  ];

  return (
    <div className="space-y-24">
      
      {/* Hero Section */}
      <section className="relative pt-10 pb-20 md:pt-16 md:pb-32 overflow-hidden">
        
        {/* Subtle Floating Organic Shapes in Perimeter (Opacities 0.08 - 0.16) */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden select-none">
          {/* Slow Glow Blobs */}
          <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] bg-emerald-200/35 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-32 right-1/4 w-[450px] h-[450px] bg-lime-100/50 rounded-full blur-3xl animate-float-reverse" />
          <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-teal-100/40 rounded-full blur-2xl" />

          {/* Floating Eco Particles */}
          <div className="absolute top-16 left-12 text-emerald-800/10 text-4xl animate-float-slow">
            🌿
          </div>
          <div className="absolute top-36 right-16 text-emerald-800/10 text-5xl animate-float-reverse">
            🍃
          </div>
          <div className="absolute bottom-28 left-20 text-amber-500/15 text-3xl animate-float-reverse">
            ☀️
          </div>
          <div className="absolute bottom-36 right-24 text-sky-600/12 text-3xl animate-float-slow">
            💧
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          
          {/* Header Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 text-eco-dark text-xs font-bold px-4 py-1.5 rounded-full mb-6 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-eco-primary" />
            <span>India's 1st Smart Sustainable Accommodation Recommendation Platform</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.12]"
          >
            Stay Better.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-eco-dark via-eco-primary to-emerald-500">
              Travel Greener in India.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: 'easeOut' }}
            className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Discover verified Indian eco-lodges, bamboo treehouses, and solar cob sanctuaries ranked with transparent <strong>EcoScores</strong> in <strong>₹ (INR)</strong>.
          </motion.p>

          {/* Search Box Container */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={`mt-10 max-w-3xl mx-auto bg-white/95 backdrop-blur-xl p-3 sm:p-5 rounded-3xl border transition-all duration-300 shadow-eco-lg ${
              isInputFocused ? 'border-emerald-500 ring-4 ring-emerald-500/10 shadow-xl' : 'border-emerald-100'
            }`}
          >
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                
                {/* Destination Input */}
                <div className="relative w-full sm:flex-1">
                  <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                    isInputFocused ? 'text-eco-primary' : 'text-slate-400'
                  }`} />
                  <input
                    type="text"
                    value={destination}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Where in India? (e.g. Kerala, Ladakh, Coorg, Rishikesh, Spiti...)"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-semibold focus:bg-white focus:outline-hidden transition-all text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                {/* Search Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full sm:w-auto bg-eco-primary hover:bg-eco-dark text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-emerald-900/15 flex items-center justify-center gap-2 transition-all flex-shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>Explore Stays</span>
                </motion.button>
              </div>

              {/* Sustainability Quick Priorities */}
              <div className="pt-3 border-t border-slate-100 text-left">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Select your sustainability priorities:
                </span>
                <div className="flex flex-wrap gap-2">
                  {priorityOptions.map((opt) => {
                    const active = selectedPriorities.includes(opt.key);
                    const Icon = opt.icon;
                    return (
                      <button
                        type="button"
                        key={opt.key}
                        onClick={() => togglePriority(opt.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          active
                            ? 'bg-eco-primary text-white border-eco-dark shadow-2xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : ''}`} />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </form>
          </motion.div>

          {/* Popular Destination Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-bold">Popular:</span>
            {popularDestinations.map((dest, i) => (
              <button
                key={i}
                onClick={() => {
                  setDestination(dest.name);
                  navigate(`/explore?destination=${dest.name}`);
                }}
                className="bg-white/90 hover:bg-emerald-50 text-slate-700 hover:text-eco-primary px-3 py-1 rounded-full border border-slate-200 transition-colors shadow-2xs font-semibold"
              >
                {dest.name}
              </button>
            ))}
          </div>

          {/* Quick Metrics */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/70 shadow-xs hover:border-emerald-200 transition-colors">
              <span className="text-2xl font-black text-eco-dark block">100%</span>
              <span className="text-xs text-slate-500 font-semibold">Audited Sustainability</span>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/70 shadow-xs hover:border-emerald-200 transition-colors">
              <span className="text-2xl font-black text-eco-dark block">6 Pillars</span>
              <span className="text-xs text-slate-500 font-semibold">GRIHA / IGBC Aligned</span>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/70 shadow-xs hover:border-emerald-200 transition-colors">
              <span className="text-2xl font-black text-eco-dark block">₹ INR</span>
              <span className="text-xs text-slate-500 font-semibold">Transparent Domestic Pricing</span>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/70 shadow-xs hover:border-emerald-200 transition-colors">
              <span className="text-2xl font-black text-teal-700 block">8,420 kg</span>
              <span className="text-xs text-slate-500 font-semibold">Indian Rainforest CO₂ Offsets</span>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Eco-Stays Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-eco-primary uppercase tracking-wider mb-1">
              <Leaf className="w-3.5 h-3.5" />
              <span>Handpicked Indian Sanctuaries</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Indian Eco-Stays
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-xs font-black text-eco-primary hover:text-eco-dark flex items-center gap-1 group"
          >
            <span>View all verified stays & dining</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredStays.map(stay => (
            <AccommodationCard key={stay.id} accommodation={stay} />
          ))}
        </div>
      </section>

      {/* How It Works & EcoScore Formula Explainer */}
      <section className="bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/40 py-16 border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-eco-primary bg-white px-3.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
              Responsible Tourism in India
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
              How the EcoScore Recommendation Engine Works
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed font-medium">
              We evaluate sustainable retreats across the Western Ghats, Himalayas, Thar Desert, and Northeast with an explainable 6-pillar mathematical scoring engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-white p-7 rounded-3xl border border-emerald-100/90 shadow-xs hover:shadow-eco-md transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-lg group-hover:scale-105 transition-transform">
                1
              </div>
              <h3 className="text-lg font-black text-slate-900">Set Destination & Budget (₹)</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Choose your Indian state, budget in INR, and core sustainability priorities (e.g. 100% solar power, rainwater Bawadi, zero single-use plastic).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-7 rounded-3xl border border-emerald-100/90 shadow-xs hover:shadow-eco-md transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-black text-lg group-hover:scale-105 transition-transform">
                2
              </div>
              <h3 className="text-lg font-black text-slate-900">Multi-Attribute Scoring Engine</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                The engine evaluates 40% Sustainability + 25% Preference Match + 15% Location + 10% Budget + 10% Rating to mathematically rank accommodations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-7 rounded-3xl border border-emerald-100/90 shadow-xs hover:shadow-eco-md transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-900 flex items-center justify-center font-black text-lg group-hover:scale-105 transition-transform">
                3
              </div>
              <h3 className="text-lg font-black text-slate-900">Audited Badges & Direct Booking</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Inspect radar breakdowns, compare properties side-by-side, and send direct reservation requests with verified eco-contributions.
              </p>
            </div>

          </div>

          <div className="text-center mt-10">
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 bg-eco-primary hover:bg-eco-dark text-white text-xs font-bold px-6 py-3.5 rounded-2xl shadow-md shadow-emerald-900/15 transition-all hover:scale-102"
            >
              <Compass className="w-4 h-4" />
              <span>Read Full Scoring & Technical Documentation</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
