import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShoppingBag, ArrowRight, ChevronDown, ChevronLeft, Truck, RotateCcw, Shield, Award, BadgeCheck, Heart, Zap, Sparkles, HelpCircle, Eye, Info, Check, RefreshCw } from 'lucide-react';
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
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
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
            <h2 className="section-title mt-2">Pillows, Bedding &amp; <span className="text-transparent bg-clip-text bg-brand-gradient">Accessories</span></h2>
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
                    Stay Updated With FreshNaps
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
                    Not Sure Which Mattress Is Right For You?
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
