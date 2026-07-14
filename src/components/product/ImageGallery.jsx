import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Maximize2, Sparkles, Heart, Share2, Copy, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const getImageUrl = (img) => {
  if (typeof img === 'string') return img;
  if (img?.url) return img.url;
  return 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';
};

const ImageGallery = ({
  images = [],
  productName,
  activeImg,
  setActiveImg,
  hasDiscount,
  discountPct,
  isBestseller,
  isTrending,
  isWishlisted,
  onWishlistToggle,
  features = [],
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartRef = useRef(null);

  const allImages = images?.length > 0 ? images : [null];
  const currentImageUrl = getImageUrl(allImages[activeImg]);

  const goNext = useCallback(() => setActiveImg(i => (i + 1) % allImages.length), [allImages.length, setActiveImg]);
  const goPrev = useCallback(() => setActiveImg(i => (i - 1 + allImages.length) % allImages.length), [allImages.length, setActiveImg]);

  // Touch swipe
  const handleTouchStart = (e) => { touchStartRef.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartRef.current === null) return;
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? goNext() : goPrev(); }
    touchStartRef.current = null;
  };

  // Lightbox keyboard
  React.useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handleKey); document.body.style.overflow = ''; };
  }, [lightboxOpen, goNext, goPrev]);

  // USP bar items (from features, max 3)
  const uspItems = (features?.length > 0 ? features.slice(0, 3) : ['Premium Quality', 'Skin Friendly', 'Long Lasting']).map(f => {
    const parts = f.split(' ');
    if (parts.length <= 2) return { top: parts[0], bottom: parts.slice(1).join(' ') || '' };
    const mid = Math.ceil(parts.length / 2);
    return { top: parts.slice(0, mid).join(' '), bottom: parts.slice(mid).join(' ') };
  });

  return (
    <>
      <div className="lg:sticky lg:top-24 space-y-0">
        <div className="flex gap-3">
          {/* ── Vertical Thumbnails (Desktop) ── */}
          {allImages.length > 1 && (
            <div className="hidden lg:flex flex-col gap-2 overflow-y-auto max-h-[520px] no-scrollbar flex-shrink-0 pt-1">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-[68px] h-[68px] rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-200 bg-white dark:bg-surface-900 ${
                    activeImg === i
                      ? 'border-primary-600 dark:border-primary-400 shadow-md'
                      : 'border-gray-200 dark:border-surface-700 opacity-60 hover:opacity-100 hover:border-gray-300'
                  }`}
                >
                  <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}

          {/* ── Main Image ── */}
          <div className="flex-1 flex flex-col">
            <div
              className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-50 dark:bg-surface-900 border border-gray-200 dark:border-surface-700 cursor-pointer group"
              onClick={() => setLightboxOpen(true)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  src={currentImageUrl}
                  alt={productName}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </AnimatePresence>

              {/* Nav arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); goPrev(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft size={20} className="text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); goNext(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight size={20} className="text-gray-700 dark:text-gray-300" />
                  </button>
                </>
              )}

              {/* Badges (Top Left) */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                {hasDiscount && (
                  <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow">
                    {discountPct}% OFF
                  </span>
                )}
                {isBestseller && (
                  <span className="inline-flex items-center gap-1 bg-amber-400 text-amber-950 text-[10px] font-bold px-2.5 py-1 rounded-md shadow">
                    <Sparkles size={10} className="fill-amber-900" /> Bestseller
                  </span>
                )}
                {isTrending && (
                  <span className="inline-flex items-center gap-1 bg-violet-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow">
                    Trending
                  </span>
                )}
              </div>

              {/* Image counter (bottom center) */}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1 rounded-full pointer-events-none">
                  {activeImg + 1} / {allImages.length}
                </div>
              )}
            </div>


            {/* View real images link */}
            {/* <button className="flex items-center gap-1.5 mx-auto mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              <ImageIcon size={13} /> View real images
            </button> */}
          </div>
        </div>

        {/* ── Horizontal Thumbnails (Mobile) ── */}
        {allImages.length > 1 && (
          <div className="flex lg:hidden gap-2 overflow-x-auto pb-1 no-scrollbar mt-3">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`w-[56px] h-[56px] rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-200 bg-white dark:bg-surface-900 ${
                  activeImg === i
                    ? 'border-primary-600 dark:border-primary-400 shadow-md'
                    : 'border-gray-200 dark:border-surface-700 opacity-50 hover:opacity-100'
                }`}
              >
                <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ═══ Fullscreen Lightbox ═══ */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col"
            onClick={() => setLightboxOpen(false)}
          >
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3">
                <span className="text-white/60 text-sm font-medium">{productName}</span>
                {allImages.length > 1 && (
                  <span className="text-white/40 text-xs font-bold bg-white/10 px-2.5 py-0.5 rounded-full">
                    {activeImg + 1} / {allImages.length}
                  </span>
                )}
              </div>
              <button onClick={() => setLightboxOpen(false)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center relative px-4 sm:px-16 min-h-0" onClick={e => e.stopPropagation()}>
              {allImages.length > 1 && (
                <button onClick={goPrev} className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-105 z-10">
                  <ChevronLeft size={24} />
                </button>
              )}
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  src={currentImageUrl}
                  alt={productName}
                  className="max-h-full max-w-full object-contain rounded-lg select-none"
                  draggable={false}
                  onClick={e => e.stopPropagation()}
                />
              </AnimatePresence>
              {allImages.length > 1 && (
                <button onClick={goNext} className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-105 z-10">
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex justify-center gap-2 px-4 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-200 ${
                      activeImg === i ? 'border-white shadow-lg scale-105' : 'border-white/20 opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageGallery;
