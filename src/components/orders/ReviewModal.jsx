import React, { useState } from 'react';
import { X, Star, Upload, Trash } from 'lucide-react';
import toast from 'react-hot-toast';

const ReviewModal = ({ isOpen, onClose, onConfirm, order, loading = false }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [mockUploading, setMockUploading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const orderItems = order?.orderItems || [];

  // Pre-select first item
  if (orderItems.length > 0 && !selectedProductId) {
    setSelectedProductId(orderItems[0].product);
  }

  // Handle mock image upload for review
  const handleMockUpload = (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    setMockUploading(true);
    toast.loading('Uploading review images...', { id: 'review-upload' });

    setTimeout(() => {
      const mockUrls = Array.from(files).map((f) => `/uploads/mock_review_${Math.floor(Math.random() * 1000)}.jpg`);
      setImages((prev) => [...prev, ...mockUrls]);
      setMockUploading(false);
      toast.success('Review images added successfully!', { id: 'review-upload' });
    }, 1200);
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      setError('Please select a product to review');
      return;
    }
    if (!comment || comment.trim().length < 5) {
      setError('Review comment must be at least 5 characters');
      return;
    }
    onConfirm({ productId: selectedProductId, rating, comment, images });
  };

  const selectedItem = orderItems.find(item => item.product === selectedProductId) || orderItems[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto select-none">
      <div className="bg-white dark:bg-navy-600 rounded-3xl w-full max-w-lg my-8 overflow-hidden shadow-gold-lg border border-cream-200 dark:border-navy-700/60 transition-all duration-300 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cream-200 dark:border-navy-700">
          <div className="flex items-center gap-2 text-amber-500">
            <Star className="w-5 h-5 fill-current" />
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Write a Review</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-cream-100 dark:hover:bg-navy-700 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleConfirm} className="p-6 space-y-5">
          
          {/* Product Selector for Multi-product orders */}
          {orderItems.length > 1 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Select Product to Review *
              </label>
              <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                {orderItems.map((item) => {
                  const isSelected = item.product === selectedProductId;
                  return (
                    <button
                      key={item.product}
                      type="button"
                      onClick={() => {
                        setSelectedProductId(item.product);
                        setError('');
                      }}
                      className={`flex-shrink-0 flex items-center gap-2 p-2 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-gold-500 bg-gold-50/10 text-gold-600 dark:border-gold-400'
                          : 'border-cream-200 bg-cream-50/20 hover:bg-cream-50 dark:border-navy-700 dark:bg-navy-800'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100">
                        <img
                          src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=200&auto=format&fit=crop"
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left max-w-[120px]">
                        <span className="block text-[10px] font-bold truncate text-gray-700 dark:text-gray-300">
                          {item.name}
                        </span>
                        <span className="block text-[8px] text-gray-400">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Product display if single item */}
          {orderItems.length === 1 && selectedItem && (
            <div className="flex items-center gap-3 p-3 bg-cream-50/30 dark:bg-navy-700/50 rounded-2xl border border-cream-200 dark:border-navy-700">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=200&auto=format&fit=crop"
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">{selectedItem.name}</h4>
                {selectedItem.variant && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {Object.entries(selectedItem.variant).map(([key, val]) => `${key}: ${val}`).join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Interactive Star Rating */}
          <div className="flex flex-col items-center justify-center py-2 space-y-1.5">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Overall Rating *
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = hoverRating ? star <= hoverRating : star <= rating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 hover:scale-125 transition-all text-amber-400 cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 ${filled ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-bold text-amber-500 mt-1">
              {rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Disappointing' : 'Very Poor'}
            </span>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Write your review comments *
            </label>
            <textarea
              placeholder="What did you like or dislike about this pillow/bedsheet? Tell us about your sleep quality!"
              rows={3}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-cream-300 dark:border-navy-700 bg-cream-50/20 dark:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-gold-500 focus:border-transparent text-gray-700 dark:text-gray-200 transition-all resize-none placeholder-gray-400"
            />
            {error && <p className="text-[11px] text-rose-500 font-semibold">{error}</p>}
          </div>

          {/* Photo uploads for review */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Add photos of product (Optional)
            </label>
            <div className="flex flex-wrap gap-2.5 items-center">
              <label className="w-16 h-16 border border-dashed border-cream-300 hover:border-gold-400 dark:border-navy-700 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all bg-cream-50/20 dark:bg-navy-800 hover:bg-cream-100/30">
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-[8px] text-gray-400 mt-0.5 font-bold">Add Photo</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMockUpload}
                  disabled={mockUploading}
                  className="hidden"
                />
              </label>

              {images.map((img, idx) => (
                <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden border border-cream-200 dark:border-navy-700 relative group shadow-sm bg-gray-50">
                  <img
                    src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=200&auto=format&fit=crop"
                    alt="Upload Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-0.5 bg-rose-600 rounded-full text-white cursor-pointer hover:bg-rose-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-cream-200 dark:border-navy-700 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-300 hover:bg-cream-100 dark:hover:bg-navy-700 rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gold-gradient hover:opacity-95 disabled:opacity-50 rounded-xl transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ReviewModal;
