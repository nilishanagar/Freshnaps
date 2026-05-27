import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CreditCard, ChevronRight, Eye, RefreshCw, XCircle } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import OrderStatusTimeline from './OrderStatusTimeline';

const OrderCard = ({ order, onCancel, onReorder, onInvoiceDownload, actionLoading = false }) => {
  const items = order?.orderItems || [];
  const status = order?.orderStatus || 'placed';
  const orderIdShort = order?._id?.toString().substring(18).toUpperCase();
  const dateStr = new Date(order?.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const showItemsCount = 2;
  const extraItemsCount = items.length - showItemsCount;

  const handleCancelClick = (e) => {
    e.preventDefault();
    onCancel(order);
  };

  const handleReorderClick = (e) => {
    e.preventDefault();
    onReorder(order);
  };

  const handleInvoiceClick = (e) => {
    e.preventDefault();
    onInvoiceDownload(order);
  };

  return (
    <div className="group bg-white dark:bg-navy-600 rounded-3xl border border-cream-200 dark:border-navy-700/60 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      
      {/* Card Top / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-cream-50/40 dark:bg-navy-700/20 border-b border-cream-200/80 dark:border-navy-700">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
          <div>
            <span className="font-bold">Ordered:</span> <span className="font-semibold text-gray-700 dark:text-gray-300">{dateStr}</span>
          </div>
          <div className="h-3 w-px bg-cream-300 dark:bg-navy-700 hidden sm:block" />
          <div>
            <span className="font-bold">Order ID:</span> <span className="font-mono font-bold text-navy-500 dark:text-gold-300">#{orderIdShort}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={status} />
        </div>
      </div>

      {/* Card Content - Products */}
      <Link to={`/orders/${order?._id}`} className="block px-6 py-5 cursor-pointer">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Left Side: Product Details & Previews */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
              {items.slice(0, showItemsCount).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-cream-50/20 dark:bg-navy-700/30 border border-cream-100 dark:border-navy-700 p-2 rounded-2xl flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-cream-200 dark:border-navy-700">
                    <img
                      src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=200&auto=format&fit=crop"
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate max-w-[130px]" title={item.name}>
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                      Qty: {item.quantity} • INR {item.price}
                    </p>
                  </div>
                </div>
              ))}

              {extraItemsCount > 0 && (
                <div className="w-12 h-12 rounded-xl bg-gold-50 dark:bg-navy-700 border border-gold-200 dark:border-navy-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-extrabold text-gold-600 dark:text-gold-400">
                    +{extraItemsCount}
                  </span>
                </div>
              )}
            </div>

            {/* Sub-preview text */}
            <div className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
              {items.length === 1
                ? items[0].name
                : `${items[0].name} and ${items.length - 1} other item${items.length > 2 ? 's' : ''}`}
            </div>
          </div>

          {/* Right Side: Totals and Est Delivery */}
          <div className="flex flex-row md:flex-col md:items-end justify-between items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-cream-200 dark:border-navy-700">
            <div className="text-left md:text-right">
              <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Grand Total</span>
              <span className="text-base font-extrabold text-navy-500 dark:text-gold-400">
                INR {order?.totalAmount?.toFixed(2)}
              </span>
            </div>

            {order?.estimatedDelivery && status !== 'delivered' && status !== 'cancelled' && status !== 'returned' && status !== 'refunded' && (
              <div className="text-left md:text-right">
                <span className="block text-[9px] text-gray-400 uppercase font-bold tracking-wider">Est. Arrival</span>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  {new Date(order?.estimatedDelivery).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Compact Stepper for Order Cards */}
        {status !== 'cancelled' && status !== 'returned' && status !== 'refunded' && (
          <div className="mt-6 border-t border-cream-100 dark:border-navy-700/40 pt-4 hidden sm:block">
            <OrderStatusTimeline status={status} statusHistory={order?.statusHistory} layout="horizontal" />
          </div>
        )}
      </Link>

      {/* Card Footer / Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-cream-50/20 dark:bg-navy-700/10 border-t border-cream-100 dark:border-navy-700/60">
        <Link
          to={`/orders/${order?._id}`}
          className="flex items-center gap-1.5 text-xs font-bold text-navy-600 hover:text-gold-600 dark:text-gold-400 dark:hover:text-gold-300 transition-all select-none cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          View Full Details
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Quick Quick Actions */}
        <div className="flex items-center gap-2.5">
          {['placed', 'confirmed', 'packed'].includes(status) && (
            <button
              onClick={handleCancelClick}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-800 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel
            </button>
          )}

          {status !== 'cancelled' && (
            <button
              onClick={handleInvoiceClick}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-navy-500 hover:text-white bg-cream-50 hover:bg-gold-500 dark:text-gray-300 dark:bg-navy-700 rounded-xl transition-all cursor-pointer"
            >
              Invoice
            </button>
          )}

          {(status === 'delivered' || status === 'cancelled') && (
            <button
              onClick={handleReorderClick}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-gold-gradient hover:opacity-90 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Buy Again
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default OrderCard;
