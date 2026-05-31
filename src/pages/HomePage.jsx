import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShoppingBag, ArrowRight, ChevronDown, Truck, RotateCcw, Shield, Award, BadgeCheck, Heart, Zap, Sparkles, HelpCircle, Eye, Info, Check, RefreshCw } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { productService } from '../services';
import ProductCard from '../components/common/ProductCard';

const HERO_CAROUSEL = [
  {
    title: 'Cloud Comfort Memory Foam',
    tagline: 'Spinal Orthopedic Correction Layer',
    desc: 'Intelligent body-conforming memory foam layered with active cooling gel technology to disperse heat and align the spine.',
    price: '₹14,999',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1000',
    layers: [
      { name: '1. Luxury Tencel Breathable Fabric', thickness: '10mm' },
      { name: '2. Heat-Dispelling Gel Memory Foam', thickness: '40mm' },
      { name: '3. 5-Zone Orthopedic Target Foam', thickness: '50mm' },
      { name: '4. High-Density Supporting Core Base', thickness: '100mm' }
    ]
  },
  {
    title: 'OrthoRest Pocket Spring',
    tagline: 'Zero Motion Transfer Spring Core',
    desc: '2000+ individually enclosed pocket springs topped with a high-density orthopedic comfort sheet for absolute motion isolation.',
    price: '₹11,999',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=1000',
    layers: [
      { name: '1. Quilted Euro-Top Pillow Surface', thickness: '20mm' },
      { name: '2. High-Resilience Comfort Layer', thickness: '30mm' },
      { name: '3. Tempered Carbon Pocket Springs', thickness: '120mm' },
      { name: '4. High-Durability Border Frame Edge', thickness: '50mm' }
    ]
  },
  {
    title: 'NaturalSleep Organic Latex',
    tagline: 'Sustainable GOLS Organic latex',
    desc: '100% natural, hypoallergenic organic latex harvested from eco-friendly reserves. Buoyant, highly breathable, and naturally cooling.',
    price: '₹22,999',
    image: 'https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=1000',
    layers: [
      { name: '1. Bamboo Natural Fiber Cover', thickness: '10mm' },
      { name: '2. Aerated Open-Cell Organic Latex', thickness: '50mm' },
      { name: '3. Breathable Support Foam Base', thickness: '100mm' }
    ]
  }
];

const testimonials = [
  { name: 'Priya Sharma', location: 'Delhi', text: 'The memory foam mattress completely transformed my sleep! I wake up with absolutely zero back pain.', avatar: 'https://i.pravatar.cc/60?img=1' },
  { name: 'Arjun Mehta', location: 'Mumbai', text: 'Stunning premium quality. The Egyptian cotton bedsheets feel incredibly soft, just like a 5-star resort.', avatar: 'https://i.pravatar.cc/60?img=3' },
  { name: 'Kavya Reddy', location: 'Hyderabad', text: 'Fast shipping, beautiful luxury packaging, and the natural latex pillow is exceptionally supportive.', avatar: 'https://i.pravatar.cc/60?img=5' },
  { name: 'Rahul Gupta', location: 'Jaipur', text: 'The mattress protector fits like a glove and stays perfectly cool. Extremely satisfied!', avatar: 'https://i.pravatar.cc/60?img=8' }
];

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [email, setEmail] = useState('');

  // Hero carousel auto sliding
  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % HERO_CAROUSEL.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Mattress Catalog Filters (matches Sleepwell design)
  const [selectedSubtype, setSelectedSubtype] = useState(''); // e.g. 'King', 'Queen', 'Single', 'Double', 'Spring', 'Ortho'
  const [lengthFilter, setLengthFilter] = useState('');
  const [widthFilter, setWidthFilter] = useState('');
  const [thicknessFilter, setThicknessFilter] = useState('');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null); // 'checking', 'available', 'unavailable'
  const [sortOption, setSortOption] = useState('best');
  
  // Compare state
  const [compareEnabled, setCompareEnabled] = useState(false);

  // Tabbed other products
  const [otherActiveTab, setOtherActiveTab] = useState('pillow'); // 'pillow', 'cushion', 'comforter', 'accessory'

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await productService.getAll({ limit: 100 });
        setAllProducts(res.data.products || []);
      } catch (err) {
        console.warn('API error, loaded products locally');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!pincode) return;
    setPincodeStatus('checking');
    setTimeout(() => {
      // Simulate checking delivery pincode
      if (pincode.length === 6 && /^\d+$/.test(pincode)) {
        setPincodeStatus('available');
        toast.success('Express delivery is available to your location! 🚚');
      } else {
        setPincodeStatus('unavailable');
        toast.error('Invalid pincode. Please enter a 6-digit numeric pincode.');
      }
    }, 1000);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      toast.success('Subscribed! Welcome to the Freshnaps sleep club.', { icon: '🎉' });
      setEmail('');
    }
  };

  // Filter Mattresses for the Mattress Catalog Section
  const mattresses = allProducts.filter(p => p.categoryLegacy === 'mattress' || p.category?.slug === 'mattress');
  
  const filteredMattresses = mattresses.filter(m => {
    // 1. Subtype / Size pills
    if (selectedSubtype) {
      if (selectedSubtype === 'Spring' && !m.name.toLowerCase().includes('spring') && !m.tags?.includes('spring')) return false;
      if (selectedSubtype === 'Ortho' && !m.name.toLowerCase().includes('ortho') && !m.tags?.includes('orthopedic')) return false;
      if (['King', 'Queen', 'Single', 'Double'].includes(selectedSubtype)) {
        const hasVariant = m.variants?.some(v => v.size?.toLowerCase().includes(selectedSubtype.toLowerCase()));
        if (!hasVariant && !m.name.toLowerCase().includes(selectedSubtype.toLowerCase())) return false;
      }
    }
    // 2. Dropdown specs filters
    if (thicknessFilter) {
      const hasMatchingThickness = m.name.toLowerCase().includes(`${thicknessFilter} inch`) || m.description.toLowerCase().includes(`${thicknessFilter} inch`);
      if (!hasMatchingThickness) return false;
    }
    return true;
  });

  // Filter Tabbed bedding materials
  const tabbedProducts = allProducts.filter(p => {
    const cat = p.category?.slug || p.categoryLegacy;
    if (otherActiveTab === 'accessory') {
      return cat === 'accessory';
    }
    return cat === otherActiveTab;
  });

  return (
    <div className="overflow-x-hidden bg-[#fafaf9] dark:bg-surface-950">

      {/* ─── 1. HERO: LAYERED MATTRESSES AUTO-SLIDING CAROUSEL ─── */}
      <section className="relative min-h-[92vh] flex items-center bg-[#F8FAFC] dark:bg-surface-950 border-b border-gray-100 dark:border-surface-900 pt-0 pb-0">
        <div className="container-custom py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
            >
              {/* Text side */}
              <div className="lg:col-span-5 text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#dcfce7] text-gray-700 text-[10px] font-bold uppercase tracking-wider mb-6">
                  <Sparkles size={11} className="text-primary-500 fill-primary-500" /> Advanced Sleep Tech
                </span>
                
                <h1 className="font-display text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-[1.15] mb-4">
                  {HERO_CAROUSEL[heroIndex].title}
                </h1>
                
                <p className="text-primary-500 text-xs font-bold uppercase tracking-widest block mb-4">
                  {HERO_CAROUSEL[heroIndex].tagline}
                </p>

                <p className="text-gray-500 dark:text-gray-300 text-sm leading-relaxed mb-8 max-w-md">
                  {HERO_CAROUSEL[heroIndex].desc}
                </p>

                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-xs text-gray-400 font-medium">Starting from</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{HERO_CAROUSEL[heroIndex].price}</span>
                </div>

                <div className="flex gap-4">
                  <Link to="/shop?category=mattress" className="btn-primary px-8 py-3.5 text-xs font-bold rounded">
                    Explore Mattresses
                  </Link>
                  <a href="#mattresses-catalog" className="inline-flex items-center gap-2 px-8 py-3.5 rounded border border-gray-200 dark:border-surface-800 text-gray-700 dark:text-gray-300 text-xs font-bold hover:border-primary-500 hover:text-primary-500 transition-all bg-white dark:bg-surface-900 shadow-sm">
                    Shop Catalog
                  </a>
                </div>
              </div>

              {/* Graphic Layered side */}
              <div className="lg:col-span-7 relative flex flex-col items-center">
                <div className="w-full aspect-[1/0.60] rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-surface-900 bg-white dark:bg-surface-900">
                  <img
                    src={HERO_CAROUSEL[heroIndex].image}
                    alt={HERO_CAROUSEL[heroIndex].title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Layer Specifications Overlay Widget */}
                <div className="absolute -bottom-6 -right-4 md:right-8 bg-white/95 dark:bg-surface-950/95 backdrop-blur shadow-2xl rounded-2xl p-5 border border-primary-100 dark:border-surface-800 max-w-xs md:max-w-sm">
                  <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-gray-100 dark:border-surface-900 pb-1.5">
                    <Info size={13} className="text-primary-500" /> Anatomical Comfort Layers
                  </h4>
                  <div className="space-y-2">
                    {HERO_CAROUSEL[heroIndex].layers.map((layer, lIdx) => (
                      <div key={lIdx} className="flex justify-between items-center text-[10px] md:text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                        <span className="truncate pr-4">{layer.name}</span>
                        <span className="text-primary-500 bg-primary-50 dark:bg-surface-900 px-2 py-0.5 rounded font-mono text-[9px]">{layer.thickness}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots controller */}
          <div className="flex justify-center gap-2 mt-12">
            {HERO_CAROUSEL.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setHeroIndex(dotIdx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${heroIndex === dotIdx ? 'w-8 bg-primary-500' : 'w-2.5 bg-gray-300 dark:bg-surface-900'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 2. THE MATTRESS CATALOG SECTION (MATCHES SLEEPWELL IMAGES) ─── */}
      <section id="mattresses-catalog" className="py-20 bg-white dark:bg-surface-950 border-b border-gray-100 dark:border-surface-950">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-3">Mattresses</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              {filteredMattresses.length} Premium Products available
            </p>
            <p className="text-sm text-gray-500 leading-relaxed dark:text-gray-300">
              Our mattresses are designed to support your unique sleep preferences. With a range that includes pressure-relieving memory foam, natural resilient pocket spring cores, and highly aerated 3D latex mesh support — you will find exactly what you need for a restorative night's sleep.
            </p>
          </div>

          {/* Outline Filter Pills (Horizontal Scrollbar) */}
          <div className="flex justify-center overflow-x-auto pb-6 mb-10 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="flex border border-gray-200 dark:border-surface-900 rounded divide-x divide-gray-200 dark:divide-surface-900 bg-white dark:bg-surface-950 shadow-sm">
              {[
                { label: 'All Mattresses', val: '' },
                { label: 'King Size', val: 'King' },
                { label: 'Queen Size', val: 'Queen' },
                { label: 'Single Size', val: 'Single' },
                { label: 'Double Size', val: 'Double' },
                { label: 'Pocket Spring', val: 'Spring' },
                { label: 'Ortho Comfort', val: 'Ortho' }
              ].map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSubtype(pill.val)}
                  className={`px-5 py-3 text-xs font-bold whitespace-nowrap transition-colors tracking-tight ${
                    selectedSubtype === pill.val
                      ? 'bg-[#F8FAFC] text-primary-600 dark:bg-surface-900'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-Filters Toolbar (Mattress specs, Pincode, Compare) */}
          <div className="bg-[#F8FAFC] dark:bg-surface-950 border border-gray-100 dark:border-surface-900 rounded-2xl p-5 mb-8 flex flex-col lg:flex-row items-center justify-between gap-6 flex-wrap">
            {/* Spec Dropdowns */}
            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              {/* Length */}
              <div className="flex-1 min-w-[120px]">
                <select
                  value={lengthFilter}
                  onChange={e => setLengthFilter(e.target.value)}
                  className="w-full text-xs font-bold text-gray-700 bg-white dark:bg-surface-900 border border-gray-200 dark:border-surface-800 rounded px-3 py-2 outline-none focus:border-primary-500"
                >
                  <option value="">Mattress Length</option>
                  <option value="72">72 Inches</option>
                  <option value="75">75 Inches</option>
                  <option value="78">78 Inches</option>
                </select>
              </div>

              {/* Width */}
              <div className="flex-1 min-w-[120px]">
                <select
                  value={widthFilter}
                  onChange={e => setWidthFilter(e.target.value)}
                  className="w-full text-xs font-bold text-gray-700 bg-white dark:bg-surface-900 border border-gray-200 dark:border-surface-800 rounded px-3 py-2 outline-none focus:border-primary-500"
                >
                  <option value="">Mattress Width</option>
                  <option value="36">36 Inches (Single)</option>
                  <option value="48">48 Inches (Double)</option>
                  <option value="60">60 Inches (Queen)</option>
                  <option value="72">72 Inches (King)</option>
                </select>
              </div>

              {/* Thickness */}
              <div className="flex-1 min-w-[120px]">
                <select
                  value={thicknessFilter}
                  onChange={e => setThicknessFilter(e.target.value)}
                  className="w-full text-xs font-bold text-gray-700 bg-white dark:bg-surface-900 border border-gray-200 dark:border-surface-800 rounded px-3 py-2 outline-none focus:border-primary-500"
                >
                  <option value="">Thickness</option>
                  <option value="4">4 Inches</option>
                  <option value="5">5 Inches</option>
                  <option value="6">6 Inches</option>
                  <option value="8">8 Inches</option>
                </select>
              </div>
            </div>

            {/* Pincode and compare options */}
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
              {/* Pincode search */}
              <form onSubmit={handlePincodeCheck} className="flex bg-white dark:bg-surface-900 border border-gray-200 dark:border-surface-800 rounded overflow-hidden max-w-[240px] w-full">
                <input
                  type="text"
                  maxLength="6"
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  placeholder="Enter pincode"
                  className="px-3 py-2 text-xs font-bold outline-none bg-transparent w-full text-gray-700"
                />
                <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs px-4 py-2 border-l border-primary-500 transition-colors">
                  {pincodeStatus === 'checking' ? '...' : 'Check'}
                </button>
              </form>

              {/* Compare toggle */}
              <button
                onClick={() => {
                  setCompareEnabled(!compareEnabled);
                  toast.success(compareEnabled ? 'Compare mode disabled' : 'Compare mode enabled! Select mattresses to inspect.');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 border text-xs font-bold rounded transition-colors ${
                  compareEnabled
                    ? 'border-primary-600 bg-primary-50 text-primary-600 dark:bg-surface-900'
                    : 'border-gray-200 dark:border-surface-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                <span>Compare</span>
                <span className={`w-3.5 h-3.5 rounded-full border border-gray-400 flex items-center justify-center text-[8px] font-bold ${compareEnabled ? 'bg-primary-500 text-white border-primary-500' : ''}`}>
                  {compareEnabled ? '✓' : ''}
                </span>
              </button>

              {/* Sort by */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-bold">Sort by:</span>
                <select
                  value={sortOption}
                  onChange={e => setSortOption(e.target.value)}
                  className="text-xs font-bold text-gray-700 bg-white dark:bg-surface-900 border border-gray-200 dark:border-surface-800 rounded px-3 py-2 outline-none"
                >
                  <option value="best">Best Match</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mattress catalog list */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array(3).fill(null).map((_, i) => (
                <div key={i} className="card aspect-square animate-pulse bg-gray-100 dark:bg-surface-900 rounded-2xl" />
              ))}
            </div>
          ) : filteredMattresses.length === 0 ? (
            <div className="text-center py-16 bg-[#F8FAFC] dark:bg-surface-950 rounded-3xl border border-dashed border-gray-200 dark:border-surface-900">
              <span className="text-4xl block mb-2">🛏️</span>
              <h4 className="font-bold text-gray-800 dark:text-white mb-1">No Mattresses Match Selected Filters</h4>
              <p className="text-xs text-gray-400">Try adjusting your thickness, length, or subtype pill selectors.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredMattresses.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── 3. TABBED BEDDING MATERIALS SECTION (CUSHIONS, PILLOWS, COMFORTERS, PROTECTORS) ─── */}
      <section className="py-20 bg-gray-50 dark:bg-surface-950 border-b border-gray-150 dark:border-surface-950">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary-500 text-xs font-bold uppercase tracking-widest">SLEEP COMPLEMENTS</span>
            <h2 className="section-title mt-2">Bedding &amp; Sleep Accessories</h2>
            <p className="text-gray-500 mt-2">Complete your mattress setup with our highly engineered pillows, breathable protectors, and high-TC bedding accessories.</p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex justify-center border-b border-gray-200 dark:border-surface-900 mb-10 overflow-x-auto no-scrollbar">
            <div className="flex gap-2">
              {[
                { label: 'Luxury Pillows', val: 'pillow' },
                { label: 'Premium Cushions', val: 'cushion' },
                { label: 'All-Season Comforters', val: 'comforter' },
                { label: 'Protectors & Accessories', val: 'accessory' }
              ].map(tab => (
                <button
                  key={tab.val}
                  onClick={() => setOtherActiveTab(tab.val)}
                  className={`px-6 py-3 text-xs md:text-sm font-bold border-b-2 transition-all whitespace-nowrap tracking-tight ${
                    otherActiveTab === tab.val
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabbed Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(4).fill(null).map((_, i) => (
                <div key={i} className="card aspect-square animate-pulse bg-gray-100 dark:bg-surface-900 rounded-2xl" />
              ))}
            </div>
          ) : tabbedProducts.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-surface-950 border rounded-2xl">
              <span className="text-3xl block mb-2">☁️</span>
              <h4 className="font-bold text-gray-800 dark:text-white">No products found in this category</h4>
              <p className="text-xs text-gray-400 mt-1">Try exploring other luxury bedding options above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tabbedProducts.slice(0, 8).map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── 4. FRESHNAPS PROMISE & TESTIMONIALS ─── */}
      <section className="py-20 bg-surface-950 dark:bg-surface-950 text-white">
        <div className="container-custom">
          <div className="text-center mb-14">
            <span className="text-primary-400 text-xs font-bold uppercase tracking-widest">SLEEP SECURE</span>
            <h2 className="font-display text-4xl font-bold mt-2">The Freshnaps Sleep Promise</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Award,       iconColor: 'text-amber-400',  bg: 'bg-amber-400/10',  title: 'Premium Raw Materials',  desc: 'Contouring certified memory foams, natural GOLS latex, and organic cotton — only premium components.' },
              { icon: Truck,       iconColor: 'text-emerald-400', bg: 'bg-emerald-400/10', title: 'Fast Pan-India Delivery',   desc: 'Delivered securely in robust protective packaging in 3-5 business days.' },
              { icon: RotateCcw,   iconColor: 'text-blue-400',   bg: 'bg-blue-400/10',   title: '30-Night Trial & Returns',    desc: 'Hassle-free 30-night sleep trial. If you are not wowed, return it for a complete refund.' },
              { icon: BadgeCheck,  iconColor: 'text-primary-400',   bg: 'bg-primary-400/10',   title: 'Up to 10-Year Warranty', desc: 'Sleep with peace of mind. Every mattress is built to retain thickness and posture shape.' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="p-7 rounded-2xl bg-surface-900 dark:bg-surface-950 border border-surface-800 hover:border-primary-500/40 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-5`}>
                    <Icon size={22} className={item.iconColor} strokeWidth={1.8} />
                  </div>
                  <h3 className="font-semibold text-white text-base mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 5. SOCIAL REVIEWS & PROOF ─── */}
      <section className="py-20 bg-surface-100 dark:bg-surface-950/40">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-primary-500 text-xs font-bold uppercase tracking-widest">VERIFIED POSTURE RECOVERY</span>
            <h2 className="text-3xl font-bold mt-2">What RESTED Customers Say</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex gap-0.5 mb-3">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={14} className="text-primary-400 fill-primary-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed mb-6 font-sans">"{t.text}"</p>
                </div>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-xs text-gray-900 dark:text-white leading-none mb-1">{t.name}</p>
                    <p className="text-[10px] text-gray-400 leading-none">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. SLEEP SMART CLUB NEWSLETTER ─── */}
      <section className="py-20 bg-white dark:bg-surface-950">
        <div className="container-custom">
          <div className="relative rounded-3xl overflow-hidden bg-brand-gradient p-10 md:p-16 text-center shadow-brand-lg">
            <div className="relative z-10 max-w-xl mx-auto">
              <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold mb-4 uppercase tracking-wider">
                Freshnaps Sleep Club
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                Sleep Smarter With Us
              </h2>
              <p className="text-white/80 mb-8 text-sm md:text-base leading-relaxed">
                Subscribe to receive custom sleep ergonomics guides, seasonal bedding tips, and members-only product releases.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-5 py-3 rounded text-gray-900 placeholder-gray-400 outline-none text-sm"
                />
                <button type="submit" className="px-6 py-3 bg-surface-950 text-white font-semibold rounded hover:bg-surface-900 transition-colors text-sm">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
