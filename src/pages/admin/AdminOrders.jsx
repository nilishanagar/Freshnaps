import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import {
  Search,
  ChevronDown,
  Eye,
  X,
  Printer,
  Download,
  Calendar,
  CreditCard,
  User,
  MapPin,
  Truck,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Clock,
  ArrowRight,
  Package,
  Save,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const formatPrice = (p) => `₹${(p || 0).toLocaleString('en-IN')}`;

const statusColors = {
  placed: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200',
  confirmed: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border border-indigo-200',
  packed: 'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400 border border-pink-200',
  shipped: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-200',
  out_for_delivery: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200',
  delivered: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200',
  cancelled: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200',
  returned: 'bg-gray-100 text-gray-700 dark:bg-surface-950 dark:text-gray-400 border border-gray-200',
  refunded: 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400 border border-teal-200',
};

const ORDER_STATUS_STEPS = [
  'placed',
  'confirmed',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered'
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Tracking update state
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);
  const [trackingIdInput, setTrackingIdInput] = useState('');
  const [deliveryPartnerInput, setDeliveryPartnerInput] = useState('');
  const [trackingLocation, setTrackingLocation] = useState('');
  const [trackingDescription, setTrackingDescription] = useState('');

  const load = () => {
    setLoading(true);
    adminService
      .getOrders()
      .then((res) => {
        setOrders(res.data.orders || []);
      })
      .catch(() => {
        toast.error('Failed to load orders');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminService.updateOrderStatus(id, { orderStatus: status });
      toast.success(`Order status updated to ${status}`);
      // Refresh current open order view
      const updatedRes = await adminService.getOrders();
      setOrders(updatedRes.data.orders || []);
      const matched = updatedRes.data.orders.find((o) => o._id === id);
      if (matched) setSelectedOrder(matched);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleAddTrackingEvent = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsUpdatingTracking(true);

    try {
      const payload = {
        trackingId: trackingIdInput || undefined,
        deliveryPartner: deliveryPartnerInput || undefined,
      };

      if (trackingDescription.trim()) {
        payload.trackingEvent = {
          status: selectedOrder.orderStatus,
          location: trackingLocation.trim() || undefined,
          description: trackingDescription.trim(),
        };
      }

      await adminService.updateOrderStatus(selectedOrder._id, payload);
      toast.success('Logistics and tracking updated successfully');
      
      setTrackingLocation('');
      setTrackingDescription('');
      
      const updatedRes = await adminService.getOrders();
      setOrders(updatedRes.data.orders || []);
      const matched = updatedRes.data.orders.find((o) => o._id === selectedOrder._id);
      if (matched) {
        setSelectedOrder(matched);
        setTrackingIdInput(matched.trackingId || '');
        setDeliveryPartnerInput(matched.deliveryPartner || '');
      }
    } catch {
      toast.error('Failed to update logistics tracking');
    } finally {
      setIsUpdatingTracking(false);
    }
  };

  // Calculations for summary stats cards
  const totalSales = orders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingShipments = orders.filter((o) =>
    ['placed', 'confirmed', 'packed'].includes(o.orderStatus)
  ).length;

  const deliveredCount = orders.filter((o) => o.orderStatus === 'delivered').length;
  const avgOrderValue = orders.length > 0 ? totalSales / orders.length : 0;

  // Filter & Search logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return ['placed', 'confirmed', 'packed'].includes(order.orderStatus);
    if (activeTab === 'shipped') return order.orderStatus === 'shipped';
    if (activeTab === 'delivered') return order.orderStatus === 'delivered';
    if (activeTab === 'cancelled') return order.orderStatus === 'cancelled';
    return true;
  });

  const getStepIndex = (status) => ORDER_STATUS_STEPS.indexOf(status);

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Orders Manager</h1>
          <p className="text-gray-500 mt-0.5">Fulfill shipments, generate invoices and track timelines</p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sales */}
        <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-gray-100 dark:border-surface-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <DollarSign className="text-green-600 dark:text-green-400" size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Total Sales</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{formatPrice(totalSales)}</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-gray-100 dark:border-surface-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Total Orders</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{orders.length}</span>
          </div>
        </div>

        {/* Pending Shipments */}
        <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-gray-100 dark:border-surface-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="text-amber-600 dark:text-amber-400" size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Pending Shipment</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{pendingShipments}</span>
          </div>
        </div>

        {/* Average value */}
        <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-gray-100 dark:border-surface-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="text-indigo-600 dark:text-indigo-400" size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Avg Order Value</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{formatPrice(avgOrderValue)}</span>
          </div>
        </div>
      </div>

      {/* Main Table Controls Container */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 shadow-card overflow-hidden">
        {/* Tabs & Search */}
        <div className="p-6 border-b border-gray-100 dark:border-surface-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Filtering Tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'pending', label: 'Pending Fulfill' },
              { id: 'shipped', label: 'Shipped' },
              { id: 'delivered', label: 'Delivered' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-50 dark:bg-surface-950 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search Order ID, name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>

        {/* Listing Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="xl" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No matching orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-50 dark:bg-surface-950 text-xs font-semibold text-gray-400 uppercase">
                <tr className="border-b border-gray-100 dark:border-surface-800">
                  <th className="p-4 font-semibold">Order ID</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Payment</th>
                  <th className="p-4 font-semibold">Total Amount</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-surface-800">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-xs font-bold text-primary-600 uppercase">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4 text-xs font-medium text-gray-800 dark:text-white">
                      <div>{order.shippingAddress?.name || order.user?.name || 'Guest'}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{order.user?.email}</div>
                    </td>
                    <td className="p-4 text-xs">
                      <div className="font-semibold text-gray-700 dark:text-gray-300">
                        {order.paymentMethod}
                      </div>
                      <div
                        className={`text-[10px] font-medium capitalize mt-0.5 ${
                          order.paymentStatus === 'paid' ? 'text-green-500 font-bold' : 'text-amber-500'
                        }`}
                      >
                        {order.paymentStatus}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-800'}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setTrackingIdInput(order.trackingId || '');
                          setDeliveryPartnerInput(order.deliveryPartner || '');
                        }}
                        className="p-2 hover:bg-primary-50 dark:hover:bg-surface-800 text-gray-500 hover:text-primary-500 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ml-auto border border-gray-100 dark:border-surface-800 shadow-sm"
                      >
                        <Eye size={14} /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Comprehensive Order Details Side Modal/Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-0 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-2xl h-full bg-white dark:bg-surface-900 shadow-2xl flex flex-col border-l border-gray-100 dark:border-surface-800 animate-slide-in">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-surface-800 flex items-center justify-between bg-gray-50 dark:bg-surface-950">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-primary-600 uppercase">
                    Order #{selectedOrder._id.slice(-8).toUpperCase()}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[selectedOrder.orderStatus]}`}>
                    {selectedOrder.orderStatus}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <div className="flex items-center gap-2">
                {/* PDF invoice download link */}
                {selectedOrder.invoiceUrl && (
                  <a
                    href={`http://localhost:5000/api/orders/${selectedOrder._id}/invoice`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 border border-gray-200 dark:border-surface-800 hover:bg-primary-50 dark:hover:bg-surface-800 text-gray-600 dark:text-gray-300 hover:text-primary-500 rounded-xl shadow-sm transition-all flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Download size={14} /> Invoice PDF
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-150 dark:hover:bg-surface-800 rounded-xl transition-all cursor-pointer text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable details area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Order Status Timeline Tracker */}
              <div className="bg-gray-50 dark:bg-surface-950/50 border border-gray-100 dark:border-surface-800 rounded-2xl p-6">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-4">Fulfillment Status Timeline</span>
                <div className="flex items-center justify-between relative">
                  {/* Timeline bar */}
                  <div className="absolute top-[18px] left-[5%] right-[5%] h-1 bg-gray-200 dark:bg-surface-800 z-0" />
                  <div
                    className="absolute top-[18px] left-[5%] h-1 bg-primary-500 z-0 transition-all duration-300"
                    style={{
                      width: `${
                        getStepIndex(selectedOrder.orderStatus) !== -1
                          ? (getStepIndex(selectedOrder.orderStatus) / (ORDER_STATUS_STEPS.length - 1)) * 90
                          : 0
                      }%`,
                    }}
                  />
                  
                  {ORDER_STATUS_STEPS.map((step, idx) => {
                    const isDone = getStepIndex(selectedOrder.orderStatus) >= idx;
                    return (
                      <div key={step} className="flex flex-col items-center z-10">
                        <div
                          onClick={() => {
                            if (selectedOrder.orderStatus !== 'cancelled') {
                              handleUpdateStatus(selectedOrder._id, step);
                            }
                          }}
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 cursor-pointer transition-all ${
                            isDone
                              ? 'bg-primary-500 border-primary-400 text-white'
                              : 'bg-white dark:bg-surface-900 border-gray-200 dark:border-surface-800 text-gray-400'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <span className="text-[10px] font-semibold capitalize text-gray-500 mt-2 tracking-wide">
                          {step.replace(/_/g, ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Update Quick Buttons (Cancelled/Returned) */}
              <div className="flex gap-2 flex-wrap">
                {selectedOrder.orderStatus !== 'cancelled' && selectedOrder.orderStatus !== 'delivered' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder._id, 'cancelled')}
                    className="px-3.5 py-1.5 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                  >
                    Cancel Order
                  </button>
                )}
                {selectedOrder.orderStatus === 'delivered' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder._id, 'returned')}
                    className="px-3.5 py-1.5 border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:hover:bg-surface-950 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                  >
                    Mark Returned
                  </button>
                )}
              </div>

              {/* Items Breakdown Table */}
              <div className="border border-gray-100 dark:border-surface-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 dark:bg-surface-950 p-4 font-semibold text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-surface-800">
                  Cart Items & Purchased Options
                </div>
                <div className="divide-y divide-gray-100 dark:divide-surface-800">
                  {selectedOrder.orderItems.map((item, idx) => (
                    <div key={idx} className="p-4 flex gap-4 items-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-100 bg-gray-50 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white block line-clamp-1">
                          {item.name}
                        </span>
                        {item.variant && (item.variant.size || item.variant.color) && (
                          <div className="flex gap-2 text-[10px] text-primary-600 mt-1">
                            {item.variant.size && (
                              <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-500/10 rounded">
                                Size: {item.variant.size}
                              </span>
                            )}
                            {item.variant.color && (
                              <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-500/10 rounded">
                                Color: {item.variant.color}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-gray-400 block">
                          {item.quantity} × {formatPrice(item.price)}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white block mt-0.5">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid block for Customer Addresses & Payments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping info */}
                <div className="border border-gray-100 dark:border-surface-800 rounded-2xl p-5 space-y-3 shadow-sm">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                    <MapPin size={14} className="text-primary-500" /> Shipping Destination
                  </span>
                  <div className="text-sm font-semibold text-gray-800 dark:text-white">
                    {selectedOrder.shippingAddress?.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {selectedOrder.shippingAddress?.street}, <br />
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                  </div>
                  <div className="text-xs font-mono text-gray-600 dark:text-gray-300">
                    Phone: {selectedOrder.shippingAddress?.phone}
                  </div>
                </div>

                {/* Billing & Payment */}
                <div className="border border-gray-100 dark:border-surface-800 rounded-2xl p-5 space-y-3 shadow-sm">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                    <CreditCard size={14} className="text-primary-500" /> Payment & Billing
                  </span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Method</span>
                    <span className="font-semibold text-gray-800 dark:text-white">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Status</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedOrder.paymentStatus === 'paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 dark:border-surface-800 pt-2 flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Reserved stock</span>
                    <span className="font-semibold text-gray-800 dark:text-white">Fulfillment ready</span>
                  </div>
                </div>
              </div>

              {/* Order Logistics Tracking Editor Form */}
              <form onSubmit={handleAddTrackingEvent} className="border border-dashed border-gray-200 dark:border-surface-800 rounded-2xl p-5 space-y-4 bg-gray-50/50 dark:bg-surface-950/50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                  <Truck size={14} className="text-primary-500" /> Logistics Courier & Shipment Updates
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                      Tracking ID / AWB Number
                    </label>
                    <input
                      type="text"
                      value={trackingIdInput}
                      onChange={(e) => setTrackingIdInput(e.target.value)}
                      className="input w-full py-1.5 text-xs font-mono uppercase"
                      placeholder="e.g. AWB12345678"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                      Courier / Delivery Partner
                    </label>
                    <input
                      type="text"
                      value={deliveryPartnerInput}
                      onChange={(e) => setDeliveryPartnerInput(e.target.value)}
                      className="input w-full py-1.5 text-xs"
                      placeholder="e.g. Delhivery, Blue Dart"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-surface-800 pt-3 space-y-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Add Real-time Tracking Event</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="md:col-span-1">
                      <input
                        type="text"
                        value={trackingLocation}
                        onChange={(e) => setTrackingLocation(e.target.value)}
                        className="input w-full py-1.5 text-xs"
                        placeholder="Current Location (e.g. Mumbai)"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={trackingDescription}
                        onChange={(e) => setTrackingDescription(e.target.value)}
                        className="input w-full py-1.5 text-xs"
                        placeholder="Status Description (e.g. Package arrived at local hub)"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingTracking}
                  className="btn-primary w-full py-2 flex items-center justify-center gap-1.5 text-xs font-semibold"
                >
                  <Save className="w-3.5 h-3.5" /> Save Logistics & Dispatch details
                </button>
              </form>

              {/* Tracking Event Timeline History */}
              {selectedOrder.trackingHistory && selectedOrder.trackingHistory.length > 0 && (
                <div className="space-y-3 border-t border-gray-100 dark:border-surface-800 pt-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Shipment Location Log History</span>
                  <div className="space-y-3 relative pl-4 border-l-2 border-primary-300">
                    {selectedOrder.trackingHistory.map((event, idx) => (
                      <div key={idx} className="relative text-xs">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary-500 border border-white" />
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-semibold text-gray-800 dark:text-white capitalize mr-2">
                              {event.status}
                            </span>
                            {event.location && (
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-surface-950 rounded font-semibold text-[10px]">
                                {event.location}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {new Date(event.timestamp).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{event.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky summary footer */}
            <div className="p-6 border-t border-gray-100 dark:border-surface-800 bg-gray-50 dark:bg-surface-950 grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-[10px] font-semibold text-gray-400 block uppercase">Subtotal</span>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 block mt-0.5">
                  {formatPrice(selectedOrder.subtotal)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-400 block uppercase">GST Inclusive</span>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 block mt-0.5">
                  {formatPrice(selectedOrder.taxAmount)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-400 block uppercase">Total Amount</span>
                <span className="text-sm font-extrabold text-primary-600 block mt-0.5">
                  {formatPrice(selectedOrder.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
