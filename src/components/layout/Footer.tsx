import React from 'react';
import { Leaf, ShieldCheck, Globe, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-eco-primary flex items-center justify-center text-white">
                <Leaf className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Eco<span className="text-emerald-400">Stay</span> <span className="text-xs bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-md">India</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Stay Better. Travel Greener. Discover authentic, independently audited sustainable Indian accommodations with transparent EcoScore breakdowns in ₹ INR.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/80 px-3 py-2 rounded-lg border border-emerald-800/60">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>GRIHA, IGBC & Responsible Tourism Certified</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Explore India
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/explore?destination=Kerala" className="hover:text-emerald-400 transition-colors">
                  Kerala Bamboo Canopy Lodges
                </Link>
              </li>
              <li>
                <Link to="/explore?destination=Ladakh" className="hover:text-emerald-400 transition-colors">
                  Ladakh Passive Solar Earth-Homes
                </Link>
              </li>
              <li>
                <Link to="/explore?destination=Coorg" className="hover:text-emerald-400 transition-colors">
                  Coorg Organic Coffee Agroforests
                </Link>
              </li>
              <li>
                <Link to="/explore?destination=Rishikesh" className="hover:text-emerald-400 transition-colors">
                  Rishikesh Ganga Vedic Retreats
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-emerald-400 transition-colors">
                  EcoScore Methodology
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Sustainability Pillars */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Scoring Pillars
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Renewable Solar & Clean Energy (25%)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <span>Water Conservation & Bawadi (20%)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>Zero-Waste & Organic Compost (20%)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                <span>Passive Thermal Climate Design (15%)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                <span>Local Tribal & Community Impact (10%)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>Vernacular Bamboo & Mud Build (10%)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Anti-Greenwashing */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Anti-Greenwashing Pledge
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              We verify third-party certifications (GRIHA, IGBC, Kerala Responsible Tourism, TOFTigers PUG, Rainforest Alliance) to guarantee zero false environmental claims.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Ministry of Tourism Responsible Tourism Aligned</span>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} EcoStay India. Map & POI data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">OpenStreetMap</a> contributors.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for sustainable Indian tourism
          </p>
        </div>
      </div>
    </footer>
  );
};
