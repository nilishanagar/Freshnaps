import React, { useState } from 'react';
import { X, RefreshCw, Upload, MapPin, CreditCard, Wallet, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const ReturnOrderModal = ({ isOpen, onClose, onConfirm, order, loading = false }) => {
  const [reason, setReason] = useState('');
  const [customComment, setCustomComment] = useState('');
  const [refundMethod, setRefundMethod] = useState('original');
  const [images, setImages] = useState([]);
  const [mockUploading, setMockUploading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const reasons = [
    'Product size is incorrect / Fitting issue',
    'Received defective or damaged item',
    'Product color/quality differs from website description',
    'Received completely incorrect item',
    'No longer needed / Change of mind',
  ];

  // Mock upload logic
  const handleMockUpload = (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    setMockUploading(true);
    toast.loading('Uploading images...', { id: 'mock-upload' });

    setTimeout(() => {
      // Simulate successful upload and create mock URLs
      const mockUrls = Array.from(files).map((f) => `/uploads/mock_return_${Math.floor(Math.random() * 1000)}.jpg`);
      setImages((prev) => [...prev, ...mockUrls]);
      setMockUploading(false);
      toast.success('Product images uploaded successfully!', { id: 'mock-upload' });
    }, 1500);
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a return reason');
      return;
    }
    const finalReason = reason + (customComment ? ` - ${customComment}` : '');
    onConfirm({ reason: finalReason, images, refundMethod });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto select-none">
      <div className="bg-white dark:bg-navy-600 rounded-3xl w-full max-w-lg my-8 overflow-hidden shadow-gold-lg border border-cream-200 dark:border-navy-700/60 transition-all duration-300 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cream-200 dark:border-navy-700">
          <div className="flex items-center gap-2 text-orange-500">
            <RefreshCw className="w-5 h-5 animate-spin-slow" />
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Request Return / Replacement</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-cream-100 dark:hover:bg-navy-700 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleConfirm} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-thin">
          
          {/* Reason Section */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Reason for Return *
            </label>
            <select
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-cream-300 dark:border-navy-700 bg-cream-50/20 dark:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700 dark:text-gray-200 transition-all cursor-pointer"
            >
              <option value="" disabled>Select a return reason...</option>
              {reasons.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {error && <p className="text-[11px] text-rose-500 font-semibold">{error}</p>}
          </div>

          {/* Comments */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Additional details (Optional)
            </label>
            <textarea
              placeholder="Describe condition of products, size issues, etc."
              rows={2}
              value={customComment}
              onChange={(e) => setCustomComment(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-cream-300 dark:border-navy-700 bg-cream-50/20 dark:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700 dark:text-gray-200 transition-all resize-none placeholder-gray-400"
            />
          </div>

          {/* Image Upload Block */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Upload Product Images (Recommended)
            </label>
            <div className="flex flex-wrap gap-3 items-center">
              <label className="w-24 h-24 border-2 border-dashed border-cream-300 hover:border-orange-400 dark:border-navy-700 dark:hover:border-orange-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all bg-cream-50/20 dark:bg-navy-800 hover:bg-cream-100/30">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] text-gray-400 mt-1 font-bold">Add Photo</span>
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
                <div key={idx} className="w-24 h-24 rounded-2xl overflow-hidden border border-cream-200 dark:border-navy-700 relative group shadow-sm bg-gray-50">
                  <img
                    src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=200&auto=format&fit=crop" // Beautiful bedding stock replacement
                    alt="Upload Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-1 bg-rose-600 rounded-full text-white cursor-pointer hover:bg-rose-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400">Please upload images showing damage or size labels for faster approvals.</p>
          </div>

          {/* Refund Method selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Refund Destination
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  refundMethod === 'original'
                    ? 'border-orange-500 bg-orange-50/10 text-orange-600 dark:border-orange-500 dark:bg-orange-950/15'
                    : 'border-cream-200 bg-white hover:bg-cream-50 dark:border-navy-700 dark:bg-navy-800'
                }`}
                onClick={() => setRefundMethod('original')}
              >
                <input
                  type="radio"
                  name="refund_method"
                  checked={refundMethod === 'original'}
                  onChange={() => {}}
                  className="accent-orange-500"
                />
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-bold">Original Method</span>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  refundMethod === 'wallet'
                    ? 'border-orange-500 bg-orange-50/10 text-orange-600 dark:border-orange-500 dark:bg-orange-950/15'
                    : 'border-cream-200 bg-white hover:bg-cream-50 dark:border-navy-700 dark:bg-navy-800'
                }`}
                onClick={() => setRefundMethod('wallet')}
              >
                <input
                  type="radio"
                  name="refund_method"
                  checked={refundMethod === 'wallet'}
                  onChange={() => {}}
                  className="accent-orange-500"
                />
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-gray-400" />
                  <div className="text-left">
                    <span className="block text-xs font-bold">Freshnaps Wallet</span>
                    <span className="block text-[8px] text-gray-400 font-bold">(Instant Refund)</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Pickup Address Check */}
          <div className="p-3 bg-cream-50/50 dark:bg-navy-700 border border-cream-200 dark:border-navy-700 rounded-2xl flex items-start gap-2.5">
            <MapPin className="w-4.5 h-4.5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pickup Address Confirmation
              </span>
              <span className="block text-xs text-gray-600 dark:text-gray-300 font-semibold mt-1">
                {order?.shippingAddress?.name} ({order?.shippingAddress?.phone})
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                {order?.shippingAddress?.street}, {order?.shippingAddress?.city}, {order?.shippingAddress?.state} - {order?.shippingAddress?.pincode}
              </span>
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
              className="px-5 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 rounded-xl transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Request Return'}
            </button>
          </div>
          
        </form>

      </div>
    </div>
  );
};

export default ReturnOrderModal;
