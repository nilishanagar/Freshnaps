import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Heart, User, Search, Sun, Moon, Menu, X,
  Leaf, ChevronDown, Package, LogOut, Truck, Tag,
  Activity, Cloud, Shield, Sparkles, Wind, ArrowRight,
  Compass, Zap, Thermometer
} from 'lucide-react';
import { toggleTheme } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { selectCartCount } from '../../store/slices/cartSlice';
import { authService } from '../../services';
import toast from 'react-hot-toast';
import freshNapsLogo from '../../assets/freshnaps-logo.png';

const categories = [
  { label: 'Mattresses', slug: 'mattress' },
  { label: 'Pillows', slug: 'pillow' },
  { label: 'Bedsheets', slug: 'bedsheet' },
  { label: 'Cushions', slug: 'cushion' },
  { label: 'Comforters', slug: 'comforter' },
  { label: 'Blankets', slug: 'blanket' },
  { label: 'Accessories', slug: 'accessory' },
];

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Mattress', to: '/shop?category=mattress' },
  { label: 'Accessories', to: '/shop?category=pillow' },
  { label: 'Protectors', to: '/shop?category=accessory&search=Protector' },
  { label: 'Shop All', to: '/shop' }
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector(s => s.ui);
  const { user } = useSelector(s => s.auth);
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector(s => s.wishlist.items.length);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // Custom sleep navigation menus
  const [mattressMenuOpen, setMattressMenuOpen] = useState(false);
  const [accessoriesMenuOpen, setAccessoriesMenuOpen] = useState(false);
  const [protectorsMenuOpen, setProtectorsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const getCategoryFromQuery = (query) => {
    const q = query.toLowerCase().trim();
    if (q.includes('pillow')) return 'pillow';
    if (q.includes('mattress')) return 'mattress';
    if (q.includes('bedsheet') || q.includes('bed sheet')) return 'bedsheet';
    if (q.includes('cushion')) return 'cushion';
    if (q.includes('comforter')) return 'comforter';
    if (q.includes('blanket')) return 'blanket';
    if (q.includes('accessory') || q.includes('accessories')) return 'accessory';
    return '';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      const category = getCategoryFromQuery(query);
      if (category) {
        navigate(`/shop?category=${category}&search=${encodeURIComponent(query)}`);
      } else {
        navigate(`/shop?search=${encodeURIComponent(query)}`);
      }
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Proceed with local logout even if API call fails
    }
    dispatch(logout());
    setUserMenuOpen(false);
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const ROYAL_URL = import.meta.env.VITE_ROYAL_MARWADI_URL || 'https://royalmarwadi.com';

  return (
    <>
      {/* Announcement bar */}
      {!scrolled && (
        <div className="fixed top-0 inset-x-0 z-50 bg-surface-950 text-white text-[11px] font-medium tracking-wide py-2 text-center flex items-center justify-center gap-8 px-4 border-b border-surface-900/50">
          <span className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
            <Truck size={12} className="text-primary-400 animate-pulse" />
            Free Shipping &amp; White Glove Installation on Mattresses
          </span>
          <span className="hidden sm:flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
            <Tag size={12} className="text-primary-400" />
            Use code <span className="font-bold text-primary-400 px-1.5 py-0.5 rounded bg-surface-950 border border-surface-900 ml-0.5">FRESH10</span> for 10% off
          </span>
        </div>
      )}

      <header className={`fixed inset-x-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'top-0 bg-white/90 dark:bg-surface-950/90 backdrop-blur-xl shadow-xl border-b border-primary-200/20 dark:border-surface-900/80 py-2'
          : 'top-8 bg-white/95 dark:bg-surface-950/95 backdrop-blur-lg border-b border-gray-100 dark:border-surface-950/50 py-3'
      }`}>
        <nav className="container-custom flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 group">
            <img
              src={freshNapsLogo}
              alt="FreshNaps Mattress"
              className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Nav: Focused strictly on Mattresses & Bedding */}
          <div className="hidden md:flex items-center justify-center gap-2.5 flex-1 z-50">
            <NavLink to="/" end className={({ isActive }) => `relative px-3.5 py-2 rounded-xl font-semibold text-sm transition-all duration-350 whitespace-nowrap ${isActive ? 'text-primary-500 bg-surface-100/50 dark:bg-surface-950/50' : 'text-gray-700 dark:text-gray-300 hover:text-primary-500 hover:bg-surface-50/30 dark:hover:bg-surface-950/20'}`}>
              Home
            </NavLink>

            {/* Mattress Mega Dropdown on Hover */}
            <div className="relative" onMouseEnter={() => setMattressMenuOpen(true)} onMouseLeave={() => setMattressMenuOpen(false)}>
              <button className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold text-sm transition-all duration-350 whitespace-nowrap hover:bg-surface-50/30 dark:hover:bg-surface-950/20 hover:text-primary-500 dark:text-gray-300 ${mattressMenuOpen ? 'text-primary-500 bg-surface-100/50 dark:bg-surface-950/50' : 'text-gray-700'}`}>
                Mattress <ChevronDown size={14} className={`transition-transform duration-300 ${mattressMenuOpen ? 'rotate-180 text-primary-500' : ''}`} />
              </button>

              <AnimatePresence>
                {mattressMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="absolute top-full left-1/2 -translate-x-[45%] mt-1 w-[760px] bg-white dark:bg-surface-950 rounded-3xl shadow-2xl border border-primary-200/20 dark:border-surface-900/80 p-8 z-[100] overflow-hidden flex flex-col gap-6"
                  >
                    {/* Decorative subtle border top accent */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-brand-gradient" />

                    <div className="grid grid-cols-4 gap-6">
                      {/* Column 1: Shop by Need */}
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 dark:border-surface-900 flex items-center gap-1.5">
                          <Activity size={12} className="text-primary-500" />
                          Shop By Need
                        </h4>
                        <ul className="space-y-3">
                          {[
                            { label: 'Orthopedic Back Support', val: 'Orthopedic', icon: Shield, desc: 'Aligns your spine naturally' },
                            { label: 'Plush & Cozy Soft Feel', val: 'Cloud', icon: Cloud, desc: 'Sink-in luxurious comfort' },
                            { label: 'Zero Motion Partner Relief', val: 'OrthoRest', icon: Sparkles, desc: 'Undisturbed deep sleep' }
                          ].map((item, idx) => (
                            <li key={idx} className="group/item">
                              <Link to={`/shop?category=mattress&search=${item.val}`} className="block">
                                <span className="flex items-center gap-1 text-[13px] font-bold text-gray-800 dark:text-gray-200 group-hover/item:text-primary-500 transition-colors">
                                  {item.label}
                                </span>
                                <span className="block text-[10px] text-gray-400 group-hover/item:text-gray-500 font-medium transition-colors">
                                  {item.desc}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Column 2: Shop by Tech */}
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 dark:border-surface-900 flex items-center gap-1.5">
                          <Zap size={12} className="text-primary-500" />
                          Shop By Tech
                        </h4>
                        <ul className="space-y-3">
                          {[
                            { label: 'Natural Open-Cell Latex', val: 'Latex', icon: Leaf, desc: 'Organic breathability & bounce' },
                            { label: 'CoolGel Memory Foam', val: 'Foam', icon: Thermometer, desc: 'Pulls heat away from body' },
                            { label: 'Orthorest Pocket Springs', val: 'Spring', icon: Compass, desc: 'Active body contouring support' }
                          ].map((item, idx) => (
                            <li key={idx} className="group/item">
                              <Link to={`/shop?category=mattress&search=${item.val}`} className="block">
                                <span className="flex items-center gap-1 text-[13px] font-bold text-gray-800 dark:text-gray-200 group-hover/item:text-primary-500 transition-colors">
                                  {item.label}
                                </span>
                                <span className="block text-[10px] text-gray-400 group-hover/item:text-gray-500 font-medium transition-colors">
                                  {item.desc}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Column 3: Shop by Size */}
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 dark:border-surface-900 flex items-center gap-1.5">
                          <Package size={12} className="text-primary-500" />
                          Shop By Size
                        </h4>
                        <ul className="space-y-2">
                          {['King Size', 'Queen Size', 'Single Size', 'Double Size', 'Custom Size'].map((size, idx) => {
                            const toUrl = `/shop?category=mattress&search=${size.split(' ')[0]}`;
                            const displayLabel = `${size} Mattress`;
                            return (
                              <li key={idx}>
                                <Link to={toUrl} className="flex items-center justify-between text-[13px] font-semibold text-gray-600 dark:text-gray-400 hover:text-primary-500 py-1 transition-colors">
                                  <span>{displayLabel}</span>
                                  <ArrowRight size={10} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary-500" />
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {/* Column 4: Premium Sleep Advisor Card */}
                      <div className="bg-[#F8FAFC] dark:bg-surface-950/60 rounded-2xl p-5 border border-primary-100/50 dark:border-surface-900/80 flex flex-col justify-between shadow-inner relative overflow-hidden group/card">
                        <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-primary-200/10 dark:bg-primary-500/5 blur-xl group-hover/card:scale-125 transition-transform duration-500" />
                        <div>
                          <span className="text-[9px] font-extrabold text-primary-600 dark:text-primary-400 uppercase tracking-widest block mb-1">AI Advisor</span>
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-2">Find Your Mattress</h4>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">Answer 4 quick sleep behavior questions to unlock your custom recommendation.</p>
                        </div>
                        <Link to="/" className="w-full text-center mt-4 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-xs rounded-xl transition-all shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5">
                          Start Advisor
                        </Link>
                      </div>
                    </div>

                    {/* Bottom-Center "All Mattresses" blue button */}
                    <div className="flex justify-center border-t border-gray-100 dark:border-surface-900/50 pt-4">
                      <Link to="/shop?category=mattress" onClick={() => setMattressMenuOpen(false)} className="inline-flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95">
                        <span>All Mattresses</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ACCESSORIES Dropdown */}
            <div className="relative" onMouseEnter={() => setAccessoriesMenuOpen(true)} onMouseLeave={() => setAccessoriesMenuOpen(false)}>
              <button className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold text-sm transition-all duration-350 whitespace-nowrap hover:bg-surface-50/30 dark:hover:bg-surface-950/20 hover:text-primary-500 dark:text-gray-300 ${accessoriesMenuOpen ? 'text-primary-500 bg-surface-100/50 dark:bg-surface-950/50' : 'text-gray-700'}`}>
                Accessories <ChevronDown size={14} className={`transition-transform duration-300 ${accessoriesMenuOpen ? 'rotate-180 text-primary-500' : ''}`} />
              </button>

              <AnimatePresence>
                {accessoriesMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-surface-950 rounded-2xl shadow-2xl border border-primary-200/20 dark:border-surface-900/80 py-3.5 z-[100] overflow-hidden"
                  >
                    <div className="absolute top-0 inset-x-0 h-0.5 bg-brand-gradient" />
                    {[
                      { label: 'Pillows', to: '/shop?category=pillow' },
                      { label: 'Bedsheets', to: '/shop?category=bedsheet' },
                      { label: 'Comforters', to: '/shop?category=comforter' },
                      { label: 'Blankets', to: '/shop?category=blanket' },
                      { label: 'Dohar', to: '/shop?category=accessory&search=Dohar' }
                    ].map((item, idx) => (
                      <Link key={idx} to={item.to} className="block px-5 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-surface-100/50 dark:hover:bg-surface-950/55 hover:text-primary-600 transition-colors">
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* PROTECTORS Dropdown */}
            <div className="relative" onMouseEnter={() => setProtectorsMenuOpen(true)} onMouseLeave={() => setProtectorsMenuOpen(false)}>
              <button className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold text-sm transition-all duration-350 whitespace-nowrap hover:bg-surface-50/30 dark:hover:bg-surface-950/20 hover:text-primary-500 dark:text-gray-300 ${protectorsMenuOpen ? 'text-primary-500 bg-surface-100/50 dark:bg-surface-950/50' : 'text-gray-700'}`}>
                Protectors <ChevronDown size={14} className={`transition-transform duration-300 ${protectorsMenuOpen ? 'rotate-180 text-primary-500' : ''}`} />
              </button>

              <AnimatePresence>
                {protectorsMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-surface-950 rounded-2xl shadow-2xl border border-primary-200/20 dark:border-surface-900/80 py-3.5 z-[100] overflow-hidden"
                  >
                    <div className="absolute top-0 inset-x-0 h-0.5 bg-brand-gradient" />
                    {[
                      { label: 'Mattress Protectors', to: '/shop?category=accessory&search=Mattress Protector' },
                      { label: 'Pillow Protectors', to: '/shop?category=accessory&search=Pillow Protector' },
                      { label: 'Waterproof Protectors', to: '/shop?category=accessory&search=Waterproof' },
                      { label: 'Anti-Dust Mite Covers', to: '/shop?category=accessory&search=Anti-Dust' }
                    ].map((item, idx) => (
                      <Link key={idx} to={item.to} className="block px-5 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-surface-100/50 dark:hover:bg-surface-950/55 hover:text-primary-600 transition-colors">
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/shop" className={({ isActive }) => `px-3.5 py-2 rounded-xl font-semibold text-sm transition-all duration-350 whitespace-nowrap ${isActive ? 'text-primary-500 bg-surface-100/50 dark:bg-surface-950/50' : 'text-gray-700 dark:text-gray-300 hover:text-primary-500 hover:bg-surface-50/30 dark:hover:bg-surface-950/20'}`}>
              Shop All
            </NavLink>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 md:gap-2.5">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-surface-900/80 transition-all hover:scale-105"
              aria-label="Search"
            >
              <Search size={19} />
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-surface-900/80 transition-all hover:scale-105"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-surface-900/80 transition-all hover:scale-105" aria-label="Wishlist">
              <Heart size={19} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-extrabold animate-bounce">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-surface-900/80 transition-all hover:scale-105" aria-label="Cart">
              <ShoppingCart size={19} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[17px] h-[17px] bg-primary-500 text-white text-[10px] rounded-full flex items-center justify-center font-extrabold px-0.5">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-surface-900/80 transition-all hover:scale-105"
                aria-label="User menu"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-5.5 h-5.5 rounded-full object-cover" />
                ) : (
                  <User size={19} />
                )}
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-surface-950 rounded-2xl shadow-2xl border border-gray-100 dark:border-surface-900 overflow-hidden py-2.5 z-50"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-50 dark:border-surface-900">
                          <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                        </div>
                        <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-surface-100/60 dark:hover:bg-surface-900 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <User size={15} className="text-gray-400" /> My Profile
                        </Link>
                        <Link to="/profile?tab=orders" className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-surface-100/60 dark:hover:bg-surface-900 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <Package size={15} className="text-gray-400" /> My Orders
                        </Link>
                        {user.role === 'admin' && (
                          <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-extrabold text-primary-600 dark:text-primary-400 hover:bg-surface-100/60 dark:hover:bg-surface-900 transition-colors" onClick={() => setUserMenuOpen(false)}>
                            <Leaf size={15} /> Admin Panel
                          </Link>
                        )}
                        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                          <LogOut size={15} /> Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-surface-100/60 dark:hover:bg-surface-900 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <User size={15} className="text-gray-400" /> Login
                        </Link>
                        <Link to="/register" className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-extrabold text-primary-600 dark:text-primary-400 hover:bg-surface-100/60 dark:hover:bg-surface-900 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <Leaf size={15} /> Register
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Royal Marwadi button */}
            <a
              href={ROYAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-brand-gradient text-white text-[13px] font-extrabold rounded-2xl shadow-brand hover:shadow-brand-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <Leaf size={14} className="animate-pulse" />
              Royal Marwadi
            </a>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-900 transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-100 dark:border-surface-900 bg-white dark:bg-surface-950 overflow-hidden"
            >
              <div className="container-custom py-4 space-y-1.5">
                {navLinks.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                        isActive ? 'bg-surface-100 text-primary-600 dark:bg-surface-950 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-950/60'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}

                <div className="border-t border-gray-100 dark:border-surface-900 pt-4 mt-3 space-y-1.5">
                  {user ? (
                    <>
                      <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-950/60 rounded-2xl">My Profile</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl">Logout</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-950/60 rounded-2xl">Login</Link>
                      <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-extrabold text-primary-600 dark:text-primary-400 hover:bg-surface-100 dark:hover:bg-surface-950/60 rounded-2xl">Register</Link>
                    </>
                  )}
                  <a href={ROYAL_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-extrabold text-white bg-brand-gradient rounded-2xl shadow-brand mt-2">
                    <Leaf size={14} /> Royal Marwadi
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-surface-950/70 backdrop-blur-md flex items-start justify-center pt-24 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.form
              initial={{ y: -25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -25, opacity: 0 }}
              onSubmit={handleSearch}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <div className="flex gap-2 bg-white dark:bg-surface-950 rounded-3xl p-2.5 shadow-2xl border border-primary-200/20 dark:border-surface-900">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search mattresses, pillows, sleep tech..."
                  className="flex-1 px-5 py-3.5 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-lg font-medium"
                />
                <button type="submit" className="px-7 py-3 bg-primary-500 hover:bg-primary-600 text-white font-extrabold rounded-2xl shadow-brand transition-colors flex items-center justify-center">
                  <Search size={19} />
                </button>
                <button type="button" onClick={() => setSearchOpen(false)} className="p-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <X size={22} />
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer: announcement bar (28px) + navbar (64/72px) */}
      <div className="h-[92px] md:h-[100px]" />
    </>
  );
};

export default Navbar;
