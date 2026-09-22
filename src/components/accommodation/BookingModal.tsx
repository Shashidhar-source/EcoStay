import React, { useState } from 'react';
import { Accommodation, Booking } from '../../types';
import { bookingService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { X, Calendar, Users, ShieldCheck, CheckCircle, Sparkles } from 'lucide-react';
import { EcoScoreBadge } from '../sustainability/EcoScoreBadge';

interface BookingModalProps {
  accommodation: Accommodation;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  accommodation,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  
  const [checkIn, setCheckIn] = useState('2025-07-10');
  const [checkOut, setCheckOut] = useState('2025-07-14');
  const [guests, setGuests] = useState(2);
  const [contactNote, setContactNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<Booking | null>(null);

  if (!isOpen) return null;

  // Calculate nights & pricing in INR
  const date1 = new Date(checkIn);
  const date2 = new Date(checkOut);
  const diffTime = Math.max(0, date2.getTime() - date1.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const staySubtotal = nights * accommodation.price_per_night;
  const ecoConservationFee = 350; // standard Indian eco-conservation fund (in INR)
  const total = staySubtotal + ecoConservationFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const created = await bookingService.create({
        user_id: currentUser ? currentUser.id : 'user_guest',
        accommodation_id: accommodation.id,
        accommodation_name: accommodation.name,
        accommodation_image: accommodation.images[0],
        check_in: checkIn,
        check_out: checkOut,
        guests,
        total_price: total,
        status: 'confirmed',
        contact_note: contactNote
      });

      setBookingSuccess(created);
      if (onSuccess) onSuccess(created);
    } catch (err) {
      console.error(err);
      alert('Failed to send booking request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 relative">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-eco-dark to-eco-primary p-6 text-white flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Eco-Stay Reservation Request
            </span>
            <h3 className="text-xl font-bold mt-1 text-white leading-tight">
              {accommodation.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <EcoScoreBadge score={accommodation.calculatedEcoScore} size="sm" />
              <span className="text-xs text-emerald-100">₹{accommodation.price_per_night.toLocaleString('en-IN')} / night</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        {bookingSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold text-slate-900">Inquiry Confirmed!</h4>
            <p className="text-sm text-slate-600">
              Your reservation request for <span className="font-semibold text-slate-800">{nights} nights</span> at <span className="font-semibold text-slate-800">{accommodation.name}</span> has been processed.
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 text-left space-y-1.5">
              <p><strong>Booking ID:</strong> {bookingSuccess.id}</p>
              <p><strong>Dates:</strong> {bookingSuccess.check_in} to {bookingSuccess.check_out}</p>
              <p><strong>Total (with Eco Contribution):</strong> ₹{bookingSuccess.total_price.toLocaleString('en-IN')}</p>
              <p className="text-emerald-700 font-semibold pt-1 border-t border-emerald-200">
                🌿 Estimated carbon footprint offset: 48 kg CO₂e
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-eco-primary hover:bg-eco-dark text-white font-bold py-3 rounded-xl transition-all shadow-md"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-eco-primary" /> Check-in
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-eco-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-eco-primary" /> Check-out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-eco-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-eco-primary" /> Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-eco-primary"
              >
                {Array.from({ length: accommodation.max_guests }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Special Eco Notes or Requests (Optional)
              </label>
              <textarea
                value={contactNote}
                onChange={(e) => setContactNote(e.target.value)}
                placeholder="e.g. EV charger access, Sattvic / Ayurvedic meal preferences, local travel guidance..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-eco-primary h-20 resize-none"
              />
            </div>

            {/* Price breakdown */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>₹{accommodation.price_per_night.toLocaleString('en-IN')} × {nights} nights</span>
                <span className="font-semibold">₹{staySubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Western Ghats & Himalayan Conservation Fund
                </span>
                <span className="font-semibold">₹{ecoConservationFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Total Due at Stay</span>
                <span className="text-eco-dark text-base font-black">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-eco-primary hover:bg-eco-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Submitting Reservation...' : 'Request Eco-Stay Reservation'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
