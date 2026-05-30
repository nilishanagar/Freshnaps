import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Star, ShoppingBag, ArrowRight, ChevronDown, Truck, RotateCcw, Shield, CheckCircle, Award, BadgeCheck, Users, ThumbsUp, Package } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { productService } from '../services';
import { setFeatured, setBestsellers, setTrending } from '../store/slices/productSlice';
import ProductCard from '../components/common/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

// ──────────────────────────────────────────────
// Section animation wrapper
// ──────────────────────────────────────────────
const Section = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ──────────────────────────────────────────────
// Categories — bento grid with photography
// ──────────────────────────────────────────────
const categories = [
  {
    label: 'Mattresses', slug: 'mattress',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&auto=format&fit=crop',
    startingPrice: '₹4,999', count: 127, large: true,
  },
  {
    label: 'Pillows', slug: 'pillow',
    image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&auto=format&fit=crop',
    startingPrice: '₹799', count: 89,
  },
  {
    label: 'Bedsheets', slug: 'bedsheet',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop',
    startingPrice: '₹1,299', count: 156,
  },
  {
    label: 'Comforters', slug: 'comforter',
    image: 'https://images.unsplash.com/photo-1580482012699-93a7f0b6df58?w=600&auto=format&fit=crop',
    startingPrice: '₹2,499', count: 43,
  },
  {
    label: 'Cushions', slug: 'cushion',
    image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=600&auto=format&fit=crop',
    startingPrice: '₹499', count: 67,
  },
  {
    label: 'Blankets', slug: 'blanket',
    image: 'https://images.unsplash.com/photo-1576158114131-cc85ff77c72e?w=600&auto=format&fit=crop',
    startingPrice: '₹1,199', count: 54,
  },
  {
    label: 'Curtains', slug: 'curtain',
    image: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=600&auto=format&fit=crop',
    startingPrice: '₹899', count: 38,
  },
  {
    label: 'Accessories', slug: 'accessory',
    image: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=600&auto=format&fit=crop',
    startingPrice: '₹299', count: 92,
  },
];

// ──────────────────────────────────────────────
// Static fallback products (shown when API is unavailable)
// ──────────────────────────────────────────────
const MOCK_FEATURED = [
  {
    _id: 'f1', slug: 'cloud-comfort-memory-foam-mattress',
    name: 'Cloud Comfort Memory Foam Mattress',
    category: 'mattress',
    images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop'],
    price: 24999, discountPrice: 18999,
    rating: 4.8, numReviews: 124,
    isFeatured: true, isBestseller: true,
    createdAt: '2025-01-01',
  },
  {
    _id: 'f2', slug: 'royal-silk-pillowcase-set',
    name: 'Royal Silk Pillowcase Set',
    category: 'pillow',
    images: ['https://images.unsplash.com/photo-1592789705501-f9ae4278a9bc?w=800&auto=format&fit=crop'],
    price: 3499, discountPrice: 2499,
    rating: 4.9, numReviews: 89,
    isFeatured: true, isBestseller: true,
    createdAt: '2025-01-01',
  },
  {
    _id: 'f3', slug: 'linen-dreams-bedsheet-set',
    name: 'Linen Dreams Bedsheet Set',
    category: 'bedsheet',
    images: ['https://images.unsplash.com/photo-1562663474-6cbb3eaa4d14?w=800&auto=format&fit=crop'],
    price: 4999, discountPrice: 3499,
    rating: 4.7, numReviews: 156,
    isFeatured: true, isBestseller: false,
    createdAt: '2025-01-01',
  },
  {
    _id: 'f4', slug: 'all-season-goose-down-comforter',
    name: 'All-Season Goose Down Comforter',
    category: 'comforter',
    images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop'],
    price: 8999, discountPrice: 6499,
    rating: 4.8, numReviews: 98,
    isFeatured: true, isTrending: true,
    createdAt: '2025-01-01',
  },
];

const MOCK_BESTSELLERS = [
  {
    _id: 'b1', slug: 'cloud-comfort-memory-foam-mattress',
    name: 'Cloud Comfort Memory Foam Mattress',
    category: 'mattress',
    images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop'],
    price: 24999, discountPrice: 18999,
    rating: 4.8, numReviews: 124,
    isBestseller: true, createdAt: '2025-01-01',
  },
  {
    _id: 'b2', slug: 'royal-silk-pillowcase-set',
    name: 'Royal Silk Pillowcase Set',
    category: 'pillow',
    images: ['https://images.unsplash.com/photo-1592789705501-f9ae4278a9bc?w=800&auto=format&fit=crop'],
    price: 3499, discountPrice: 2499,
    rating: 4.9, numReviews: 89,
    isBestseller: true, createdAt: '2025-01-01',
  },
  {
    _id: 'b3', slug: 'velvet-comfort-cushion-set',
    name: 'Velvet Comfort Cushion Set',
    category: 'cushion',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop'],
    price: 2999, discountPrice: 1999,
    rating: 4.6, numReviews: 72,
    isBestseller: true, createdAt: '2025-01-01',
  },
  {
    _id: 'b4', slug: 'bamboo-mattress-protector',
    name: 'Bamboo Mattress Protector',
    category: 'accessory',
    images: ['https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=800&auto=format&fit=crop'],
    price: 1999, discountPrice: 1399,
    rating: 4.6, numReviews: 211,
    isBestseller: true, createdAt: '2025-01-01',
  },
  {
    _id: 'b5', slug: 'cashmere-touch-weighted-blanket',
    name: 'Cashmere Touch Weighted Blanket',
    category: 'blanket',
    images: ['https://images.unsplash.com/photo-1576158114131-cc85ff77c72e?w=800&auto=format&fit=crop'],
    price: 5999, discountPrice: 4299,
    rating: 4.7, numReviews: 63,
    isBestseller: false, createdAt: '2025-01-01',
  },
  {
    _id: 'b6', slug: 'blackout-linen-curtains',
    name: 'Blackout Linen Curtains',
    category: 'curtain',
    images: ['https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800&auto=format&fit=crop'],
    price: 3999, discountPrice: 2799,
    rating: 4.5, numReviews: 47,
    isBestseller: false, createdAt: '2025-01-01',
  },
  {
    _id: 'b7', slug: 'linen-dreams-bedsheet-set',
    name: 'Linen Dreams Bedsheet Set',
    category: 'bedsheet',
    images: ['https://images.unsplash.com/photo-1562663474-6cbb3eaa4d14?w=800&auto=format&fit=crop'],
    price: 4999, discountPrice: 3499,
    rating: 4.7, numReviews: 156,
    isBestseller: false, createdAt: '2025-01-01',
  },
  {
    _id: 'b8', slug: 'all-season-goose-down-comforter',
    name: 'All-Season Goose Down Comforter',
    category: 'comforter',
    images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop'],
    price: 8999, discountPrice: 6499,
    rating: 4.8, numReviews: 98,
    isBestseller: false, createdAt: '2025-01-01',
  },
];

// ──────────────────────────────────────────────
// Testimonials
// ──────────────────────────────────────────────
const testimonials = [
  { name: 'Priya Sharma', location: 'Delhi', rating: 5, text: 'The memory foam mattress completely transformed my sleep! I wake up feeling refreshed for the first time in years.', avatar: 'https://i.pravatar.cc/60?img=1' },
  { name: 'Arjun Mehta', location: 'Mumbai', rating: 5, text: 'Absolutely love the bedsheet quality. 500 TC Egyptian cotton feels like sleeping in a 5-star hotel every night.', avatar: 'https://i.pravatar.cc/60?img=3' },
  { name: 'Kavya Reddy', location: 'Hyderabad', rating: 5, text: 'The silk pillowcases are a game changer for my hair and skin. Fast delivery and beautiful packaging too!', avatar: 'https://i.pravatar.cc/60?img=5' },
  { name: 'Rahul Gupta', location: 'Jaipur', rating: 5, text: 'Premium quality at reasonable prices. The weighted blanket helps me sleep so much better. Highly recommend!', avatar: 'https://i.pravatar.cc/60?img=8' },
];

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featured, bestsellers, trending } = useSelector(s => s.products);
  const [loading, setLoading] = React.useState(true);
  const [email, setEmail] = React.useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [f, b, t] = await Promise.all([
          productService.getAll({ featured: 'true', limit: 4 }),
          productService.getAll({ bestseller: 'true', limit: 8 }),
          productService.getAll({ trending: 'true', limit: 4 }),
        ]);
        // Use API data if available, otherwise fall back to mock data
        dispatch(setFeatured(f.data.products?.length > 0 ? f.data.products : MOCK_FEATURED));
        dispatch(setBestsellers(b.data.products?.length > 0 ? b.data.products : MOCK_BESTSELLERS));
        dispatch(setTrending(t.data.products?.length > 0 ? t.data.products : []));
      } catch (err) {
        // API unavailable — use static mock data so sections still render
        console.warn('API unavailable, using mock product data:', err?.message || err);
        dispatch(setFeatured(MOCK_FEATURED));
        dispatch(setBestsellers(MOCK_BESTSELLERS));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [dispatch]);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      toast.success('Subscribed! Welcome to the Freshnaps family.', { icon: '🎉' });
      setEmail('');
    }
  };

  return (
    <div className="overflow-x-hidden">

      {/* ─── HERO ─── */}
      <section className="relative min-h-[88vh] overflow-hidden flex items-center">

        {/* Full-section background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=80"
            alt="Premium bedroom setup"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://picsum.photos/seed/bedroom1/1600/900'; }}
          />
          {/* Gradient overlay — solid on the left for text readability, fades to transparent */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/90 to-[#FAF8F5]/10 dark:from-navy-900 dark:via-navy-900/88 dark:to-navy-900/10" />
        </div>

        {/* Ambient glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
          className="absolute top-16 right-1/3 w-80 h-80 rounded-full bg-gold-300/25 blur-3xl pointer-events-none"
        />

        <div className="container-custom relative z-10 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-10 xl:gap-20 items-center">

            {/* ── LEFT: text content ── */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75 }}
              className="flex flex-col"
            >
              {/* Pill */}
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full bg-gold-100 dark:bg-gold-500/20 text-gold-600 dark:text-gold-400 text-xs font-bold tracking-wide mb-6"
              >
                <Star size={11} fill="currentColor" /> Premium Bedding Collection 2025
              </motion.span>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.75 }}
                className="font-display text-[2.6rem] sm:text-5xl lg:text-[3.8rem] xl:text-[4.2rem] font-bold text-gray-900 dark:text-white leading-[1.1] mb-5"
              >
                Stunning &amp;<br />
                <span className="text-transparent bg-clip-text bg-gold-gradient">Premium Bedding</span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-base md:text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-[420px] leading-relaxed"
              >
                Create your perfect sleep sanctuary with our stylish and comfortable bedding designs.
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="flex flex-wrap gap-4 mb-12"
              >
                <Link to="/shop" className="btn-primary px-8 py-4 text-sm font-semibold rounded-xl">
                  <ShoppingBag size={17} /> Shop Now
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-gray-200 dark:border-navy-600 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:border-gold-400 hover:text-gold-600 dark:hover:text-gold-400 transition-all duration-200"
                >
                  Our Story <ArrowRight size={15} />
                </Link>
              </motion.div>

              {/* Trust strip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.75 }}
                className="flex flex-wrap items-center gap-6 pt-7 border-t border-gray-200 dark:border-navy-700"
              >
                {[
                  { icon: Truck,        text: 'Free Delivery' },
                  { icon: Shield,       text: 'High Quality' },
                  { icon: CheckCircle,  text: 'Best Prices' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-navy-800 shadow-sm border border-gray-100 dark:border-navy-700 flex items-center justify-center">
                      <Icon size={15} className="text-gold-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* ── RIGHT: floating cards ── */}
            <motion.div
              initial={{ opacity: 0, x: 55 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:flex items-center justify-end pr-4 xl:pr-12 min-h-105"
            >
              {/* Floating card — rating */}
              <motion.div
                initial={{ opacity: 0, scale: 0.75, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.85, type: 'spring', stiffness: 200 }}
                className="absolute -left-10 top-[30%] bg-white dark:bg-navy-800 rounded-2xl shadow-xl p-4 flex items-center gap-3 z-20 min-w-[190px]"
              >
                <div className="w-11 h-11 rounded-xl bg-gold-50 dark:bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                  <Star size={20} className="text-gold-500 fill-gold-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm leading-snug">4.9 ★ Rating</p>
                  <p className="text-xs text-gray-400 mt-0.5">50,000+ Happy Customers</p>
                </div>
              </motion.div>

              {/* Floating card — price */}
              <motion.div
                initial={{ opacity: 0, scale: 0.75, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 1.05, type: 'spring', stiffness: 200 }}
                className="absolute -right-6 bottom-[22%] bg-white dark:bg-navy-800 rounded-2xl shadow-xl px-5 py-4 z-20"
              >
                <p className="text-[11px] text-gray-400 font-medium mb-0.5">Starting from</p>
                <p className="font-bold text-gold-500 text-2xl leading-tight">₹999</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Free shipping included</p>
              </motion.div>
            </motion.div>

          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 text-gray-400 dark:text-white/30"
        >
          <ChevronDown size={28} />
        </motion.div>
      </section>

      {/* ─── STATS STRIP ───
      <section className="bg-white dark:bg-navy-900 border-b border-gray-100 dark:border-navy-800">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 dark:divide-navy-800">
            {[
              { icon: Users,    value: '50,000+', label: 'Happy Customers',  color: 'text-blue-500' },
              { icon: Package,  value: '500+',    label: 'Premium Products', color: 'text-emerald-500' },
              { icon: ThumbsUp, value: '4.8 ★',   label: 'Average Rating',  color: 'text-gold-500' },
              { icon: Truck,    value: '3–5 Days', label: 'Pan-India Delivery', color: 'text-purple-500' },
            ].map(({ icon: Icon, value, label, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 py-5 px-4 md:px-8 justify-center md:justify-start"
              >
                <div className={`w-10 h-10 rounded-xl bg-gray-50 dark:bg-navy-800 flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{value}</p>
                  <p className="text-xs text-gray-500 leading-tight">{label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ─── CATEGORIES ─── */}
      <section className="py-12 bg-white dark:bg-navy-900">
        <div className="container-custom">

          {/* Header */}
          <Section>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
              <div>
                <span className="inline-flex items-center gap-2 text-gold-500 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
                  <span className="w-8 h-px bg-gold-400" /> Browse By <span className="w-8 h-px bg-gold-400" />
                </span>
                <h2 className="section-title mt-1">Shop by Category</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-base">
                  Discover products tailored for every comfort and lifestyle need.
                </p>
              </div>
              <Link to="/shop" className="btn-ghost text-gold-500 hover:text-gold-600 self-start md:self-auto">
                All Products <ArrowRight size={15} />
              </Link>
            </div>
          </Section>

          {/* Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">

            {/* HERO CARD — Mattresses (spans 2 rows on desktop, full width on mobile) */}
            <Section className="col-span-2 md:col-span-1 md:row-span-2" delay={0}>
              <Link
                to="/shop?category=mattress"
                className="group relative flex flex-col justify-end overflow-hidden rounded-2xl md:rounded-3xl w-full h-[220px] md:h-[504px]"
              >
                <img
                  src={categories[0].image}
                  alt="Mattresses"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />

                {/* Count badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 bg-white/90 dark:bg-navy-900/90 backdrop-blur-sm rounded-full shadow-sm">
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">{categories[0].count} Products</span>
                </div>

                {/* Text content */}
                <div className="relative z-10 p-5 md:p-7">
                  <p className="font-display text-white text-2xl md:text-3xl font-bold leading-tight">
                    {categories[0].label}
                  </p>
                  <p className="text-gray-300 text-sm mt-1">Starting from {categories[0].startingPrice}</p>
                  <div className="mt-4 inline-flex items-center gap-2 bg-white text-gray-900 text-xs font-semibold px-4 py-2 rounded-full group-hover:bg-gold-500 group-hover:text-white transition-all duration-300 shadow-sm">
                    Shop Now <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            </Section>

            {/* REGULAR CARDS — 7 remaining categories */}
            {categories.slice(1).map((cat, i) => (
              <Section key={cat.slug} delay={0.06 + i * 0.06}>
                <Link
                  to={`/shop?category=${cat.slug}`}
                  className="group relative flex flex-col justify-end overflow-hidden rounded-2xl w-full h-[160px] md:h-[240px]"
                >
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  {/* Count badge */}
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 bg-white/90 dark:bg-navy-900/90 backdrop-blur-sm rounded-full">
                    <span className="text-[10px] font-semibold text-gray-800 dark:text-gray-100">{cat.count} Products</span>
                  </div>

                  {/* Text content */}
                  <div className="relative z-10 p-4 md:p-5">
                    <p className="font-display text-white text-sm md:text-lg font-bold leading-tight">
                      {cat.label}
                    </p>
                    <p className="text-gray-300 text-[11px] md:text-xs mt-0.5">Starting from {cat.startingPrice}</p>

                    {/* Shop Now — slides up on hover */}
                    <div className="mt-2.5 inline-flex items-center gap-1.5 bg-white text-gray-900 text-[10px] md:text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-hover:bg-gold-500 group-hover:text-white transition-all duration-300">
                      Shop Now <ArrowRight size={11} />
                    </div>
                  </div>
                </Link>
              </Section>
            ))}
          </div>

        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ─── */}
      <section className="py-12">
        <div className="container-custom">
          <Section>
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-gold-500 font-medium text-sm uppercase tracking-widest">Handpicked</span>
                <h2 className="section-title mt-2">Featured Collection</h2>
              </div>
              <Link to="/shop?featured=true" className="btn-ghost text-gold-500 hover:text-gold-600 hidden md:flex">
                View All <ArrowRight size={16} />
              </Link>
            </div>
          </Section>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(4).fill(null).map((_, i) => (
                <div key={i} className="card aspect-[4/3] animate-pulse bg-gray-100 dark:bg-navy-700 rounded-2xl" />
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 mb-4">No featured products right now.</p>
              <Link to="/shop" className="btn-primary px-8 py-3 text-sm">Browse All Products <ArrowRight size={15} /></Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── PROMO BANNER ─── */}
      <Section>
        <section className="py-6">
          <div className="container-custom">
            <div className="relative rounded-3xl overflow-hidden bg-dark-gradient p-10 md:p-16 text-center">
              <div className="absolute inset-0 opacity-20">
                <img src="https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=1200" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 to-navy-800/80" />
              <div className="relative z-10">
                <span className="inline-block px-4 py-1 rounded-full bg-gold-500/20 text-gold-400 text-sm font-medium mb-4">Limited Time Offer</span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                  Up to <span className="text-gold-400">40% Off</span>
                </h2>
                <p className="text-gray-300 mb-8 text-lg max-w-md mx-auto">On our bestselling mattresses and bedsheet sets. Free shipping on all orders above ₹999.</p>
                <Link to="/shop" className="btn-primary px-10 py-4 text-base">
                  Shop the Sale <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Section>

      {/* ─── BESTSELLERS ─── */}
      <section className="py-12 bg-gray-50 dark:bg-navy-800/30">
        <div className="container-custom">
          <Section>
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-gold-500 font-medium text-sm uppercase tracking-widest">Most Loved</span>
                <h2 className="section-title mt-2">Best Sellers</h2>
              </div>
              <Link to="/shop?bestseller=true" className="btn-ghost text-gold-500 hover:text-gold-600 hidden md:flex">
                View All <ArrowRight size={16} />
              </Link>
            </div>
          </Section>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(4).fill(null).map((_, i) => (
                <div key={i} className="card aspect-[4/3] animate-pulse bg-gray-100 dark:bg-navy-700 rounded-2xl" />
              ))}
            </div>
          ) : bestsellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestsellers.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 mb-4">No bestsellers available right now.</p>
              <Link to="/shop" className="btn-primary px-8 py-3 text-sm">Browse All Products <ArrowRight size={15} /></Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── TRENDING ─── */}
      {trending.length > 0 && (
        <section className="py-12">
          <div className="container-custom">
            <Section>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <span className="text-gold-500 font-medium text-sm uppercase tracking-widest">What's Hot</span>
                  <h2 className="section-title mt-2">Trending Now</h2>
                </div>
                <Link to="/shop?trending=true" className="btn-ghost text-gold-500 hover:text-gold-600 hidden md:flex">
                  View All <ArrowRight size={16} />
                </Link>
              </div>
            </Section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trending.map(product => <ProductCard key={product._id} product={product} />)}
            </div>
          </div>
        </section>
      )}

      {/* ─── WHY FRESHNAPS ─── */}
      <Section>
        <section className="py-12 bg-navy-900 dark:bg-navy-950 text-white">
          <div className="container-custom">
            <div className="text-center mb-14">
              <span className="text-gold-400 font-medium text-sm uppercase tracking-widest">Why Choose Us</span>
              <h2 className="font-display text-4xl font-bold mt-2">The Freshnaps Promise</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: Award,       iconColor: 'text-amber-400',  bg: 'bg-amber-400/10',  title: 'Premium Quality',  desc: 'Egyptian cotton, mulberry silk & certified memory foams — every product rigorously tested.' },
                { icon: Truck,       iconColor: 'text-emerald-400', bg: 'bg-emerald-400/10', title: 'Fast Delivery',   desc: 'Free shipping on orders ₹999+. Delivered pan-India in 3–5 business days.' },
                { icon: RotateCcw,   iconColor: 'text-blue-400',   bg: 'bg-blue-400/10',   title: 'Easy Returns',    desc: '30-day hassle-free returns. No questions asked, no paperwork.' },
                { icon: BadgeCheck,  iconColor: 'text-gold-400',   bg: 'bg-gold-400/10',   title: 'Warranty Assured', desc: 'Up to 10-year warranty on mattresses. Every product built to last.' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="group p-7 rounded-2xl bg-navy-800 dark:bg-navy-900 border border-navy-700 hover:border-gold-500/40 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={22} className={item.iconColor} strokeWidth={1.8} />
                    </div>
                    <h3 className="font-semibold text-white text-base mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </Section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-12 bg-cream-200 dark:bg-navy-800/50">
        <div className="container-custom">
          <Section>
            <div className="text-center mb-12">
              <span className="text-gold-500 font-medium text-sm uppercase tracking-widest">Happy Customers</span>
              <h2 className="section-title mt-2">What People Say</h2>
            </div>
          </Section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <Section key={i} delay={i * 0.1}>
                <div className="card p-6 h-full flex flex-col">
                  <div className="flex gap-0.5 mb-3">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={14} className="text-gold-400 fill-gold-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1 mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.location}</p>
                    </div>
                  </div>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ─── */}
      <Section>
        <section className="py-12 bg-white dark:bg-navy-900">
          <div className="container-custom">
            <div className="relative rounded-3xl overflow-hidden bg-gold-gradient p-10 md:p-16 text-center shadow-gold-lg">
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              <div className="relative z-10 max-w-2xl mx-auto">
                <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-4 backdrop-blur-sm">
                  Stay Updated
                </span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
                  Join the Freshnaps Family
                </h2>
                <p className="text-white/80 mb-8 text-lg">
                  Get exclusive offers, sleep tips, and new arrivals straight to your inbox.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="flex-1 px-5 py-3.5 rounded-xl bg-white/95 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-white/60 transition-all text-sm"
                  />
                  <button type="submit" className="px-8 py-3.5 bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 transition-colors flex-shrink-0 text-sm">
                    Subscribe Free
                  </button>
                </form>
                <p className="text-white/60 text-xs mt-3">No spam, unsubscribe anytime. We respect your privacy.</p>
              </div>
            </div>
          </div>
        </section>
      </Section>

    </div>
  );
};

export default HomePage;
