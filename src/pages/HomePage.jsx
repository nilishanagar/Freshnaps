import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShoppingBag, ArrowRight, ChevronDown, ChevronLeft, Truck, RotateCcw, Shield, Award, BadgeCheck, Heart, Zap, Sparkles, HelpCircle, Eye, Info, Check, RefreshCw, X, BarChart3, Leaf } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { productService } from '../services';
import ProductCard from '../components/common/ProductCard';
import mattressLayer1 from '../assets/mattress-layers-1.png';
import mattressLayer2 from '../assets/mattress-layers-2.png';
import mattressLayer3 from '../assets/mattress-layers-3.png';

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

const MATTRESS_LAYERS = [
  {
    name: 'CloudComfort Memory Foam',
    tagline: 'Adaptive Pressure Relief System',
    image: mattressLayer1,
    layers: [
      { name: 'Breathable Knit Cover', thickness: '5mm', color: '#94a3b8' },
      { name: 'Cooling Gel Memory Foam', thickness: '40mm', color: '#7ED957' },
      { name: 'Transition Comfort Foam', thickness: '25mm', color: '#e2e8f0' },
      { name: 'Pocket Spring Core', thickness: '150mm', color: '#2F4EB4' },
      { name: 'High-Density Base Foam', thickness: '30mm', color: '#334155' },
    ]
  },
  {
    name: 'OrthoRest Pocket Spring',
    tagline: 'Zero Motion Transfer Technology',
    image: mattressLayer2,
    layers: [
      { name: 'Quilted Pillow-Top Cover', thickness: '15mm', color: '#f1f5f9' },
      { name: 'Gel-Infused Memory Foam', thickness: '35mm', color: '#0ea5e9' },
      { name: 'Natural Latex Layer', thickness: '20mm', color: '#fef3c7' },
      { name: 'Wrapped Pocket Springs', thickness: '160mm', color: '#64748b' },
      { name: 'Anti-Slip Base Fabric', thickness: '10mm', color: '#1e293b' },
    ]
  },
  {
    name: 'NaturalSleep Orthopedic',
    tagline: 'Multi-Layer Support Architecture',
    image: mattressLayer3,
    layers: [
      { name: 'Bamboo Fiber Cover', thickness: '8mm', color: '#86efac' },
      { name: 'HD Rebonded Foam', thickness: '30mm', color: '#fb923c' },
      { name: 'PU Foam Support', thickness: '50mm', color: '#f97316' },
      { name: 'Quilted PU Padding', thickness: '20mm', color: '#fde68a' },
      { name: 'Waterproof Base Layer', thickness: '5mm', color: '#3b82f6' },
    ]
  }
];

const LayerCarousel = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % MATTRESS_LAYERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const goTo = (idx) => { setActiveSlide(idx); setIsAutoPlaying(false); };
  const goPrev = () => { setActiveSlide(prev => (prev - 1 + MATTRESS_LAYERS.length) % MATTRESS_LAYERS.length); setIsAutoPlaying(false); };
  const goNext = () => { setActiveSlide(prev => (prev + 1) % MATTRESS_LAYERS.length); setIsAutoPlaying(false); };

  const slide = MATTRESS_LAYERS[activeSlide];

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
        >
          {/* Image Side */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary-100/30 via-transparent to-blue-100/30 dark:from-primary-900/10 dark:to-blue-900/10 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white dark:bg-surface-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-surface-800 overflow-hidden">
              <img
                src={slide.image}
                alt={slide.name}
                className="w-full h-[400px] object-contain rounded-xl"
              />
              {/* Floating badge */}
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 dark:bg-surface-900/90 backdrop-blur-sm rounded-full border border-gray-100 dark:border-surface-700 shadow-sm">
                <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">{activeSlide + 1} / {MATTRESS_LAYERS.length}</span>
              </div>
            </div>
          </div>

          {/* Details Side */}
          <div className="space-y-6">
            <div>
              <span className="text-primary-500 text-[10px] font-bold uppercase tracking-[0.2em] block mb-2">{slide.tagline}</span>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white">{slide.name}</h3>
            </div>

            {/* Layer Breakdown */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Layer Composition</span>
              <div className="space-y-2.5">
                {slide.layers.map((layer, i) => (
                  <motion.div
                    key={layer.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.35 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-surface-900/50 border border-gray-100 dark:border-surface-800 hover:border-primary-200 dark:hover:border-primary-800 transition-colors group/item"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex-shrink-0 shadow-sm ring-1 ring-black/5"
                      style={{ backgroundColor: layer.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 block">{layer.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-400 bg-white dark:bg-surface-900 px-2.5 py-1 rounded-md border border-gray-100 dark:border-surface-700 whitespace-nowrap">{layer.thickness}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Total thickness */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-surface-800">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Thickness</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {slide.layers.reduce((sum, l) => sum + parseInt(l.thickness), 0)}mm
              </span>
            </div>

            {/* CTA */}
            <Link
              to="/shop?category=mattress"
              className="inline-flex items-center gap-2 btn-primary px-6 py-3 text-xs font-bold rounded-xl"
            >
              Explore This Mattress <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-6 mt-10">
        {/* Prev */}
        <button onClick={goPrev} className="w-10 h-10 rounded-full border border-gray-200 dark:border-surface-700 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:border-primary-300 transition-all hover:shadow-md">
          <ChevronLeft size={18} />
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {MATTRESS_LAYERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                activeSlide === idx ? 'w-8 bg-primary-500' : 'w-2.5 bg-gray-300 dark:bg-surface-700 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Next */}
        <button onClick={goNext} className="w-10 h-10 rounded-full border border-gray-200 dark:border-surface-700 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:border-primary-300 transition-all hover:shadow-md">
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const ROYAL_URL = import.meta.env.VITE_ROYAL_MARWADI_URL || 'https://royalmarwadi.com';
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
  const [compareItems, setCompareItems] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const toggleCompareItem = (product) => {
    setCompareItems(prev => {
      const exists = prev.find(p => p._id === product._id);
      if (exists) return prev.filter(p => p._id !== product._id);
      if (prev.length >= 3) {
        toast.error('You can compare up to 3 mattresses at a time.');
        return prev;
      }
      return [...prev, product];
    });
  };

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
  }).sort((a, b) => {
    const priceA = a.discountPrice > 0 ? a.discountPrice : a.price;
    const priceB = b.discountPrice > 0 ? b.discountPrice : b.price;
    if (sortOption === 'low') return priceA - priceB;
    if (sortOption === 'high') return priceB - priceA;
    return 0; // 'best' — keep original order
  });

  // Filter Tabbed bedding materials
  const tabbedProducts = allProducts.filter(p => {
    const cat = p.category?.slug || p.categoryLegacy;
    if (otherActiveTab === 'accessories' || otherActiveTab === 'accessory') {
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
      <section id="mattresses-catalog" className="py-5 bg-white dark:bg-surface-950 border-b border-gray-100 dark:border-surface-900">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-2">
            <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-3">Our Premium <span className="text-transparent bg-clip-text bg-brand-gradient">Mattresses</span></h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              {filteredMattresses.length} Premium Products available
            </p>
            {/* <p className="text-sm text-gray-500 leading-relaxed dark:text-gray-300">
              Our mattresses are designed to support your unique sleep preferences. With a range that includes pressure-relieving memory foam, natural resilient pocket spring cores, and highly aerated 3D latex mesh support — you will find exactly what you need for a restorative night's sleep.
            </p> */}
          </div>

          {/* Outline Filter Pills (Horizontal Scrollbar) */}
          <div className="flex justify-center overflow-x-auto pb-6 mb-2 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="flex border border-gray-200 dark:border-surface-900 rounded divide-x divide-gray-200 dark:divide-surface-900 bg-white dark:bg-surface-950 shadow-sm">
              {[
                { label: 'All Mattresses', val: '' },
                { label: 'King Size', val: 'King' },
                { label: 'Queen Size', val: 'Queen' },
                { label: 'Single Size', val: 'Single' },
                { label: 'Double Size', val: 'Double' },
                { label: 'Pocket Spring', val: 'Spring' },
                { label: 'Ortho Comfort', val: 'Ortho' },
                { label: 'Custom Size', val: 'Custom' }
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

          {/* Custom Size Input Fields (shown when Custom Size tab is active) */}
          {selectedSubtype === 'Custom' && (
            <div className="bg-[#F8FAFC] dark:bg-surface-950 border border-gray-100 dark:border-surface-900 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center gap-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Enter Your Size:</span>
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="flex-1 min-w-[100px]">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Height (inches)</label>
                  <input
                    type="number"
                    value={lengthFilter}
                    onChange={e => setLengthFilter(e.target.value)}
                    placeholder="e.g. 75"
                    className="w-full text-xs font-bold text-gray-700 bg-white dark:bg-surface-900 border border-gray-200 dark:border-surface-800 rounded px-3 py-2 outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
                <div className="flex-1 min-w-[100px]">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Width (inches)</label>
                  <input
                    type="number"
                    value={widthFilter}
                    onChange={e => setWidthFilter(e.target.value)}
                    placeholder="e.g. 60"
                    className="w-full text-xs font-bold text-gray-700 bg-white dark:bg-surface-900 border border-gray-200 dark:border-surface-800 rounded px-3 py-2 outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
                <div className="flex-1 min-w-[100px]">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Thickness (inches)</label>
                  <input
                    type="number"
                    value={thicknessFilter}
                    onChange={e => setThicknessFilter(e.target.value)}
                    placeholder="e.g. 6"
                    className="w-full text-xs font-bold text-gray-700 bg-white dark:bg-surface-900 border border-gray-200 dark:border-surface-800 rounded px-3 py-2 outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={() => { setLengthFilter(''); setWidthFilter(''); setThicknessFilter(''); }}
                className="text-xs font-bold text-gray-400 hover:text-primary-500 transition-colors whitespace-nowrap"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Sub-Filters Toolbar (Pincode, Compare, Sort — only when NOT Custom Size) */}
          {selectedSubtype !== 'Custom' && (
            <div className="bg-[#F8FAFC] dark:bg-surface-950 border border-gray-100 dark:border-surface-900 rounded-2xl p-3 mb-4 flex flex-col lg:flex-row items-center justify-between gap-6 flex-wrap">
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
                    const next = !compareEnabled;
                    setCompareEnabled(next);
                    if (!next) setCompareItems([]);
                    toast.success(next ? 'Compare mode enabled! Select mattresses to compare.' : 'Compare mode disabled');
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
          )}

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
            <>
            <div className="flex justify-end mb-4">
              <Link to="/shop?category=mattress" className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-500 transition-colors">
                Shop More <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredMattresses.slice(0, 8).map(product => (
                <div key={product._id} className="relative">
                  {compareEnabled && (
                    <button
                      onClick={() => toggleCompareItem(product)}
                      className={`absolute top-3 right-12 z-20 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
                        compareItems.find(p => p._id === product._id)
                          ? 'bg-primary-500 text-white scale-110'
                          : 'bg-white text-gray-400 hover:bg-primary-50 hover:text-primary-500'
                      }`}
                      title={compareItems.find(p => p._id === product._id) ? 'Remove from compare' : 'Add to compare'}
                    >
                      {compareItems.find(p => p._id === product._id) ? <Check size={13} /> : <BarChart3 size={13} />}
                    </button>
                  )}
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Compare Sticky Bottom Bar — Visible while selecting products */}
            <AnimatePresence>
              {compareEnabled && compareItems.length > 0 && !showCompareModal && (
                <motion.div
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 80, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-surface-950/95 backdrop-blur-lg border-t border-gray-200 dark:border-surface-800 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-4 md:px-8 py-4"
                >
                  <div className="container-custom flex items-center justify-between gap-4 flex-wrap">
                    {/* Selected Items Preview */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                        <BarChart3 size={18} className="text-primary-500" />
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {compareItems.map((item) => (
                          <div key={item._id} className="flex items-center gap-2 bg-[#F8FAFC] dark:bg-surface-900 border border-gray-100 dark:border-surface-800 rounded-xl px-3 py-2 flex-shrink-0">
                            <img
                              src={item.images?.[0]?.url || item.images?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400'}
                              alt={item.name}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-200 max-w-[100px] truncate">{item.name}</span>
                            <button
                              onClick={() => toggleCompareItem(item)}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                        {compareItems.length < 3 && (
                          <div className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-gray-300 dark:border-surface-700 rounded-xl text-[11px] font-semibold text-gray-400 flex-shrink-0">
                            <BarChart3 size={12} /> Add {3 - compareItems.length} more
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[11px] font-bold text-gray-400">{compareItems.length} of 3</span>
                      <button
                        onClick={() => setShowCompareModal(true)}
                        disabled={compareItems.length < 2}
                        className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all ${
                          compareItems.length >= 2
                            ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5 active:scale-[0.98]'
                            : 'bg-gray-100 dark:bg-surface-800 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Compare Now
                      </button>
                      <button
                        onClick={() => { setCompareItems([]); setCompareEnabled(false); }}
                        className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-surface-800 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Compare Modal Overlay — Opens only when user clicks "Compare Now" */}
            <AnimatePresence>
              {showCompareModal && compareItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-surface-950/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
                  onClick={() => setShowCompareModal(false)}
                >
                  <motion.div
                    initial={{ y: 40, opacity: 0, scale: 0.97 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 40, opacity: 0, scale: 0.97 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-5xl max-h-[90vh] bg-white dark:bg-surface-950 rounded-3xl shadow-2xl border border-gray-100 dark:border-surface-800 overflow-hidden flex flex-col"
                  >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-gray-100 dark:border-surface-800 bg-[#F8FAFC] dark:bg-surface-950/80 flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center">
                          <BarChart3 size={18} className="text-primary-500" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Compare Mattresses</h3>
                          <p className="text-[11px] text-gray-400 font-medium">{compareItems.length} of 3 selected</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowCompareModal(false)}
                        className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-surface-800 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto flex-1 p-6 md:p-8">
                      {/* Product Header Cards */}
                      <div className={`grid gap-5 mb-8 ${compareItems.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : compareItems.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                        {compareItems.map((item, idx) => {
                          const hasDiscount = item.discountPrice > 0;
                          const displayPrice = hasDiscount ? item.discountPrice : item.price;
                          const discountPct = hasDiscount ? Math.round(((item.price - item.discountPrice) / item.price) * 100) : 0;
                          return (
                            <div key={item._id} className="relative bg-[#F8FAFC] dark:bg-surface-900/50 rounded-2xl border border-gray-100 dark:border-surface-800 overflow-hidden group">
                              {/* Remove Button */}
                              <button
                                onClick={() => toggleCompareItem(item)}
                                className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white dark:bg-surface-800 shadow-sm flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                              >
                                <X size={12} />
                              </button>

                              {/* Product Number Badge */}
                              <div className="absolute top-3 left-3 z-10 w-6 h-6 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                                {idx + 1}
                              </div>

                              {/* Product Image */}
                              <div className="w-full aspect-[4/3] bg-white dark:bg-surface-900 overflow-hidden">
                                <img
                                  src={item.images?.[0]?.url || item.images?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400'}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>

                              {/* Product Info */}
                              <div className="p-4">
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-tight mb-1 line-clamp-2">{item.name}</h4>
                                
                                {/* Rating */}
                                {item.rating > 0 && (
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <div className="flex items-center gap-0.5">
                                      {[1,2,3,4,5].map(s => (
                                        <Star key={s} size={11} className={s <= Math.round(item.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-surface-700'} />
                                      ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500">{item.rating.toFixed(1)}</span>
                                  </div>
                                )}

                                {/* Price */}
                                <div className="flex items-baseline gap-2 flex-wrap">
                                  <span className="text-lg font-bold text-gray-900 dark:text-white">₹{displayPrice.toLocaleString('en-IN')}</span>
                                  {hasDiscount && (
                                    <>
                                      <span className="text-xs text-gray-400 line-through">₹{item.price.toLocaleString('en-IN')}</span>
                                      <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400 px-1.5 py-0.5 rounded">{discountPct}% OFF</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Specification Comparison Grid */}
                      <div className="rounded-2xl border border-gray-100 dark:border-surface-800 overflow-hidden">
                        <div className="bg-[#F8FAFC] dark:bg-surface-900/50 px-5 py-3 border-b border-gray-100 dark:border-surface-800">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detailed Specifications</span>
                        </div>

                        {[
                          {
                            label: 'Price',
                            icon: '💰',
                            render: (item) => {
                              const hasDiscount = item.discountPrice > 0;
                              const dp = hasDiscount ? item.discountPrice : item.price;
                              return <span className="font-bold text-gray-900 dark:text-white">₹{dp.toLocaleString('en-IN')}</span>;
                            }
                          },
                          {
                            label: 'Rating',
                            icon: '⭐',
                            render: (item) => (
                              <div className="flex items-center gap-1.5">
                                <div className="flex gap-0.5">
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} size={10} className={s <= Math.round(item.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-surface-700'} />
                                  ))}
                                </div>
                                <span className="font-bold text-gray-700 dark:text-gray-300">{item.rating?.toFixed(1) || 'N/A'}</span>
                              </div>
                            )
                          },
                          {
                            label: 'Material',
                            icon: '🧱',
                            render: (item) => <span className="capitalize">{item.material || item.tags?.find(t => t.toLowerCase() !== 'mattress') || '—'}</span>
                          },
                          {
                            label: 'Warranty',
                            icon: '🛡️',
                            render: (item) => <span className="capitalize">{item.warranty || item.features?.find(f => f.toLowerCase().includes('warranty')) || '—'}</span>
                          },
                          {
                            label: 'Available Sizes',
                            icon: '📐',
                            render: (item) => {
                              const sizes = item.variants?.map(v => v.size).filter(Boolean) || [];
                              return sizes.length > 0
                                ? <div className="flex flex-wrap gap-1">{sizes.map((s, i) => <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-surface-800 rounded text-[10px] font-semibold text-gray-600 dark:text-gray-300">{s}</span>)}</div>
                                : <span className="text-gray-400">—</span>;
                            }
                          },
                          {
                            label: 'Discount',
                            icon: '🏷️',
                            render: (item) => {
                              if (item.discountPrice > 0) {
                                const saved = item.price - item.discountPrice;
                                return <span className="font-bold text-green-600 dark:text-green-400">Save ₹{saved.toLocaleString('en-IN')}</span>;
                              }
                              return <span className="text-gray-400">No discount</span>;
                            }
                          }
                        ].map((spec, rowIdx) => (
                          <div key={spec.label} className={`grid ${compareItems.length === 1 ? 'grid-cols-2' : compareItems.length === 2 ? 'grid-cols-3' : 'grid-cols-4'} border-b border-gray-50 dark:border-surface-800 last:border-b-0 ${rowIdx % 2 === 0 ? 'bg-white dark:bg-surface-950' : 'bg-[#FAFBFC] dark:bg-surface-900/30'}`}>
                            {/* Label Column */}
                            <div className="px-5 py-3.5 flex items-center gap-2">
                              <span className="text-sm">{spec.icon}</span>
                              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{spec.label}</span>
                            </div>
                            {/* Value Columns */}
                            {compareItems.map(item => (
                              <div key={item._id} className="px-5 py-3.5 flex items-center text-xs text-gray-700 dark:text-gray-300">
                                {spec.render(item)}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className={`grid gap-4 mt-6 ${compareItems.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : compareItems.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                        {compareItems.map(item => (
                          <Link
                            key={item._id}
                            to={`/product/${item.slug}`}
                            onClick={() => { setCompareItems([]); setCompareEnabled(false); setShowCompareModal(false); }}
                            className="flex items-center justify-center gap-2 px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl transition-all shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5 active:scale-[0.98]"
                          >
                            <Eye size={14} /> View {item.name.split(' ')[0]}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            </>
          )}
        </div>
      </section>

      {/* ─── MATTRESS LAYER TECHNOLOGY CAROUSEL ─── */}
      <section className="py-2 bg-gradient-to-b from-[#f0fdf4] via-white to-[#F8FAFC] dark:from-surface-950 dark:via-surface-950 dark:to-surface-950 border-b border-gray-100 dark:border-surface-900 overflow-hidden">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-surface-900 text-primary-600 dark:text-primary-400 text-[10px] font-bold uppercase tracking-widest">
              <Sparkles size={12} className="fill-primary-500" /> Engineering Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white leading-tight">
              What's Inside Our <span className="text-transparent bg-clip-text bg-brand-gradient">Mattresses</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Every FreshNaps mattress is built layer by layer with precision-engineered materials for optimal support, breathability, and lasting comfort.
            </p>
          </div>
 
          {/* Carousel */}
          <LayerCarousel />
        </div>
      </section>

      {/* ─── 3. TABBED BEDDING MATERIALS SECTION (CUSHIONS, PILLOWS, COMFORTERS, PROTECTORS) ─── */}
      <section className="py-16 bg-gradient-to-b from-[#eff6ff] via-white to-gray-50 dark:from-surface-950 dark:via-surface-950 dark:to-surface-950 border-b border-gray-100 dark:border-surface-900">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-primary-500 text-xs font-bold uppercase tracking-widest">SLEEP COMPLEMENTS</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white mt-2">Pillows, Bedding &amp; <span className="text-transparent bg-clip-text bg-brand-gradient">Accessories</span></h2>
            <p className="text-gray-500 mt-2">Complete your mattress setup with our highly engineered pillows, breathable protectors, and high-TC bedding accessories.</p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex justify-center mb-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-2">
              {[
                { label: 'Pillows', val: 'pillow' },
                { label: 'Cushions', val: 'cushion' },
                { label: 'Comforters', val: 'comforter' },
                { label: 'Bedsheets', val: 'bedsheet' },
                { label: 'Protectors & Accessories', val: 'accessories' }
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
            <>
            <div className="flex justify-end mb-4">
              <Link
                to={otherActiveTab === 'accessories' ? '/shop?category=accessory' : `/shop?category=${otherActiveTab}`}
                className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-500 transition-colors"
              >
                Shop More <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tabbedProducts.slice(0, 8).map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            </>
          )}
        </div>
      </section>

      {/* ─── 4. FRESHNAPS PROMISE & TESTIMONIALS ─── */}
      <section className="relative py-20 bg-[#EBEFFA] dark:bg-surface-950 border-b border-gray-200 dark:border-surface-900 overflow-hidden">
        {/* Botanical leaf silhouette like reference image */}
        <div className="absolute right-0 bottom-0 top-0 w-64 pointer-events-none opacity-[0.04] dark:opacity-[0.02] hidden lg:block overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full object-contain translate-x-12 translate-y-6" fill="currentColor">
            <path d="M70,10 C65,15 62,25 64,35 C66,45 72,52 80,55 C70,55 60,48 56,40 C52,32 53,20 58,12 L70,10 Z M50,30 C45,35 42,43 44,51 C46,59 51,65 58,67 C50,67 42,62 39,55 C36,48 37,38 41,32 L50,30 Z M30,50 C26,54 24,61 25,67 C26,73 30,78 35,80 C29,80 23,76 21,70 C19,64 20,56 23,51 L30,50 Z" />
          </svg>
        </div>

        <div className="container-custom relative z-10">
          <div className="text-center mb-8">
            <span className="text-[#2F4EB4] dark:text-primary-400 text-xs font-bold uppercase tracking-widest">SLEEP SECURE</span>
            <h2 className="font-display text-4xl font-bold mt-2 text-surface-900 dark:text-white">The Freshnaps Sleep <span className="text-transparent bg-clip-text bg-brand-gradient">Promise</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {[
              { icon: Award,       title: 'Premium Raw Materials',  desc: 'Contouring certified memory foams, natural GOLS latex, and organic cotton — only premium components.' },
              { icon: Truck,       title: 'Fast Pan-India Delivery',   desc: 'Delivered securely in robust protective packaging in 3-5 business days.' },
              { icon: RotateCcw,   title: '30-Night Trial & Returns',    desc: 'Hassle-free 30-night sleep trial. If you are not wowed, return it for a complete refund.' },
              { icon: BadgeCheck,  title: 'Up to 10-Year Warranty', desc: 'Sleep with peace of mind. Every mattress is built to retain thickness and posture shape.' },
              { icon: Sparkles,    title: '25 Years Experience', desc: 'Over two decades of craftsmanship, refining sleep ergonomics to deliver the absolute ultimate rest experience.' }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center text-center p-4 group"
                >
                  {/* Organic green water-paint blob icon background */}
                  <div className="relative w-18 h-18 flex items-center justify-center mb-6">
                    <div className="absolute inset-0 bg-[#7ED957]/20 dark:bg-primary-500/10 rounded-full scale-105 group-hover:scale-110 transition-transform duration-300"
                         style={{
                           borderRadius: '60% 40% 55% 45% / 45% 55% 40% 60%'
                         }}
                    />
                    <Icon size={30} className="relative text-surface-900 dark:text-primary-400 group-hover:scale-105 transition-transform duration-300" strokeWidth={1.8} />
                  </div>
                  <h3 className="font-display text-base font-bold text-surface-900 dark:text-white mb-2 tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{item.title}</h3>
                  <p className="text-gray-500 dark:text-gray-300 text-xs md:text-sm leading-relaxed font-sans">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* ─── 5. SOCIAL REVIEWS & PROOF ─── */}
      <section className="py-20 bg-surface-100 dark:bg-surface-950/40 border-b border-gray-100 dark:border-surface-900">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-primary-500 text-xs font-bold uppercase tracking-widest">REAL SLEEPERS, REAL COMFORT</span>
            <h2 className="text-3xl font-display font-bold mt-2 text-gray-900 dark:text-white">Waking Up <span className="text-transparent bg-clip-text bg-brand-gradient">Refreshed</span>, Every Single Day</h2>
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

      {/* ─── Royal Marwadi Furniture Experience Section ─── */}
      <section className="py-24 bg-[#FDFBF7] dark:bg-surface-900/40 border-y border-gray-200/50 dark:border-surface-900">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Text & Premium Category Grid (lg:col-span-6) */}
            <div className="lg:col-span-6 space-y-8 text-left">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 text-[10px] font-bold uppercase tracking-wider mb-4 border border-primary-200/50 dark:border-primary-900/30">
                  <Leaf size={11} className="fill-primary-700 dark:fill-primary-300" /> FLAGSHIP COLLABORATION
                </span>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-gray-900 dark:text-white leading-tight">
                  Exquisite Furniture. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">Handcrafted for Your Home.</span>
                </h2>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
                  Freshnaps has partnered with <strong>Royal Marwadi</strong> to bring you premium, hand-carved solid wood furniture. From heirloom-quality bed frames designed to hold your mattress perfectly, to custom wardrobes and luxury seating.
                </p>
              </div>

              {/* Minimalist Grid List */}
              <div className="grid grid-cols-2 gap-6 border-t border-gray-200/60 dark:border-surface-800 pt-6">
                <div>
                  <span className="text-[10px] font-extrabold text-primary-500 uppercase tracking-wider">01 / Beds &amp; Frames</span>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-1">Solid Wood Beds</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-normal">Premium Teak &amp; Sheesham wood bed frames.</p>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-primary-500 uppercase tracking-wider">02 / Seating Comfort</span>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-1">Luxury Sofas</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-normal">Customizable fabric &amp; leather sofas.</p>
                </div>
                <div className="border-t border-gray-100 dark:border-surface-800/50 pt-4">
                  <span className="text-[10px] font-extrabold text-primary-500 uppercase tracking-wider">03 / Storage Systems</span>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-1">Wardrobes &amp; Cabinets</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-normal">Bedside storage drawers and custom closets.</p>
                </div>
                <div className="border-t border-gray-100 dark:border-surface-800/50 pt-4">
                  <span className="text-[10px] font-extrabold text-primary-500 uppercase tracking-wider">04 / Dining &amp; Tables</span>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-1">Dining Sets</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-normal">Handmade wooden dining tables and chairs.</p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={ROYAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#A75D46] to-[#D58C73] text-white font-extrabold text-sm uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_14px_rgba(167,93,70,0.2)] hover:shadow-[0_8px_30px_rgba(167,93,70,0.35)] hover:-translate-y-0.5 active:scale-95"
                >
                  Explore Royal Marwadi Showroom <ArrowRight size={16} />
                </a>
              </div>
            </div>

            {/* Right Column: Overlapping Editorial Collage (lg:col-span-6) */}
            <div className="lg:col-span-6 relative h-[500px] flex items-center justify-center mt-12 lg:mt-0">
              
              {/* Back Image (Left side) */}
              <div className="absolute left-4 top-0 w-[60%] aspect-[3/4] rounded-3xl overflow-hidden shadow-xl border border-white/20 dark:border-surface-800 z-10 -rotate-3 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800" 
                  alt="Royal Marwadi Showroom Bedroom" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Front Overlapping Image (Right side) */}
              <div className="absolute right-4 bottom-0 w-[55%] aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-surface-800 z-20 translate-y-4 translate-x-2 rotate-3 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800" 
                  alt="Teakwood Frame Detail" 
                  className="w-full h-full object-cover"
                />
                
                {/* Floating dark glassmorphic label */}
                <div className="absolute inset-x-4 bottom-4 bg-black/60 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl text-left text-white">
                  <p className="text-[9px] uppercase tracking-wider font-extrabold text-primary-400">Experience Store</p>
                  <h4 className="text-xs font-bold mt-0.5">Explore Royal Marwadi in Sawai Madhopur</h4>
                </div>
              </div>
              
            </div>

          </div>
        </div>
      </section>

      {/* ─── 6. FRESHNAPS COMMUNITY & SUPPORT HUB ─── */}
      <section className="py-20 bg-white dark:bg-surface-950 border-b border-gray-100 dark:border-surface-900">
        <div className="container-custom">
          <div className="relative rounded-3xl overflow-hidden bg-brand-gradient p-8 md:p-16 text-white shadow-brand-xl">
            {/* Soft decorative background leaf accents */}
            <div className="absolute right-0 bottom-0 top-0 w-80 pointer-events-none opacity-[0.04] dark:opacity-[0.02] hidden lg:block overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-full h-full object-contain translate-x-12 translate-y-6" fill="currentColor">
                <path d="M70,10 C65,15 62,25 64,35 C66,45 72,52 80,55 C70,55 60,48 56,40 C52,32 53,20 58,12 L70,10 Z M50,30 C45,35 42,43 44,51 C46,59 51,65 58,67 C50,67 42,62 39,55 C36,48 37,38 41,32 L50,30 Z M30,50 C26,54 24,61 25,67 C26,73 30,78 35,80 C29,80 23,76 21,70 C19,64 20,56 23,51 L30,50 Z" />
              </svg>
            </div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch divide-y lg:divide-y-0 lg:divide-x divide-white/10">
              
              {/* Left Side (Primary CTA: WhatsApp Channel) */}
              <div className="flex flex-col justify-between items-start text-left h-full">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-primary-300 text-[10px] font-bold uppercase tracking-wider mb-6">
                    <Sparkles size={11} className="fill-primary-300 animate-pulse" /> FRESHNAPS COMMUNITY
                  </span>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 text-white leading-tight">
                    Stay Updated With <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-white">FreshNaps</span>
                  </h2>
                  <p className="text-white/80 text-sm md:text-base mb-8 max-w-md leading-relaxed">
                    Be the first to know about new product launches, exclusive offers, sleep wellness tips, and special member updates.
                  </p>
                </div>
                
                <div className="w-full">
                  <a
                    href="https://whatsapp.com/channel/0029VaF123456789"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-surface-950 hover:bg-gray-100 font-extrabold text-sm uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] hover:-translate-y-0.5"
                  >
                    {/* WhatsApp SVG logo */}
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366] text-[#25D366]" fill="currentColor">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.733-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.623-1.023-5.086-2.885-6.948C16.63 2.007 14.175.982 11.558.982 6.13.982 1.705 5.353 1.7 10.783c-.002 1.626.431 3.218 1.252 4.63l-.995 3.635 3.738-.979z" />
                    </svg>
                    Join WhatsApp Channel
                  </a>
                  <span className="text-white/60 text-[11px] font-semibold mt-3 block">
                    No spam. Only important updates and product announcements.
                  </span>
                </div>
              </div>

              {/* Right Side (Support CTA) */}
              <div className="flex flex-col justify-between items-start text-left h-full pt-10 lg:pt-0 lg:pl-12 xl:pl-16">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-primary-300 text-[10px] font-bold uppercase tracking-wider mb-6">
                    <HelpCircle size={11} className="text-primary-300" /> NEED HELP?
                  </span>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 text-white leading-tight">
                    Not Sure Which <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-white">Mattress</span> Is Right For You?
                  </h2>
                  <p className="text-white/80 text-sm md:text-base mb-8 max-w-md leading-relaxed">
                    Our sleep experts can help you find the perfect mattress based on your comfort preferences, sleeping position, and budget.
                  </p>
                </div>
                
                <div className="w-full">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2.5 px-8 py-4 border-2 border-white/30 hover:border-white text-white hover:bg-white/10 font-extrabold text-sm uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] hover:-translate-y-0.5"
                  >
                    {/* Customer Support headphones SVG icon */}
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                    </svg>
                    Contact Us
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
