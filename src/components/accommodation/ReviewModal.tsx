import React, { useState } from 'react';
import { Accommodation, Review } from '../../types';
import { reviewService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { X, Star, Leaf, Check } from 'lucide-react';

interface ReviewModalProps {
  accommodation: Accommodation;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (review: Review) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  accommodation,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [sustainabilityComment, setSustainabilityComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Please enter a review comment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newReview = await reviewService.addReview({
        user_id: currentUser ? currentUser.id : `user_guest_${Date.now()}`,
        user_name: currentUser ? currentUser.name : 'Traveler Guest',
        user_avatar: currentUser?.avatarUrl,
        accommodation_id: accommodation.id,
        rating,
        comment,
        sustainability_comment: sustainabilityComment
      });

      onSuccess(newReview);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100">
        
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Write an Eco-Review</h3>
            <p className="text-xs text-slate-500">Share your stay experience at {accommodation.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Star Rating selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Overall Experience Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-bold text-slate-700">{rating} of 5 Stars</span>
            </div>
          </div>

          {/* General comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Review
            </label>
            <textarea
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What made your stay memorable? Describe hospitality, comfort, views..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-eco-primary h-24 resize-none"
            />
          </div>

          {/* Sustainability specific audit feedback */}
          <div>
            <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-eco-primary" />
              Sustainability Feedback (Optional)
            </label>
            <textarea
              value={sustainabilityComment}
              onChange={(e) => setSustainabilityComment(e.target.value)}
              placeholder="Did you notice solar panels, composting bins, organic food sourcing, or energy efficiency in action?"
              className="w-full text-xs p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 focus:outline-hidden focus:border-eco-primary h-20 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-eco-primary hover:bg-eco-dark text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Posting...' : 'Submit Review'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
