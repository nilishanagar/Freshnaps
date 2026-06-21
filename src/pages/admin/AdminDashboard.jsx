import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, ShoppingBag, Users, IndianRupee, Clock, TrendingUp, 
  ArrowUpRight, CheckCircle2, XCircle, AlertCircle, BellRing, Sparkles 
} from 'lucide-react';
import { adminService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const formatPrice = (p) => `₹${(p || 0).toLocaleString('en-IN')}`;

const statusConfig = {
  placed:     { cls: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',    dot: 'bg-blue-500' },
  confirmed:  { cls: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400', dot: 'bg-indigo-500' },
  processing: { cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',  dot: 'bg-amber-500' },
  shipped:    { cls: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400', dot: 'bg-purple-500' },
  delivered:  { cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400', dot: 'bg-emerald-500' },
  cancelled:  { cls: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',    dot: 'bg-red-500' },
};

/**
 * Synthesizes a warm double-beep eCommerce alert chime programmatically
 * using the HTML5 Web Audio API. Requires no external mp3 assets.
 */
const playChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const audioCtx = new AudioContext();
    
    // First Chime: C5 Tone
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    gain1.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
    
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.35);

    // Second Chime: E5 (played 120ms later)
    setTimeout(() => {
      if (audioCtx.state === 'closed') return;
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      gain2.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
      
      osc2.start(audioCtx.currentTime);
      osc2.stop(audioCtx.currentTime + 0.45);
    }, 120);
  } catch (err) {
    console.warn('Audio chime context autoplay blocked:', err.message);
  }
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [sseConnected, setSseConnected] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Close notification dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  // Fetch initial analytical dashboard stats
  const fetchDashboardStats = () => {
    adminService.getStats()
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardStats();

    // Establish SSE connection for real-time admin notifications
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('freshnaps_token');
    const sseUrl = `${apiBase}/admin/sse?token=${encodeURIComponent(token || '')}`;
    
    const eventSource = new EventSource(sseUrl, { withCredentials: true });

    // Connection opened
    eventSource.addEventListener('connected', () => {
      setSseConnected(true);
      console.log('[SSE] Connected to Admin Notification channel.');
    });

    // Heartbeat keep-alive
    eventSource.addEventListener('heartbeat', () => {
      // Connection is alive — no action needed
    });

    // Real-time Event 1: New order payment completion
    eventSource.addEventListener('new_order', (e) => {
      const orderAlert = JSON.parse(e.data);
      playChime();
      
      const alertId = Date.now();
      const newAlert = {
        id: alertId,
        type: 'order',
        title: 'New Paid Order Received!',
        desc: `${orderAlert.name} purchased bedding. Total: ${formatPrice(orderAlert.amount)}`,
        invoice: orderAlert.invoiceNumber
      };

      setLiveAlerts(prev => [newAlert, ...prev].slice(0, 4));

      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-bold flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-primary-500 animate-pulse" /> Real-time Payment Success!</span>
          <span className="text-[11px] text-gray-300">Order #{orderAlert.invoiceNumber} paid by {orderAlert.name}. Amount: {formatPrice(orderAlert.amount)}</span>
        </div>,
        {
          duration: 10000,
          position: 'top-right',
          style: {
            background: '#0B1220',
            color: '#ffffff',
            border: '1px solid #7ED957',
            padding: '12px',
            borderRadius: '16px'
          }
        }
      );

      // Instantly refresh dashboard
      fetchDashboardStats();
    });

    // Real-time Event 2: Variant stock warnings
    eventSource.addEventListener('low_stock', (e) => {
      const stockAlert = JSON.parse(e.data);
      playChime();

      const alertId = Date.now();
      const newAlert = {
        id: alertId,
        type: 'warning',
        title: 'Low Stock Alert!',
        desc: `Product ${stockAlert.name} (SKU: ${stockAlert.sku || 'N/A'}) has only ${stockAlert.stock} units remaining.`
      };

      setLiveAlerts(prev => [newAlert, ...prev].slice(0, 4));

      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Low Inventory Warn!</span>
          <span className="text-[11px] text-gray-300">{stockAlert.name} stock level hit {stockAlert.stock} threshold.</span>
        </div>,
        { duration: 8000, position: 'top-right' }
      );
    });

    // Handle connection errors — EventSource auto-reconnects
    eventSource.onerror = () => {
      setSseConnected(false);
      console.warn('[SSE] Connection lost. Browser will auto-reconnect...');
    };

    eventSource.onopen = () => {
      setSseConnected(true);
    };

    return () => {
      eventSource.close();
    };
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
      gradient: 'from-primary-500 to-primary-600',
      bg: 'bg-primary-50 dark:bg-primary-900/20',
      text: 'text-primary-600 dark:text-primary-400',
      change: '+18%',
    },
  ];

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-50 dark:bg-surface-950 select-none">

      {/* Page Header banner */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Admin Panel
            <span className="text-xs font-normal text-gray-400 font-mono bg-surface-100/50 dark:bg-surface-900 px-2.5 py-1 rounded-xl">v1.2.0</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Notification Bell + Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2.5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
            aria-label="Notifications"
          >
            <BellRing size={20} className="text-primary-500" />
            {liveAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 animate-bounce shadow-lg">
                {liveAlerts.length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                className="absolute top-full right-0 mt-2.5 w-80 sm:w-96 bg-white dark:bg-surface-950 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-800 overflow-hidden z-50"
              >
                {/* Dropdown Header */}
                <div className="px-5 py-3.5 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between bg-gradient-to-r from-surface-50/80 to-white dark:from-surface-950 dark:to-surface-900">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BellRing size={15} className="text-primary-500" />
                    Notifications
                  </h3>
                  {liveAlerts.length > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setLiveAlerts([]); }}
                      className="text-[10px] font-bold text-primary-500 hover:text-primary-600 transition-colors ml-1"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-[360px] overflow-y-auto">
                  {liveAlerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-center px-6">
                      <div className="w-14 h-14 rounded-full bg-surface-100 dark:bg-surface-900 flex items-center justify-center mb-3">
                        <BellRing size={24} className="opacity-30" />
                      </div>
                      <p className="text-xs font-bold opacity-60">No notifications yet</p>
                      <p className="text-[10px] mt-1 opacity-40 leading-relaxed">Real-time order and stock alerts will appear here.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-surface-100 dark:divide-surface-800">
                      {liveAlerts.map((alert, i) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={`px-5 py-3.5 hover:bg-surface-50/60 dark:hover:bg-surface-900/50 transition-colors cursor-default ${
                            i === 0 ? 'bg-primary-50/30 dark:bg-primary-950/10' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              alert.type === 'warning'
                                ? 'bg-rose-100 dark:bg-rose-950/30'
                                : 'bg-emerald-100 dark:bg-emerald-950/30'
                            }`}>
                              <span className="text-base">{alert.type === 'warning' ? '⚠️' : '🎉'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                                {alert.title}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                                {alert.desc}
                              </p>
                              {alert.invoice && (
                                <span className="inline-block mt-1.5 text-[10px] font-mono font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/20 px-2 py-0.5 rounded-md">
                                  #{alert.invoice}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map(({ label, value, icon: Icon, bg, text, change }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-900/80 p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
                <Icon size={22} className={text} />
              </div>
              <span className="flex items-center gap-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg">
                <TrendingUp size={12} />
                {change}
              </span>
            </div>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1 tracking-tight">{value}</p>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-450 uppercase tracking-wider">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-900/80 shadow-card overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock size={17} className="text-primary-500" />
            Recent Orders
          </h2>
          <span className="text-xs font-bold text-gray-400 bg-surface-50 dark:bg-surface-800 px-3 py-1 rounded-full">
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
                <tr className="bg-surface-50/20 dark:bg-surface-800">
                  <th className="text-left px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-gray-400">Order ID</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-gray-400">Customer</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-gray-400">Amount</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {recentOrders.map((order, i) => {
                  const cfg = statusConfig[order.orderStatus] || { cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
                  return (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="hover:bg-surface-50/10 dark:hover:bg-surface-800/40 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-extrabold text-primary-600 dark:text-primary-400">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300">
                        {order.user?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-xs font-extrabold text-gray-900 dark:text-white">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${cfg.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400 font-semibold">
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
