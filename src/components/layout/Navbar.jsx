import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Heart, User, Search, Sun, Moon, Menu, X,
  Crown, ChevronDown, Package, LogOut, Truck, Tag
} from 'lucide-react';
import { toggleTheme } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { selectCartCount } from '../../store/slices/cartSlice';

const categories = [
  { label: 'Mattresses', slug: 'mattress' },
  { label: 'Pillows', slug: 'pillow' },
  { label: 'Bedsheets', slug: 'bedsheet' },
  { label: 'Cushions', slug: 'cushion' },
  { label: 'Comforters', slug: 'comforter' },
  { label: 'Blankets', slug: 'blanket' },
  { label: 'Curtains', slug: 'curtain' },
  { label: 'Accessories', slug: 'accessory' },
];

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
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
  const [shopMenuOpen, setShopMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    navigate('/');
  };

  const ROYAL_URL = import.meta.env.VITE_ROYAL_MARWADI_URL || 'https://royalmarwadi.com';

  return (
    <>
      {/* Announcement bar */}
      {!scrolled && (
        <div className="fixed top-0 inset-x-0 z-50 bg-navy-900 dark:bg-navy-950 text-white text-xs py-2 text-center flex items-center justify-center gap-6 px-4">
          <span className="flex items-center gap-1.5">
            <Truck size={11} className="text-gold-400" />
            Free Shipping on orders above ₹999
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Tag size={11} className="text-gold-400" />
            Use code <span className="font-bold text-gold-400 ml-0.5">FRESH10</span> for 10% off
          </span>
        </div>
      )}

      <header className={`fixed inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'top-0 bg-white/95 dark:bg-navy-900/95 backdrop-blur-lg shadow-lg border-b border-gold-100 dark:border-navy-700'
          : 'top-7 bg-white/90 dark:bg-navy-900/90 backdrop-blur-md border-b border-gray-100/50 dark:border-navy-800/50'
      }`}>
        <nav className="container-custom h-16 md:h-18 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold group-hover:shadow-gold-lg transition-shadow duration-300">
              <Moon size={16} className="text-white" strokeWidth={2} />
            </div>
            <span className="font-display font-bold text-xl text-navy-900 dark:text-white tracking-tight">
              Fresh<span className="text-gold-500">naps</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link =>
              link.label === 'Shop' ? (
                <div key="shop" className="relative" onMouseEnter={() => setShopMenuOpen(true)} onMouseLeave={() => setShopMenuOpen(false)}>
                  <NavLink
                    to="/shop"
                    className={({ isActive }) =>
                      `flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                        isActive ? 'text-gold-500' : 'text-gray-700 dark:text-gray-300 hover:text-gold-500 dark:hover:text-gold-400'
                      }`
                    }
                  >
                    Shop <ChevronDown size={14} className={`transition-transform ${shopMenuOpen ? 'rotate-180' : ''}`} />
                  </NavLink>

                  <AnimatePresence>
                    {shopMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 w-52 bg-white dark:bg-navy-800 rounded-2xl shadow-card-hover border border-gray-100 dark:border-navy-600 overflow-hidden py-2"
                      >
                        {categories.map(cat => (
                          <Link
                            key={cat.slug}
                            to={`/shop?category=${cat.slug}`}
                            className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-cream-200 dark:hover:bg-navy-700 hover:text-gold-600 transition-colors"
                          >
                            {cat.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                      isActive ? 'text-gold-500' : 'text-gray-700 dark:text-gray-300 hover:text-gold-500 dark:hover:text-gold-400'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              )
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Wishlist */}
            <Link to="/profile?tab=wishlist" className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors" aria-label="Wishlist">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors" aria-label="Cart">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-gold-500 text-white text-xs rounded-full flex items-center justify-center font-bold px-0.5">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
                aria-label="User menu"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <User size={20} />
                )}
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute top-full right-0 mt-1 w-52 bg-white dark:bg-navy-800 rounded-2xl shadow-card-hover border border-gray-100 dark:border-navy-600 overflow-hidden py-2"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-navy-600">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-cream-200 dark:hover:bg-navy-700 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <User size={16} /> My Profile
                        </Link>
                        <Link to="/profile?tab=orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-cream-200 dark:hover:bg-navy-700 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <Package size={16} /> My Orders
                        </Link>
                        {user.role === 'admin' && (
                          <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gold-600 dark:text-gold-400 hover:bg-cream-200 dark:hover:bg-navy-700 transition-colors" onClick={() => setUserMenuOpen(false)}>
                            <Crown size={16} /> Admin Panel
                          </Link>
                        )}
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <LogOut size={16} /> Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-cream-200 dark:hover:bg-navy-700 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <User size={16} /> Login
                        </Link>
                        <Link to="/register" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gold-600 dark:text-gold-400 hover:bg-cream-200 dark:hover:bg-navy-700 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <Crown size={16} /> Register
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
              className="hidden lg:flex items-center gap-1.5 px-4 py-2 bg-gold-gradient text-white text-sm font-semibold rounded-xl shadow-gold hover:shadow-gold-lg transition-all hover:-translate-y-0.5"
            >
              <Crown size={14} />
              Royal Marwadi
            </a>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
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
              className="md:hidden border-t border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 overflow-hidden"
            >
              <div className="container-custom py-4 space-y-1">
                {navLinks.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive ? 'bg-cream-200 dark:bg-navy-700 text-gold-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}

                <div className="border-t border-gray-100 dark:border-navy-700 pt-3 mt-3 space-y-1">
                  {user ? (
                    <>
                      <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800 rounded-xl">My Profile</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl">Logout</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800 rounded-xl">Login</Link>
                      <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-gold-600 font-semibold hover:bg-cream-200 dark:hover:bg-navy-800 rounded-xl">Register</Link>
                    </>
                  )}
                  <a href={ROYAL_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gold-gradient rounded-xl">
                    <Crown size={14} /> Royal Marwadi
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.form
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              onSubmit={handleSearch}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <div className="flex gap-2 bg-white dark:bg-navy-800 rounded-2xl p-2 shadow-2xl">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search mattresses, pillows, bedsheets..."
                  className="flex-1 px-4 py-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-lg"
                />
                <button type="submit" className="btn-primary px-6">
                  <Search size={18} />
                </button>
                <button type="button" onClick={() => setSearchOpen(false)} className="p-3 text-gray-400 hover:text-gray-600">
                  <X size={20} />
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
