import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import { ChevronDown } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const formatPrice = (p) => `₹${(p || 0).toLocaleString('en-IN')}`;

const ORDER_STATUSES = ['placed','confirmed','processing','shipped','delivered','cancelled'];
const statusColors = {
  placed: 'bg-blue-100 text-blue-700', confirmed: 'bg-indigo-100 text-indigo-700',
  processing: 'bg-yellow-100 text-yellow-700', shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    setLoading(true);
    adminService.getOrders().then(res => setOrders(res.data.orders)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, orderStatus) => {
    try {
      await adminService.updateOrderStatus(id, { orderStatus });
      toast.success('Status updated');
      load();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <p className="text-gray-500">{orders.length} total orders</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="xl" /></div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order._id} className="bg-white dark:bg-navy-800 rounded-2xl shadow-card overflow-hidden">
              {/* Header row */}
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-navy-700/50 transition-colors"
                onClick={() => setExpanded(expanded === order._id ? null : order._id)}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="font-mono text-gold-600 font-medium">#{order._id.slice(-8).toUpperCase()}</span>
                  <span className="text-sm text-gray-500">{order.user?.name} • {order.user?.email}</span>
                  <span className={`badge capitalize ${statusColors[order.orderStatus]}`}>{order.orderStatus}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-900 dark:text-white">{formatPrice(order.totalAmount)}</span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${expanded === order._id ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Expanded details */}
              {expanded === order._id && (
                <div className="border-t border-gray-100 dark:border-navy-700 p-5 space-y-4">
                  {/* Items */}
                  <div className="space-y-2">
                    {order.orderItems.map((item, i) => (
                      <div key={i} className="flex gap-3 items-center text-sm">
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                        <span className="text-gray-700 dark:text-gray-300 flex-1">{item.name} ×{item.quantity}</span>
                        <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping */}
                  {order.shippingAddress && (
                    <div className="text-sm text-gray-500 p-3 bg-gray-50 dark:bg-navy-700 rounded-xl">
                      <strong className="text-gray-700 dark:text-gray-300">Ship to:</strong>{' '}
                      {order.shippingAddress.name}, {order.shippingAddress.phone} — {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                    </div>
                  )}

                  {/* Update status */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Update Status:</span>
                    <div className="flex gap-2 flex-wrap">
                      {ORDER_STATUSES.map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(order._id, s)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                            order.orderStatus === s ? 'bg-gold-500 text-white' : 'bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Ordered: {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</span>
                    <span>Payment: {order.paymentMethod}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
