import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Heart, 
  Layers, 
  Star, 
  ShieldCheck, 
  Users, 
  Bed, 
  Bath, 
  MessageSquarePlus, 
  ArrowLeft,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { accommodationService, reviewService } from '../services/api';
import { Accommodation, Review } from '../types';
import { EcoScoreBadge } from '../components/sustainability/EcoScoreBadge';
import { SustainabilityRadarChart } from '../components/sustainability/SustainabilityRadarChart';
import { EcoCredentialList } from '../components/sustainability/EcoCredentialList';
import { BookingModal } from '../components/accommodation/BookingModal';
import { ReviewModal } from '../components/accommodation/ReviewModal';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';

export const AccommodationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isCompared } = useCompare();

  useEffect(() => {
    if (id) {
      accommodationService.getById(id).then(setAccommodation);
      reviewService.getByAccommodation(id).then(setReviews);
    }
  }, [id]);

  if (!accommodation) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Accommodation not found</h2>
        <Link to="/explore" className="text-xs font-bold text-eco-primary hover:underline">
          Return to Explore
        </Link>
      </div>
    );
  }

  const isSaved = isWishlisted(accommodation.id);
  const compared = isCompared(accommodation.id);

  const handleCompareToggle = () => {
    if (compared) {
      removeFromCompare(accommodation.id);
    } else {
      addToCompare(accommodation);
    }
  };

  const handleReviewAdded = (newReview: Review) => {
    setReviews(prev => [newReview, ...prev]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-eco-primary transition-colors bg-white px-3 py-1.5 rounded-xl border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Stays</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Compare Button */}
          <button
            onClick={handleCompareToggle}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              compared 
                ? 'bg-amber-100 text-amber-900 border-amber-300' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{compared ? 'In Comparison' : 'Add to Compare'}</span>
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => toggleWishlist(accommodation.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isSaved 
                ? 'bg-rose-50 text-rose-600 border-rose-200' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Property Title & Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md">
            {accommodation.property_type.replace('_', ' ')}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-slate-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            {accommodation.rating} ({reviews.length} reviews)
          </span>
          {accommodation.sustainability.certificationStatus === 'verified' && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Audit
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {accommodation.name}
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-eco-primary" />
          {accommodation.location}, {accommodation.country}
        </p>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Large Image */}
        <div className="md:col-span-2 aspect-[16/10] rounded-3xl overflow-hidden bg-slate-100 shadow-md relative">
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedImageIndex}
              src={accommodation.images[selectedImageIndex] || accommodation.images[0]}
              alt={accommodation.name}
              initial={{ opacity: 0.8, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
        </div>

        {/* Thumbnail Column */}
        <div className="flex md:flex-col gap-3 overflow-x-auto">
          {accommodation.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImageIndex(idx)}
              className={`relative rounded-2xl overflow-hidden aspect-[16/10] w-28 md:w-full flex-shrink-0 border-2 transition-all hover:scale-[1.02] ${
                selectedImageIndex === idx ? 'border-eco-primary ring-2 ring-emerald-300' : 'border-transparent opacity-75 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout: Left Details + Right Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left 2 Cols: Details, EcoScore Radar, Amenities, Reviews */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Quick Stats Banner */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-around gap-4 text-center">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-eco-primary" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Capacity</span>
                <span className="text-xs font-bold text-slate-800">{accommodation.max_guests} Guests</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Bed className="w-5 h-5 text-eco-primary" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Bedrooms</span>
                <span className="text-xs font-bold text-slate-800">{accommodation.bedrooms} Rooms</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Bath className="w-5 h-5 text-eco-primary" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Bathrooms</span>
                <span className="text-xs font-bold text-slate-800">{accommodation.bathrooms} Baths</span>
              </div>
            </div>
          </div>

          {/* About Section */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">About this Eco-Stay</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {accommodation.description}
            </p>
          </section>

          {/* Sustainability Deep-Dive & Radar Visualization */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-eco-primary uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>GRIHA & GSTC Aligned EcoScore Profile</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  Sustainability Breakdown
                </h3>
              </div>

              <EcoScoreBadge score={accommodation.calculatedEcoScore} size="hero" />
            </div>

            {/* Recharts Radar Visualization */}
            <SustainabilityRadarChart sustainability={accommodation.sustainability} height={320} />

            {/* Audit Details and Highlights */}
            <EcoCredentialList sustainability={accommodation.sustainability} />
          </section>

          {/* Amenities Checklist */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Amenities & Green Facilities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {accommodation.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200/70 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-eco-primary flex-shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Guest Reviews Section */}
          <section className="space-y-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Guest Reviews & Eco-Observations
                </h2>
                <p className="text-xs text-slate-500">
                  Verified reviews from eco-conscious travelers
                </p>
              </div>

              <button
                onClick={() => setIsReviewOpen(true)}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                <MessageSquarePlus className="w-4 h-4 text-emerald-400" />
                <span>Write Review</span>
              </button>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={review.user_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                          alt={review.user_name}
                          className="w-8 h-8 rounded-full object-cover border border-emerald-400"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{review.user_name}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      "{review.comment}"
                    </p>

                    {review.sustainability_comment && (
                      <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 text-xs text-emerald-900 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-eco-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[11px] text-eco-dark">Traveler Eco-Audit Note:</strong>
                          <span>{review.sustainability_comment}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No reviews yet. Be the first to review!</p>
            )}
          </section>

        </div>

        {/* Right 1 Col: Sticky Booking / Price Card */}
        <aside className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-eco-md sticky top-28 space-y-5">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-slate-900">₹{accommodation.price_per_night.toLocaleString('en-IN')}</span>
                <span className="text-xs text-slate-500"> / night</span>
              </div>
              <EcoScoreBadge score={accommodation.calculatedEcoScore} size="md" />
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Free cancellation</span>
                <span className="font-semibold text-emerald-700">Up to 48h before</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Carbon Offset Included</span>
                <span className="font-semibold text-emerald-700">100% Guaranteed</span>
              </div>
            </div>

            <button
              onClick={() => setIsBookingOpen(true)}
              className="w-full bg-eco-primary hover:bg-eco-dark text-white font-bold py-3.5 rounded-2xl shadow-md shadow-emerald-900/15 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 text-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Request Reservation</span>
            </button>

            <p className="text-[11px] text-center text-slate-400">
              You won't be charged yet · Direct host communication
            </p>
          </div>
        </aside>

      </div>

      {/* Modals */}
      <BookingModal
        accommodation={accommodation}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

      <ReviewModal
        accommodation={accommodation}
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onSuccess={handleReviewAdded}
      />

    </div>
  );
};
