import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Calendar, FileText, CheckCircle2, AlertCircle, Phone, Mail, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { fetchOrderDetail, cancelOrder, returnOrder, reorderItems, submitReview } from '../store/slices/orderSlice';
import { addToCart } from '../store/slices/cartSlice';
import { orderService } from '../services';

import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import OrderStatusTimeline from '../components/orders/OrderStatusTimeline';
import OrderActions from '../components/orders/OrderActions';
import TrackingTimeline from '../components/orders/TrackingTimeline';
import CancelOrderModal from '../components/orders/CancelOrderModal';
import ReturnOrderModal from '../components/orders/ReturnOrderModal';
import ReviewModal from '../components/orders/ReviewModal';

const OrderDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentOrder: order, loading, actionLoading, error } = useSelector((state) => state.order);

  // Modal States
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchOrderDetail(id));
  }, [dispatch, id]);

  if (loading && !order) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-3 bg-cream-50/40 dark:bg-navy-900 min-h-screen">
        <RefreshCw className="w-8 h-8 text-gold-500 animate-spin" />
        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Syncing Order details...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4 bg-cream-50/40 dark:bg-navy-900 min-h-screen text-center px-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Failed to load order details</h3>
        <p className="text-xs text-gray-400 max-w-sm">{error || 'Order not found.'}</p>
        <button
          onClick={() => navigate('/orders')}
          className="px-5 py-2.5 text-xs font-bold text-white bg-gold-gradient rounded-xl shadow-gold cursor-pointer"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const orderIdShort = order._id.toString().substring(18).toUpperCase();
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Action Confirmations
  const handleCancelConfirm = async ({ reason }) => {
    try {
      toast.loading('Processing cancellation...', { id: 'cancel-toast' });
      const resultAction = await dispatch(cancelOrder({ id: order._id, reason }));
      if (cancelOrder.fulfilled.match(resultAction)) {
        toast.success('Order successfully cancelled!', { id: 'cancel-toast' });
        setIsCancelOpen(false);
        dispatch(fetchOrderDetail(order._id));
      } else {
        toast.error(resultAction.payload || 'Cancellation failed', { id: 'cancel-toast' });
      }
    } catch (err) {
      toast.error('Failed to cancel order.', { id: 'cancel-toast' });
    }
  };

  const handleReturnConfirm = async ({ reason, images, refundMethod }) => {
    try {
      toast.loading('Submitting return request...', { id: 'return-toast' });
      const resultAction = await dispatch(returnOrder({ id: order._id, reason, images }));
      if (returnOrder.fulfilled.match(resultAction)) {
        toast.success('Return request successfully submitted!', { id: 'return-toast' });
        setIsReturnOpen(false);
        dispatch(fetchOrderDetail(order._id));
      } else {
        toast.error(resultAction.payload || 'Return submission failed', { id: 'return-toast' });
      }
    } catch (err) {
      toast.error('Failed to request return.', { id: 'return-toast' });
    }
  };

  const handleReviewConfirm = async ({ productId, rating, comment, images }) => {
    try {
      toast.loading('Submitting product review...', { id: 'review-toast' });
      const resultAction = await dispatch(
        submitReview({ id: order._id, productId, rating, comment })
      );
      if (submitReview.fulfilled.match(resultAction)) {
        toast.success('Review submitted successfully!', { id: 'review-toast' });
        setIsReviewOpen(false);
      } else {
        toast.error(resultAction.payload || 'Review submission failed', { id: 'review-toast' });
      }
    } catch (err) {
      toast.error('Failed to submit review.', { id: 'review-toast' });
    }
  };

  const handleReorder = async () => {
    try {
      toast.loading('Adding previous items to cart...', { id: 'reorder-toast' });
      const resultAction = await dispatch(reorderItems(order._id));
      if (reorderItems.fulfilled.match(resultAction)) {
        const enrichedItems = resultAction.payload;
        for (const item of enrichedItems) {
          dispatch(addToCart({
            product: item.product,
            quantity: item.quantity,
            variant: item.variant,
          }));
        }
        toast.success('All items added to cart! Redirecting...', { id: 'reorder-toast' });
        navigate('/checkout');
      } else {
        toast.error(resultAction.payload || 'Reorder failed', { id: 'reorder-toast' });
      }
    } catch (err) {
      toast.error('Failed to reorder.', { id: 'reorder-toast' });
    }
  };

  const handleInvoiceDownload = async () => {
    try {
      toast.loading('Generating invoice PDF...', { id: 'invoice-down' });
      const response = await orderService.getInvoice(order._id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${order.invoiceNumber || 'FN-invoice'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully!', { id: 'invoice-down' });
    } catch (err) {
      toast.error('Failed to download invoice PDF.', { id: 'invoice-down' });
    }
  };

  return (
    <div className="min-h-screen bg-cream-50/40 dark:bg-navy-900 py-10 px-4 md:px-8 select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Detail Header / Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/orders')}
              className="p-2 hover:bg-cream-100 dark:hover:bg-navy-800 rounded-2xl text-gray-500 hover:text-navy-500 dark:text-gray-300 dark:hover:text-gold-400 transition-all border border-cream-200 dark:border-navy-800 bg-white dark:bg-navy-900 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-extrabold text-navy-500 dark:text-gold-300">
                  Order Details
                </h1>
                <OrderStatusBadge status={order.orderStatus} />
              </div>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">
                Placed on {formattedDate} • ID: <span className="font-mono font-bold">#{orderIdShort}</span>
              </p>
            </div>
          </div>

          {/* Quick context action buttons */}
          <OrderActions
            order={order}
            onCancel={() => setIsCancelOpen(true)}
            onReturn={() => setIsReturnOpen(true)}
            onReview={() => setIsReviewOpen(true)}
            onReorder={handleReorder}
            onInvoiceDownload={handleInvoiceDownload}
            actionLoading={actionLoading}
          />
        </div>

        {/* Outer Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT 2/3 COLUMN: Timeline, Products, Live Tracking */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Status vertical timeline stepper */}
            <div className="bg-white dark:bg-navy-600 rounded-3xl border border-cream-200 dark:border-navy-700/60 p-5 md:p-6 shadow-card transition-all duration-300">
              <h3 className="text-sm font-extrabold text-navy-500 dark:text-gold-300 uppercase tracking-wider mb-5 flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-gold-500" />
                Order Tracking Status
              </h3>
              <OrderStatusTimeline status={order.orderStatus} statusHistory={order.statusHistory} layout="vertical" />
            </div>

            {/* Products cards listing */}
            <div className="bg-white dark:bg-navy-600 rounded-3xl border border-cream-200 dark:border-navy-700/60 p-5 md:p-6 shadow-card transition-all duration-300">
              <h3 className="text-sm font-extrabold text-navy-500 dark:text-gold-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-gold-500" />
                Items Ordered
              </h3>
              <div className="divide-y divide-cream-100 dark:divide-navy-700">
                {(order.orderItems || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-cream-200 dark:border-navy-700">
                      <img
                        src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=200&auto=format&fit=crop"
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                        {item.name}
                      </h4>
                      {item.variant && Object.keys(item.variant).length > 0 && (
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                          {Object.entries(item.variant)
                            .filter(([_, val]) => !!val)
                            .map(([key, val]) => `${key}: ${val}`)
                            .join(', ')}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        INR {item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs md:text-sm font-extrabold text-navy-500 dark:text-gold-400">
                        INR {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live tracking logs */}
            {order.orderStatus !== 'cancelled' && (
              <TrackingTimeline
                tracking={{
                  trackingId: order.trackingId,
                  deliveryPartner: order.deliveryPartner,
                  shipmentProvider: order.shipmentProvider,
                  trackingHistory: order.trackingHistory,
                  estimatedDelivery: order.estimatedDelivery,
                  orderStatus: order.orderStatus,
                }}
              />
            )}

          </div>

          {/* RIGHT 1/3 COLUMN: Summary, Address, Payment Info */}
          <div className="space-y-6">
            
            {/* Order Summary Pricing Table */}
            <div className="bg-white dark:bg-navy-600 rounded-3xl border border-cream-200 dark:border-navy-700/60 p-5 md:p-6 shadow-card transition-all duration-300">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                Price Summary
              </h3>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-gray-600 dark:text-gray-300 font-medium">
                  <span>Subtotal</span>
                  <span>INR {(order.subtotal || 0).toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Discount ({order.couponCode || 'Coupon'})</span>
                    <span>- INR {order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 dark:text-gray-300 font-medium">
                  <span>Shipping Charges</span>
                  <span>INR {(order.shippingCharge || 0).toFixed(2)}</span>
                </div>

                {/* Dynamic taxes breakdown */}
                {order.taxAmount > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-dashed border-cream-200 dark:border-navy-700">
                    <span className="block text-[9px] text-gray-400 uppercase font-bold tracking-wider">GST Breakdown (18%)</span>
                    {order.taxBreakdown?.igst > 0 ? (
                      <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400">
                        <span>IGST (18%)</span>
                        <span>INR {order.taxBreakdown.igst.toFixed(2)}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400">
                          <span>CGST (9%)</span>
                          <span>INR {order.taxBreakdown?.cgst?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400">
                          <span>SGST (9%)</span>
                          <span>INR {order.taxBreakdown?.sgst?.toFixed(2) || '0.00'}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="flex justify-between text-navy-500 dark:text-gold-300 font-extrabold text-sm border-t border-cream-200 dark:border-navy-700 pt-3 mt-1">
                  <span>Grand Total</span>
                  <span>INR {(order.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Billing & Shipping Address Cards */}
            <div className="bg-white dark:bg-navy-600 rounded-3xl border border-cream-200 dark:border-navy-700/60 p-5 md:p-6 shadow-card space-y-4 transition-all duration-300">
              <div>
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  Delivery Address
                </h4>
                <div className="text-xs text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
                  <span className="block font-bold text-gray-800 dark:text-gray-100">{order.shippingAddress?.name}</span>
                  <span className="block text-gray-400">{order.shippingAddress?.phone}</span>
                  <span className="block font-normal mt-0.5">
                    {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                  </span>
                </div>
              </div>

              {order.billingAddress && (
                <div className="border-t border-cream-100 dark:border-navy-700 pt-4">
                  <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                    Billing Address
                  </h4>
                  <div className="text-xs text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
                    <span className="block font-bold text-gray-800 dark:text-gray-100">{order.billingAddress?.name}</span>
                    <span className="block text-gray-400">{order.billingAddress?.phone}</span>
                    <span className="block font-normal mt-0.5">
                      {order.billingAddress?.street}, {order.billingAddress?.city}, {order.billingAddress?.state} - {order.billingAddress?.pincode}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Meta block */}
            <div className="bg-white dark:bg-navy-600 rounded-3xl border border-cream-200 dark:border-navy-700/60 p-5 md:p-6 shadow-card space-y-3 transition-all duration-300">
              <div>
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  Payment Info
                </h4>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="font-semibold text-gray-600 dark:text-gray-300">Method</span>
                  <span className="font-bold text-navy-500 dark:text-gold-300">{order.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="font-semibold text-gray-600 dark:text-gray-300">Status</span>
                  <span className={`font-bold capitalize ${
                    order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-500'
                  }`}>{order.paymentStatus}</span>
                </div>
                {order.transactionId && (
                  <div className="flex items-center justify-between text-[10px] mt-1.5 border-t border-cream-100 dark:border-navy-700 pt-1.5">
                    <span className="font-semibold text-gray-400">Txn ID</span>
                    <span className="font-mono font-bold text-gray-600 dark:text-gray-300 truncate max-w-[130px]">{order.transactionId}</span>
                  </div>
                )}
              </div>

              {order.refundStatus && order.refundStatus !== 'none' && (
                <div className="border-t border-rose-100 dark:border-rose-950/20 pt-3 mt-3 bg-rose-50/20 dark:bg-rose-950/10 p-2.5 rounded-xl">
                  <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                    Refund Processed
                  </h4>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="font-semibold text-gray-500">Refund Status</span>
                    <span className="font-bold text-rose-600 uppercase">{order.refundStatus}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-0.5">
                    <span className="font-semibold text-gray-500">Amount</span>
                    <span className="font-bold text-rose-600">INR {order.refundAmount?.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Corporate support card */}
            <div className="bg-cream-50 dark:bg-navy-700/30 border border-cream-200 dark:border-navy-700/60 rounded-3xl p-5 md:p-6 text-center space-y-4">
              <div className="flex items-center gap-2 justify-center text-gold-600">
                <HelpCircle className="w-5 h-5" />
                <h4 className="text-sm font-extrabold">Freshnaps Sleep Support</h4>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Need help with size fitting, mattress trials, or refund tracking? Get in touch with our experts.
              </p>
              <div className="flex flex-col gap-2.5">
                <a
                  href="tel:+919876543210"
                  className="flex items-center justify-center gap-1.5 py-2 bg-white dark:bg-navy-800 hover:bg-cream-50 dark:hover:bg-navy-700 border border-cream-200 dark:border-navy-700 rounded-xl text-xs font-bold text-navy-500 dark:text-gray-300 transition-all cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Support
                </a>
                <a
                  href="mailto:support@freshnaps.in"
                  className="flex items-center justify-center gap-1.5 py-2 bg-white dark:bg-navy-800 hover:bg-cream-50 dark:hover:bg-navy-700 border border-cream-200 dark:border-navy-700 rounded-xl text-xs font-bold text-navy-500 dark:text-gray-300 transition-all cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email support@freshnaps.in
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Action Modals */}
      <CancelOrderModal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={handleCancelConfirm}
        loading={actionLoading}
      />

      <ReturnOrderModal
        isOpen={isReturnOpen}
        onClose={() => setIsReturnOpen(false)}
        onConfirm={handleReturnConfirm}
        order={order}
        loading={actionLoading}
      />

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onConfirm={handleReviewConfirm}
        order={order}
        loading={actionLoading}
      />

    </div>
  );
};

export default OrderDetailPage;
