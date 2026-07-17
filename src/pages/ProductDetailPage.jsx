import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Minus, Plus, ChevronRight, ArrowRight, Heart,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { productService, userService } from '../services';
import { setCurrentProduct, setRelatedProducts } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlistItem } from '../store/slices/wishlistSlice';
import ProductCard from '../components/common/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LoginPromptModal from '../components/common/LoginPromptModal';
import SEOHead, { buildProductSchema, buildBreadcrumbSchema } from '../components/common/SEOHead';
import toast from 'react-hot-toast';
import { calculateFreshNapsPrice } from '../utils/pricingUtils';

// ─── Product Sub-Components ───
import ImageGallery from '../components/product/ImageGallery';
import ProductInfo from '../components/product/ProductInfo';
import PricingSection from '../components/product/PricingSection';
import DeliveryChecker from '../components/product/DeliveryChecker';
import OffersSection from '../components/product/OffersSection';
import ProductUSPs from '../components/product/ProductUSPs';
import VariantSelector from '../components/product/VariantSelector';
import CustomSizeConfig from '../components/product/CustomSizeConfig';
import ProductAccordion from '../components/product/ProductAccordion';
import FrequentlyBoughtTogether from '../components/product/FrequentlyBoughtTogether';
import TrustBadges from '../components/product/TrustBadges';
import ReviewSection from '../components/product/ReviewSection';
import FAQSection from '../components/product/FAQSection';
import StickyPurchaseBar from '../components/product/StickyPurchaseBar';
import SectionHeading from '../components/product/SectionHeading';

/* ═══════════════════════════════════════════════════════
   PRODUCT DETAIL PAGE — Frido-Inspired Layout
   ═══════════════════════════════════════════════════════ */
const ProductDetailPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct: product, relatedProducts } = useSelector(s => s.products);
  const wishlist = useSelector(s => s.wishlist.items);
  const { user } = useSelector(s => s.auth);

  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Login prompt modal state
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptAction, setLoginPromptAction] = useState('wishlist');

  // Custom Size (mattress)
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [customLength, setCustomLength] = useState('');
  const [customWidth, setCustomWidth] = useState('');
  const [customThickness, setCustomThickness] = useState('');
  const [activePreset, setActivePreset] = useState(null);

  // ─── Fetch Data ───
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prod, related] = await Promise.all([
          productService.getBySlug(slug),
          productService.getRelated(slug),
        ]);
        dispatch(setCurrentProduct(prod.data.product));
        dispatch(setRelatedProducts(related.data.products));
        if (prod.data.product.variants?.length > 0) setSelectedVariant(prod.data.product.variants[0]);
        setActiveImg(0);
        setIsCustomSize(false);
        setCustomLength('');
        setCustomWidth('');
        setCustomThickness('');
        setActivePreset(null);
        setQuantity(1);
      } catch {
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [slug, dispatch, navigate]);

  // ─── Loading / Not Found ───
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-surface-950">
      <LoadingSpinner size="xl" />
      <p className="text-sm text-gray-400 font-medium animate-pulse">Loading product details...</p>
    </div>
  );
  if (!product) return null;

  // ─── Derived ───
  const isWishlisted = wishlist.includes(product._id);
  const hasDiscount = product.discountPrice > 0;
  const isMattress = (product.category?.slug || product.categoryLegacy || product.category) === 'mattress';
  const categorySlug = product.category?.slug || product.categoryLegacy || product.category || '';

  // ─── Mattress Volume-Based Pricing ───
  // product.price = MRP for reference 72×72×5
  // product.discountPrice = selling price for reference 72×72×5
  // For mattresses: prices are computed dynamically via calculateFreshNapsPrice()
  // For non-mattresses: use standard product pricing

  let displayPrice, basePrice, discountPct;

  if (isMattress && selectedVariant?.price) {
    // Variant price is already the calculated MRP-based price from VariantSelector
    const variantMRP = selectedVariant.price;
    // If product has a discount, calculate the same proportional discount on the variant price
    if (hasDiscount) {
      const discountRatio = (product.price - product.discountPrice) / product.price;
      displayPrice = Math.round(variantMRP * (1 - discountRatio));
      basePrice = variantMRP;
      discountPct = Math.round(discountRatio * 100);
    } else {
      displayPrice = variantMRP;
      basePrice = variantMRP;
      discountPct = 0;
    }
  } else if (isMattress && isCustomSize && customLength && customWidth && customThickness) {
    // Custom size: calculate from entered dimensions
    const customMRP = calculateFreshNapsPrice(product.price, Number(customLength), Number(customWidth), Number(customThickness));
    if (hasDiscount) {
      const discountRatio = (product.price - product.discountPrice) / product.price;
      displayPrice = Math.round(customMRP * (1 - discountRatio));
      basePrice = customMRP;
      discountPct = Math.round(discountRatio * 100);
    } else {
      displayPrice = customMRP;
      basePrice = customMRP;
      discountPct = 0;
    }
  } else {
    // Non-mattress or fallback
    basePrice = selectedVariant?.price || product.price;
    const discountAmount = hasDiscount ? (product.price - product.discountPrice) : 0;
    displayPrice = selectedVariant?.price
      ? (selectedVariant.price - discountAmount)
      : (hasDiscount ? product.discountPrice : product.price);
    discountPct = hasDiscount ? Math.round(discountAmount / product.price * 100) : 0;
  }

  const discountAmount = hasDiscount ? (basePrice - displayPrice) : 0;

  // ─── Handlers ───
  const handleAddToCart = () => {
    if (isCustomSize && isMattress) {
      if (!customLength || !customWidth || !customThickness) {
        toast.error('Please enter length, width, and thickness for custom size');
        return;
      }
      // Calculate the selling price for custom dimensions
      const customMRP = calculateFreshNapsPrice(product.price, Number(customLength), Number(customWidth), Number(customThickness));
      let customSellingPrice = customMRP;
      if (hasDiscount) {
        const discountRatio = (product.price - product.discountPrice) / product.price;
        customSellingPrice = Math.round(customMRP * (1 - discountRatio));
      }
      dispatch(addToCart({
        product, quantity,
        variant: {
          size: `Custom (${customLength}×${customWidth}×${customThickness} in)`,
          price: customSellingPrice,
          isCustom: true, customLength: Number(customLength), customWidth: Number(customWidth), customThickness: Number(customThickness),
        },
      }));
    } else if (isMattress && selectedVariant) {
      // Standard mattress size — use the dynamically-calculated price from variant
      dispatch(addToCart({
        product, quantity,
        variant: {
          ...selectedVariant,
          price: displayPrice,  // selling price (with discount applied)
          priceCalculated: true, // flag: price is final, don't subtract discount again
          customLength: selectedVariant.customLength,
          customWidth: selectedVariant.customWidth,
          customThickness: selectedVariant.customThickness,
        },
      }));
    } else {
      dispatch(addToCart({ product, quantity, variant: selectedVariant }));
    }
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    if (!user) {
      setLoginPromptAction('buy');
      setShowLoginPrompt(true);
      return;
    }
    handleAddToCart();
    navigate('/checkout');
  };

  const handleWishlist = async () => {
    if (!user) {
      setLoginPromptAction('wishlist');
      setShowLoginPrompt(true);
      return;
    }
    dispatch(toggleWishlistItem(product._id));
    try {
      await userService.toggleWishlist(product._id);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
    } catch {
      dispatch(toggleWishlistItem(product._id));
      toast.error('Failed to sync wishlist');
    }
  };

  // ═══════════════════════════════════════════════════════
  //  SEO — dynamic per-product meta tags + structured data
  // ═══════════════════════════════════════════════════════
  const productImage = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || '';
  const productSeoTitle = product.seo?.metaTitle || product.name;
  const productSeoDesc = product.seo?.metaDescription || product.shortDescription || `Buy ${product.name} at Freshnaps. Premium quality with free shipping, 30-day returns & 2-year warranty.`;
  const categoryName = product.category?.name || categorySlug;
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    { name: categoryName, url: `/shop?category=${categorySlug}` },
    { name: product.name },
  ];

  // ═══════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-white dark:bg-surface-950 pb-20">
      <SEOHead
        title={productSeoTitle}
        description={productSeoDesc}
        path={`/product/${product.slug}`}
        ogImage={productImage}
        ogType="product"
        keywords={`${product.name}, ${categoryName}, buy ${product.name} online, freshnaps ${categoryName}`}
        canonicalUrl={product.seo?.canonicalUrl || ''}
        jsonLd={[buildProductSchema(product), buildBreadcrumbSchema(breadcrumbItems)]}
      />

      {/* ─── Breadcrumb ─── */}
      <div className="border-b border-gray-100 dark:border-surface-800 bg-gray-50 dark:bg-surface-900">
        <div className="container-custom py-2.5">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors font-medium">Home</Link>
            <ChevronRight size={11} className="text-gray-400 dark:text-gray-500" />
            <Link to="/shop" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors font-medium">Shop</Link>
            <ChevronRight size={11} className="text-gray-400 dark:text-gray-500" />
            <Link to={`/shop?category=${categorySlug}`} className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors font-medium capitalize">{product.category?.name || categorySlug}</Link>
            <ChevronRight size={11} className="text-gray-400 dark:text-gray-500" />
            <span className="text-gray-800 dark:text-gray-100 font-semibold truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
           HERO SECTION — Frido Layout
         ═══════════════════════════════════════════════════ */}
      <div className="container-custom py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* ═══ LEFT: Image Gallery with USP bar ═══ */}
          <div className="lg:col-span-7">
            <ImageGallery
              images={product.images}
              productName={product.name}
              activeImg={activeImg}
              setActiveImg={setActiveImg}
              hasDiscount={hasDiscount}
              discountPct={discountPct}
              isBestseller={product.isBestseller}
              isTrending={product.isTrending}
              isWishlisted={isWishlisted}
              onWishlistToggle={handleWishlist}
              features={product.features}
            />
          </div>

          {/* ═══ RIGHT: Product Info — Frido Style ═══ */}
          <div className="lg:col-span-5">
            <div className="space-y-5">

              {/* ── 1. Bestseller + Rating + Title ── */}
              <ProductInfo
                product={product}
                isWishlisted={isWishlisted}
                onWishlistToggle={handleWishlist}
              />

              {/* ── 2. Price Box ── */}
              <PricingSection
                displayPrice={displayPrice}
                basePrice={basePrice}
                hasDiscount={hasDiscount}
                discountAmount={discountAmount}
                discountPct={discountPct}
                isCustomSize={isCustomSize && isMattress}
              />

              {/* ── 3. USP Icons (2x2) ── */}
              <ProductUSPs features={product.features} warranty={product.warranty} />

              {/* ── 4. Variant Selectors (numbered steps) ── */}
              {(product.variants?.length > 0 || isMattress) && (
                <VariantSelector
                  variants={product.variants}
                  selectedVariant={selectedVariant}
                  setSelectedVariant={setSelectedVariant}
                  isCustomSize={isCustomSize}
                  setIsCustomSize={setIsCustomSize}
                  isMattress={isMattress}
                  images={product.images}
                  setActiveImg={setActiveImg}
                  setActivePreset={setActivePreset}
                  productPrice={product.price}
                />
              )}

              {/* ── 5. Custom Size Configurator ── */}
              {isCustomSize && isMattress && (
                <CustomSizeConfig
                  customLength={customLength} setCustomLength={setCustomLength}
                  customWidth={customWidth} setCustomWidth={setCustomWidth}
                  customThickness={customThickness} setCustomThickness={setCustomThickness}
                  activePreset={activePreset} setActivePreset={setActivePreset}
                  productPrice={product.price}
                />
              )}

              {/* ── 6. Quantity ── */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                <span className="text-gray-400 mr-1">{isMattress ? (isCustomSize ? '2.' : '4.') : (product.variants?.length > 0 ? (product.variants?.some(v => v.color) ? '3.' : '2.') : '1.')}</span> Quantity
                </span>
                <div className="flex items-center border border-gray-300 dark:border-surface-600 rounded-full overflow-hidden">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-surface-800 transition-colors text-gray-600 dark:text-gray-300">
                    <Minus size={14} />
                  </button>
                  <span className="w-10 h-9 flex items-center justify-center font-bold text-sm text-gray-900 dark:text-white border-x border-gray-300 dark:border-surface-600">
                    {quantity}
                  </span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-surface-800 transition-colors text-gray-600 dark:text-gray-300">
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  {product.stock > 0 ? (
                    product.stock <= 10
                      ? <span className="text-amber-500 font-semibold">Only {product.stock} left!</span>
                      : <span>{product.stock} in stock</span>
                  ) : (
                    <span className="text-red-500 font-semibold">Out of stock</span>
                  )}
                </span>
              </div>

              {/* ── 7. ADD TO CART — Large CTA (Frido yellow → brand gradient) ── */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full py-4 rounded-xl font-bold text-sm bg-brand-gradient text-white shadow-brand hover:shadow-brand-lg transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
                >
                  <ShoppingCart size={18} /> ADD TO CART
                </button>

                {/* Wishlist + Buy Now Row */}
                <div className="flex gap-3">
                  <button
                    onClick={handleWishlist}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                      isWishlisted
                        ? 'border-red-300 bg-red-50 dark:bg-red-950/20 text-red-500'
                        : 'border-gray-300 dark:border-surface-600 text-gray-600 dark:text-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                    {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-500 hover:text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* ── 8. Bank Offers ── */}
              <OffersSection />

              {/* ── 9. Delivery Checker ── */}
              <DeliveryChecker
                isFreeShipping={product.isFreeShipping !== false}
                isCOD={product.isCOD !== false}
              />

              {/* ── 10. Accordion: Description / Product Details / Care / Return ── */}
              <ProductAccordion product={product} />

            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
           BELOW THE FOLD
         ═══════════════════════════════════════════════════ */}
      <div className="bg-gray-50 dark:bg-surface-900 border-t border-gray-100 dark:border-surface-800">
        <div className="container-custom pt-8 pb-12 space-y-8">

          {/* Trust Ba
          dges */}
          <TrustBadges warranty={product.warranty} />

          {/* Frequently Bought Together
          <FrequentlyBoughtTogether currentProduct={product} relatedProducts={relatedProducts} />
          */}

          {/* Reviews */}
          <ReviewSection product={product} user={user} />

          {/* FAQs */}
          <FAQSection categorySlug={categorySlug} />

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <SectionHeading eyebrow="You May Also Like" title="Related" gradient="Products" className="mb-0" />
                <Link
                  to={`/shop?category=${categorySlug}`}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-500 transition-colors"
                >
                  View All <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.slice(0, 4).map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Sticky Purchase Bar ═══ */}
      <StickyPurchaseBar
        productName={product.name}
        displayPrice={displayPrice}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isOutOfStock={product.stock === 0}
      />

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        action={loginPromptAction}
      />
    </div>
  );
};

export default ProductDetailPage;
