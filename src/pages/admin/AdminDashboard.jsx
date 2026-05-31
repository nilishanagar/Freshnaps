import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, ShoppingBag, Users, IndianRupee, Clock, TrendingUp, 
  ArrowUpRight, CheckCircle2, XCircle, AlertCircle, BellRing, Sparkles 
} from 'lucide-react';
import { adminService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

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
  const [socketConnected, setSocketConnected] = useState(false);

  // Fetch initial analytical dashboard stats
  const fetchDashboardStats = () => {
    adminService.getStats()
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardStats();

    // Establish WebSocket connection
    const socketUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:5000';

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('register_admin');
      console.log('[SOCKET] Connected to Admin Notification channel.');
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    // Real-time Event 1: New order webhook completion
    socket.on('new_order', (orderAlert) => {
      playChime();
      
      // Floating alert display
      const alertId = Date.now();
      const newAlert = {
        id: alertId,
        type: 'order',
        title: 'New Paid Order Recieved!',
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
    socket.on('low_stock', (stockAlert) => {
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
          <span className="text-[11px] text-gray-300">{stockAlert.name} stock level hit ${stockAlert.stock} threshold.</span>
        </div>,
        { duration: 8000, position: 'top-right' }
      );
    });

    return () => {
      socket.disconnect();
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

        {/* Live Socket Monitor status */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-950 border border-surface-200 dark:border-surface-900 rounded-2xl shadow-sm w-fit">
          <span className={`w-2.5 h-2.5 rounded-full ${socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-xs font-bold text-surface-600 dark:text-gray-300">
            {socketConnected ? 'WebSocket Channel Active' : 'Disconnected (Offline)'}
          </span>
        </div>
      </div>

      {/* Outer Grid for Stats and Real-time Activity feed */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
        
        {/* Main Stats Block */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

        </div>

        {/* Live Real-time Activity Ticker */}
        <div className="xl:col-span-4">
          <div className="bg-white dark:bg-surface-950 rounded-3xl border border-surface-200 dark:border-surface-900 shadow-card p-5 h-full space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 border-b border-surface-100 dark:border-surface-900 pb-3">
              <BellRing size={16} className="text-primary-500 animate-swing" />
              Live Order Alerts
            </h3>
            
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {liveAlerts.map(alert => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-3 rounded-2xl border text-xs ${
                      alert.type === 'warning'
                        ? 'bg-rose-50/50 border-rose-200 text-rose-800 dark:bg-rose-950/10 dark:border-rose-900/30 dark:text-rose-300'
                        : 'bg-green-50/50 border-green-200 text-green-800 dark:bg-green-950/10 dark:border-green-900/30 dark:text-green-300'
                    }`}
                  >
                    <p className="font-extrabold flex items-center gap-1">
                      {alert.type === 'warning' ? '⚠️' : '🎉'} {alert.title}
                    </p>
                    <p className="text-[10px] opacity-80 mt-1 font-semibold leading-relaxed">{alert.desc}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
              {liveAlerts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-center">
                  <Clock size={28} className="mb-2 opacity-30 animate-pulse" />
                  <p className="text-xs font-bold uppercase tracking-wider opacity-60">Listening to Webhooks...</p>
                  <p className="text-[10px] mt-0.5 opacity-50 leading-relaxed">Incoming Stripe or Razorpay payments will sound a chime here instantly.</p>
                </div>
              )}
            </div>
          </div>
        </div>

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
