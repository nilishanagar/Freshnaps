import React from 'react';
import { XOctagon, Download, RefreshCw, Star, MessageSquare, MapPin, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderActions = ({
  order,
  onCancel,
  onReturn,
  onReview,
  onReorder,
  onInvoiceDownload,
  actionLoading = false,
}) => {
  const status = order?.orderStatus?.toLowerCase() || 'placed';
  const returnStatus = order?.returnStatus?.toLowerCase() || 'none';

  const cancellable = ['placed', 'confirmed', 'packed'].includes(status);
  const deliverable = status === 'delivered';
  const returnable = deliverable && returnStatus === 'none';

  // Dummy action handlers for complex interactions
  const handleDummyAction = (msg) => {
    toast.success(msg, {
      icon: '✨',
      style: {
        border: '1px solid #C9A96E',
        padding: '16px',
        color: '#1A1A2E',
        background: '#FFFDFB',
      },
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* 1. Cancellation Flow */}
      {cancellable && (
        <button
          onClick={onCancel}
          disabled={actionLoading}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-800 rounded-xl border border-rose-100 dark:border-rose-900/40 transition-all duration-300 shadow-sm cursor-pointer disabled:opacity-50"
        >
          <XOctagon className="w-3.5 h-3.5" />
          Cancel Order
        </button>
      )}

      {/* 2. Address Modification (Placeholder) */}
      {cancellable && (
        <button
          onClick={() => handleDummyAction('Address updated successfully in shipment details.')}
          disabled={actionLoading}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-navy-500 hover:text-white bg-cream-50 hover:bg-navy-500 dark:text-gray-300 dark:bg-navy-700 dark:hover:bg-navy-800 rounded-xl border border-cream-200 dark:border-navy-700 transition-all duration-300 shadow-sm cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5" />
          Change Address
        </button>
      )}

      {/* 3. Payment Method Change (Placeholder) */}
      {cancellable && order.paymentMethod === 'COD' && (
        <button
          onClick={() => handleDummyAction('Payment method converted to Pre-paid. Razorpay initiated.')}
          disabled={actionLoading}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-navy-500 hover:text-white bg-cream-50 hover:bg-navy-500 dark:text-gray-300 dark:bg-navy-700 dark:hover:bg-navy-800 rounded-xl border border-cream-200 dark:border-navy-700 transition-all duration-300 shadow-sm cursor-pointer"
        >
          <CreditCard className="w-3.5 h-3.5" />
          Pay Online
        </button>
      )}

      {/* 4. Invoice Downloading */}
      {status !== 'cancelled' && (
        <button
          onClick={onInvoiceDownload}
          disabled={actionLoading}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-navy-600 dark:text-gray-200 hover:text-white bg-cream-100 hover:bg-gold-500 dark:bg-navy-700 dark:hover:bg-gold-500/80 rounded-xl border border-cream-200/80 dark:border-navy-600 transition-all duration-300 shadow-sm cursor-pointer disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          Download Invoice
        </button>
      )}

      {/* 5. Product Return Flow */}
      {returnable && (
        <button
          onClick={onReturn}
          disabled={actionLoading}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-orange-600 hover:text-white bg-orange-50 hover:bg-orange-500 dark:bg-orange-950/20 dark:hover:bg-orange-800 rounded-xl border border-orange-100 dark:border-orange-900/40 transition-all duration-300 shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
          Return / Replace
        </button>
      )}

      {/* 6. Product Reordering */}
      {(deliverable || status === 'cancelled') && (
        <button
          onClick={onReorder}
          disabled={actionLoading}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gold-gradient hover:opacity-90 rounded-xl transition-all duration-300 shadow-gold cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Buy Again
        </button>
      )}

      {/* 7. Rating & Reviewing */}
      {deliverable && (
        <button
          onClick={onReview}
          disabled={actionLoading}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-amber-600 hover:text-white bg-amber-50 hover:bg-amber-500 dark:bg-amber-950/20 dark:hover:bg-amber-800 rounded-xl border border-amber-100 dark:border-amber-900/40 transition-all duration-300 shadow-sm cursor-pointer"
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          Rate & Review
        </button>
      )}

      {/* 8. Help / Support Section */}
      <a
        href={`mailto:support@freshnaps.in?subject=Support Request for Order #${order?._id}`}
        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-500 hover:text-navy-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gold-300 dark:hover:bg-navy-700/60 rounded-xl border border-gray-100 dark:border-navy-700 transition-all duration-300 shadow-sm"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        Need Help?
      </a>
    </div>
  );
};

export default OrderActions;
