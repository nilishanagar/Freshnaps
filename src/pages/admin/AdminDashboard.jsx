import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Users, IndianRupee, Clock, TrendingUp, ArrowUpRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { adminService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const formatPrice = (p) => `₹${(p || 0).toLocaleString('en-IN')}`;

const statusConfig = {
  placed:     { cls: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',    dot: 'bg-blue-500' },
  confirmed:  { cls: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400', dot: 'bg-indigo-500' },
  processing: { cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',  dot: 'bg-amber-500' },
  shipped:    { cls: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400', dot: 'bg-purple-500' },
  delivered:  { cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400', dot: 'bg-emerald-500' },
  cancelled:  { cls: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',    dot: 'bg-red-500' },
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats()
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="xl" />
    </div>
  );

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];

  const statCards = [
    {
      label: 'Total Products',
      value: stats.totalProducts ?? '—',
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      change: '+12%',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders ?? '—',
      icon: ShoppingBag,
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      change: '+8%',
    },
    {
      label: 'Customers',
      value: stats.totalUsers ?? '—',
      icon: Users,
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      change: '+23%',
    },
    {
      label: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: IndianRupee,
      gradient: 'from-gold-500 to-gold-600',
      bg: 'bg-gold-50 dark:bg-gold-900/20',
      text: 'text-gold-600 dark:text-gold-400',
      change: '+18%',
    },
  ];

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-50 dark:bg-navy-950">

      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Live</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map(({ label, value, icon: Icon, gradient, bg, text, change }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-navy-800 rounded-2xl shadow-card p-6 group hover:shadow-card-hover transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={20} className={text} />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={12} />
                {change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white dark:bg-navy-800 rounded-2xl shadow-card overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 dark:border-navy-700 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock size={17} className="text-gold-500" />
            Recent Orders
          </h2>
          <span className="text-xs text-gray-400 bg-gray-50 dark:bg-navy-700 px-3 py-1 rounded-full">
            Last {recentOrders.length} orders
          </span>
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ShoppingBag size={40} className="mb-3 opacity-30" />
            <p className="text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-navy-700/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Order ID</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-navy-700">
                {recentOrders.map((order, i) => {
                  const cfg = statusConfig[order.orderStatus] || { cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
                  return (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-navy-700/40 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-sm font-semibold text-gold-600 dark:text-gold-400">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {order.user?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${cfg.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
