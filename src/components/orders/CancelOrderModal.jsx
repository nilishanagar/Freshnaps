import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const CancelOrderModal = ({ isOpen, onClose, onConfirm, loading = false }) => {
  const [reason, setReason] = useState('');
  const [customComment, setCustomComment] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const reasons = [
    'Incorrect shipping address selected',
    'Bought by mistake / Change of mind',
    'Ordered incorrect variant (size/color)',
    'Found a better price elsewhere',
    'Estimated delivery time is too long',
    'Want to choose a different payment method',
    'Other reasons',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a cancellation reason');
      return;
    }
    const finalReason = reason === 'Other reasons' ? customComment || 'Other reasons' : reason;
    onConfirm({ reason: finalReason });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="bg-white dark:bg-surface-700 rounded-3xl w-full max-w-md overflow-hidden shadow-brand-lg border border-surface-200 dark:border-surface-800/60 transition-all duration-300 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-2 text-rose-500">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Cancel Order</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            We are sorry to see you cancel. Cancelling this order will immediately restore inventory stock and halt warehousing operations.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Reason for Cancellation *
            </label>
            <select
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-surface-300 dark:border-surface-800 bg-surface-50/20 dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-gray-700 dark:text-gray-200 transition-all cursor-pointer"
            >
              <option value="" disabled>Select a reason...</option>
              {reasons.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {error && <p className="text-[11px] text-rose-500 font-semibold">{error}</p>}
          </div>

          {reason === 'Other reasons' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Custom Comments *
              </label>
              <textarea
                placeholder="Please describe your reason here..."
                rows={3}
                value={customComment}
                onChange={(e) => setCustomComment(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-surface-300 dark:border-surface-800 bg-surface-50/20 dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-gray-700 dark:text-gray-200 transition-all resize-none placeholder-gray-400"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-200 dark:border-surface-800 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 rounded-xl transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CancelOrderModal;
