import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Calendar, 
  Settings, 
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { accommodationService, bookingService } from '../services/api';
import { Accommodation, Booking } from '../types';
import { AccommodationCard } from '../components/accommodation/AccommodationCard';

export const UserDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { wishlistIds } = useWishlist();
  
  const [activeTab, setActiveTab] = useState<'wishlist' | 'bookings' | 'preferences'>('wishlist');
  const [wishlistAccommodations, setWishlistAccommodations] = useState<Accommodation[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [savedPreferences, setSavedPreferences] = useState({
    preferSolar: true,
    preferZeroWaste: true,
    preferRainwater: true,
    maxBudget: 12000,
    notificationCarbonReports: true
  });
  const [saveMessage, setSaveMessage] = useState(false);

  useEffect(() => {
    accommodationService.getAll().then(all => {
      setWishlistAccommodations(all.filter(a => wishlistIds.includes(a.id)));
    });
    bookingService.getAll().then(setBookings);
  }, [wishlistIds]);

  const handlePreferencesSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage(true);
    setTimeout(() => setSaveMessage(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
            alt="Profile"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">
                {currentUser ? currentUser.name : 'Aarav Sharma (Traveler)'}
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                Green Explorer Level 3
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser?.email || 'aarav.sharma@example.in'} · Member since Jan 2025 · India
            </p>
          </div>
        </div>

        {/* Impact stats pill */}
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-center gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Saved</span>
            <span className="font-extrabold text-eco-dark text-base">{wishlistIds.length} Stays</span>
          </div>
          <div className="w-px h-8 bg-emerald-200"></div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Carbon Offset</span>
            <span className="font-extrabold text-eco-dark text-base">210 kg CO₂e</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'wishlist'
              ? 'bg-eco-primary text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved Wishlist ({wishlistAccommodations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'bookings'
              ? 'bg-eco-primary text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Reservations ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'preferences'
              ? 'bg-eco-primary text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Eco Preferences</span>
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'wishlist' && (
          <motion.div
            key="wishlist"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {wishlistAccommodations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistAccommodations.map(accommodation => (
                  <AccommodationCard
                    key={accommodation.id}
                    accommodation={accommodation}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                <Heart className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800">Your wishlist is empty</h3>
                <p className="text-xs text-slate-500">Save eco-stays while browsing to quickly revisit and compare them.</p>
                <Link to="/explore" className="inline-block bg-eco-primary text-white text-xs font-bold px-4 py-2 rounded-xl">
                  Explore Stays
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'bookings' && (
          <motion.div
            key="bookings"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  {booking.accommodation_image && (
                    <img
                      src={booking.accommodation_image}
                      alt={booking.accommodation_name}
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {booking.accommodation_name || 'Indian Eco-Stay Booking'}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-eco-primary" />
                      {booking.check_in} to {booking.check_out} · {booking.guests} Guests
                    </p>
                    {booking.contact_note && (
                      <p className="text-xs text-slate-600 italic">
                        "{booking.contact_note}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right sm:self-center flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                  <span className="text-xs text-slate-400">Total Price</span>
                  <span className="text-xl font-black text-eco-dark">₹{booking.total_price.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'preferences' && (
          <motion.div
            key="preferences"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs max-w-2xl"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-1">Traveler Sustainability Profile</h3>
            <p className="text-xs text-slate-500 mb-6">
              These default priorities are used by our algorithm to personalize your recommendation feed.
            </p>

            <form onSubmit={handlePreferencesSave} className="space-y-5">
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <span className="text-xs font-semibold text-slate-800">Prioritize 100% Solar & Clean Energy Stays</span>
                  <input
                    type="checkbox"
                    checked={savedPreferences.preferSolar}
                    onChange={(e) => setSavedPreferences({ ...savedPreferences, preferSolar: e.target.checked })}
                    className="accent-eco-primary w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <span className="text-xs font-semibold text-slate-800">Prioritize Zero Single-Use Plastic & Bio-Composting</span>
                  <input
                    type="checkbox"
                    checked={savedPreferences.preferZeroWaste}
                    onChange={(e) => setSavedPreferences({ ...savedPreferences, preferZeroWaste: e.target.checked })}
                    className="accent-eco-primary w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <span className="text-xs font-semibold text-slate-800">Prioritize Rainwater & Traditional Bawadi Harvesting</span>
                  <input
                    type="checkbox"
                    checked={savedPreferences.preferRainwater}
                    onChange={(e) => setSavedPreferences({ ...savedPreferences, preferRainwater: e.target.checked })}
                    className="accent-eco-primary w-4 h-4"
                  />
                </label>
              </div>

              {saveMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Preferences updated successfully!
                </div>
              )}

              <button
                type="submit"
                className="bg-eco-primary hover:bg-eco-dark text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all"
              >
                Save Preferences
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
