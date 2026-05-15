import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, Heart, MapPin, Edit, Trash2 } from 'lucide-react';
import { orderService, userService } from '../services';
import ProductCard from '../components/common/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
];

const statusColors = {
  placed: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-indigo-100 text-indigo-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const ProfilePage = () => {
  const { user } = useSelector(s => s.auth);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (activeTab === 'orders') {
      setLoadingOrders(true);
      orderService.getMyOrders()
        .then(res => setOrders(res.data.orders))
        .catch(() => toast.error('Failed to load orders'))
        .finally(() => setLoadingOrders(false));
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950 py-10">
      <div className="container-custom max-w-5xl">
        {/* Header */}
        <div className="card p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center text-white font-display font-bold text-2xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
            <p className="text-gray-500">{user?.email}</p>
            <span className="badge bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 mt-1 capitalize">{user?.role}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === id ? 'bg-gold-500 text-white shadow-gold' : 'bg-white dark:bg-navy-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile */}
          {activeTab === 'profile' && (
            <div className="card p-6">
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-5">Account Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: 'Full Name', value: user?.name },
                  { label: 'Email', value: user?.email },
                  { label: 'Phone', value: user?.phone || 'Not set' },
                  { label: 'Member Since', value: new Date(user?.createdAt || Date.now()).toLocaleDateString() },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                    <p className="text-gray-900 dark:text-white font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {loadingOrders ? (
                <div className="flex justify-center py-16"><LoadingSpinner size="xl" /></div>
              ) : orders.length === 0 ? (
                <div className="card p-12 text-center">
                  <Package size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No orders yet. Start shopping!</p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order._id} className="card p-5">
                    <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">#{order._id.slice(-8).toUpperCase()}</p>
                        <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <span className={`badge capitalize ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {order.orderItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                          <span className="text-gray-600 dark:text-gray-300 flex-1 line-clamp-1">{item.name} ×{item.quantity}</span>
                          <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-navy-700">
                      <p className="text-sm text-gray-500">Total: <span className="font-bold text-gray-900 dark:text-white">{formatPrice(order.totalAmount)}</span></p>
                      <p className="text-xs text-gray-400">{order.paymentMethod}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Wishlist */}
          {activeTab === 'wishlist' && (
            <div>
              <p className="text-gray-500 text-center py-10">Wishlist coming soon — products you love will appear here.</p>
            </div>
          )}

          {/* Addresses */}
          {activeTab === 'addresses' && (
            <div className="card p-6">
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-5">Saved Addresses</h2>
              {user?.addresses?.length === 0 ? (
                <p className="text-gray-500">No saved addresses yet.</p>
              ) : (
                <div className="grid gap-4">
                  {user?.addresses?.map((addr, i) => (
                    <div key={i} className="p-4 border border-gray-200 dark:border-navy-600 rounded-xl">
                      <p className="font-medium text-gray-900 dark:text-white">{addr.label || `Address ${i + 1}`} {addr.isDefault && <span className="badge bg-gold-100 text-gold-700 ml-2">Default</span>}</p>
                      <p className="text-sm text-gray-500 mt-1">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
