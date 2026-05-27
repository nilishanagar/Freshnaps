import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { fetchOrders, cancelOrder, reorderItems } from '../store/slices/orderSlice';
import { addToCart } from '../store/slices/cartSlice';
import { orderService } from '../services';
import OrderCard from '../components/orders/OrderCard';
import OrderFilters from '../components/orders/OrderFilters';
import CancelOrderModal from '../components/orders/CancelOrderModal';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { orders, loading, actionLoading, error } = useSelector((state) => state.order);

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Fetch orders when activeTab or searchQuery changes
  useEffect(() => {
    const params = {};
    if (activeTab !== 'all') params.status = activeTab;
    if (searchQuery) params.search = searchQuery;
    dispatch(fetchOrders(params));
  }, [dispatch, activeTab, searchQuery]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // 1. Cancellation Flow
  const handleOpenCancelModal = (order) => {
    setSelectedOrderForCancel(order);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async ({ reason }) => {
    if (!selectedOrderForCancel) return;

    try {
      toast.loading('Processing cancellation...', { id: 'cancel-toast' });
      const resultAction = await dispatch(
        cancelOrder({ id: selectedOrderForCancel._id, reason })
      );

      if (cancelOrder.fulfilled.match(resultAction)) {
        toast.success('Order successfully cancelled!', { id: 'cancel-toast' });
        setIsCancelModalOpen(false);
        setSelectedOrderForCancel(null);
        // Refresh orders
        const params = {};
        if (activeTab !== 'all') params.status = activeTab;
        if (searchQuery) params.search = searchQuery;
        dispatch(fetchOrders(params));
      } else {
        toast.error(resultAction.payload || 'Failed to cancel order', { id: 'cancel-toast' });
      }
    } catch (err) {
      toast.error('Cancellation failed. Please try again.', { id: 'cancel-toast' });
    }
  };

  // 2. Reordering Flow
  const handleReorder = async (order) => {
    try {
      toast.loading('Adding previous items to cart...', { id: 'reorder-toast' });
      const resultAction = await dispatch(reorderItems(order._id));

      if (reorderItems.fulfilled.match(resultAction)) {
        const enrichedItems = resultAction.payload;
        
        for (const item of enrichedItems) {
          // Re-populate and enrich for cart slice
          dispatch(
            addToCart({
              product: item.product,
              quantity: item.quantity,
              variant: item.variant,
            })
          );
        }

        toast.success('All items added to cart! Redirecting...', { id: 'reorder-toast' });
        navigate('/checkout');
      } else {
        toast.error(resultAction.payload || 'Failed to reorder items', { id: 'reorder-toast' });
      }
    } catch (err) {
      toast.error('Reorder failed. Please try again.', { id: 'reorder-toast' });
    }
  };

  // 3. Invoice Downloads (Streams Blob)
  const handleInvoiceDownload = async (order) => {
    try {
      toast.loading('Generating invoice PDF...', { id: 'invoice-down' });
      const response = await orderService.getInvoice(order._id);
      
      // Stream blob response
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
      console.error('Invoice download err:', err);
      toast.error('Failed to download invoice PDF.', { id: 'invoice-down' });
    }
  };

  return (
    <div className="min-h-screen bg-cream-50/40 dark:bg-navy-900 py-10 px-4 md:px-8 select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-cream-100 dark:hover:bg-navy-800 rounded-2xl text-gray-500 hover:text-navy-500 dark:text-gray-300 dark:hover:text-gold-400 transition-all border border-cream-200 dark:border-navy-800 bg-white dark:bg-navy-900 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-navy-500 dark:text-gold-300">My Orders</h1>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Track, cancel, return and review your sleep purchases</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <OrderFilters
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onSearch={handleSearch}
          initialSearch={searchQuery}
        />

        {/* Loading State */}
        {loading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="w-8 h-8 text-gold-500 animate-spin" />
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Syncing Orders...</span>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-6 rounded-3xl text-center max-w-md mx-auto space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Sync Failed</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{error}</p>
            <button
              onClick={() => dispatch(fetchOrders())}
              className="mt-2 px-4 py-2 text-xs font-bold text-white bg-gold-gradient rounded-xl cursor-pointer"
            >
              Retry Sync
            </button>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-navy-600 rounded-3xl border border-cream-200 dark:border-navy-700/60 p-12 text-center shadow-card max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-cream-50 dark:bg-navy-700 flex items-center justify-center mx-auto border border-cream-200 dark:border-navy-600 text-gold-500">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">No Orders Found</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                {searchQuery || activeTab !== 'all'
                  ? 'We couldn\'t find any orders matching your criteria.'
                  : 'You haven\'t placed any sleep orders with Freshnaps yet!'}
              </p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gold-gradient rounded-xl shadow-gold cursor-pointer"
            >
              Explore Products
            </button>
          </div>
        ) : (
          /* Orders Grid */
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onCancel={handleOpenCancelModal}
                onReorder={handleReorder}
                onInvoiceDownload={handleInvoiceDownload}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}

      </div>

      {/* Cancel Confirmation Modal */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        loading={actionLoading}
      />
      
    </div>
  );
};

export default OrdersPage;
