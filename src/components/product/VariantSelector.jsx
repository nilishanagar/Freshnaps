import React, { useState, useMemo } from 'react';
import { Ruler } from 'lucide-react';
import { calculateFreshNapsPrice, parseMattressDimensions } from '../../utils/pricingUtils';

/* ═══════════════════════════════════════════════════════
   MATTRESS SIZE DATA — Based on standard Indian sizes
   ═══════════════════════════════════════════════════════ */

const BEDDING_SIZES = ['Single', 'Diwan', 'Queen', 'King'];

// All available L×W sizes (in inches)
const ALL_SIZES = [
  '72"x30"', '72"x35"', '72"x36"', '72"x42"', '75"x30"',
  '75"x36"', '75"x42"', '78"x30"', '78"x36"', '78"x42"',
  '72"x48"', '75"x48"', '78"x48"', '72"x60"', '72"x66"',
  '75"x60"', '75"x66"', '78"x60"', '78"x66"', '84"x60"',
  '72"x72"', '75"x72"', '78"x72"', '84"x72"',
];

// Which sizes are highlighted (recommended) for each bedding category
const BEDDING_SIZE_MAP = {
  Single: ['72"x30"', '72"x35"', '72"x36"', '72"x42"', '75"x30"',
           '75"x36"', '75"x42"', '78"x30"', '78"x36"', '78"x42"'],
  Diwan:  ['72"x48"', '75"x48"', '78"x48"'],
  Queen:  ['72"x60"', '72"x66"', '75"x60"', '75"x66"', '78"x60"', '78"x66"', '84"x60"'],
  King:   ['72"x72"', '75"x72"', '78"x72"', '84"x72"'],
};

const THICKNESS_OPTIONS = ['5 inch', '6 inch'];

/* ═══════════════════════════════════════════════════════ */

const VariantSelector = ({
  variants,
  selectedVariant,
  setSelectedVariant,
  isCustomSize,
  setIsCustomSize,
  isMattress,
  images,
  setActiveImg,
  setActivePreset,
  productPrice,
}) => {
  // Mattress-specific state
  const [selectedBeddingSize, setSelectedBeddingSize] = useState('Single');
  const [selectedSize, setSelectedSize] = useState('72"x30"');
  const [selectedThickness, setSelectedThickness] = useState('5 inch');

  const handleVariantSelect = (v) => {
    setIsCustomSize(false);
    setSelectedVariant(v);
    setActivePreset?.(null);
    if (v.image) {
      const imgUrls = images?.map(img => typeof img === 'string' ? img : img?.url);
      const idx = imgUrls?.indexOf(v.image);
      if (idx !== -1) setActiveImg(idx);
    }
  };

  // Build a virtual variant from mattress selections with dynamic pricing
  const handleMattressSizeChange = (beddingSize, size, thickness) => {
    setIsCustomSize(false);
    setActivePreset?.(null);
    const label = `${size} - ${thickness} (${beddingSize})`;

    // Parse L×W from the size string (e.g. '72"x36"')
    const dims = parseMattressDimensions(size);
    // Parse thickness number (e.g. '5 inch' → 5)
    const thicknessNum = parseInt(thickness, 10) || 5;

    // Calculate volume-based price
    let calculatedPrice = 0;
    if (dims && productPrice) {
      calculatedPrice = calculateFreshNapsPrice(
        productPrice, dims.length, dims.width, thicknessNum
      );
    }

    // Create a virtual variant object for the cart
    const virtualVariant = {
      size: label,
      beddingSize,
      dimensions: size,
      thickness,
      price: calculatedPrice || selectedVariant?.price || 0,
      stock: selectedVariant?.stock,
      customLength: dims?.length,
      customWidth: dims?.width,
      customThickness: thicknessNum,
    };
    setSelectedVariant(virtualVariant);
  };

  // Highlighted sizes for the selected bedding category
  const highlightedSizes = useMemo(() => {
    return new Set(BEDDING_SIZE_MAP[selectedBeddingSize] || []);
  }, [selectedBeddingSize]);

  if (!variants?.length && !isMattress) return null;

  // Separate size and color variants
  const hasSizes = variants?.some(v => v.size);
  const hasColors = variants?.some(v => v.color);

  // Step numbering
  let stepNum = 1;

  return (
    <div className="space-y-5">

      {/* ═══════════════════════════════════════════════════
           MATTRESS-SPECIFIC SELECTOR (3-step)
         ═══════════════════════════════════════════════════ */}
      {isMattress && (
        <>
          {/* ─── Step 1: Bedding Size ─── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                <span className="text-gray-400 mr-1">{stepNum}.</span> Bedding Size
              </p>
              <button className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                <Ruler size={12} /> Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {BEDDING_SIZES.map(bs => {
                const isActive = !isCustomSize && selectedBeddingSize === bs;
                return (
                  <button
                    key={bs}
                    onClick={() => {
                      setSelectedBeddingSize(bs);
                      // Auto-select the first highlighted size for this bedding
                      const firstSize = BEDDING_SIZE_MAP[bs]?.[0] || selectedSize;
                      setSelectedSize(firstSize);
                      handleMattressSizeChange(bs, firstSize, selectedThickness);
                    }}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all duration-200 ${
                      isActive
                        ? 'border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-400 shadow-sm'
                        : 'border-gray-300 dark:border-surface-600 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400'
                    }`}
                  >
                    {bs}
                  </button>
                );
              })}
              {/* Custom Size pill */}
              <button
                onClick={() => setIsCustomSize(true)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all duration-200 flex items-center gap-1.5 ${
                  isCustomSize
                    ? 'border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-400 shadow-sm'
                    : 'border-dashed border-gray-300 dark:border-surface-600 text-gray-500 dark:text-gray-400 hover:border-gray-500 dark:hover:border-gray-400'
                }`}
              >
                <Ruler size={13} /> Custom
              </button>
            </div>
          </div>

          {/* ─── Step 2: Size (L × W grid) ─── */}
          {!isCustomSize && (
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                <span className="text-gray-400 mr-1">{stepNum + 1}.</span> Size
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_SIZES.map(sz => {
                  const isActive = selectedSize === sz;
                  const isHighlighted = highlightedSizes.has(sz);
                  return (
                    <button
                      key={sz}
                      onClick={() => {
                        setSelectedSize(sz);
                        handleMattressSizeChange(selectedBeddingSize, sz, selectedThickness);
                      }}
                      className={`px-3.5 py-2 rounded-lg text-[13px] border-2 transition-all duration-200 ${
                        isActive
                          ? 'border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-400 shadow-md font-bold'
                          : isHighlighted
                            ? 'border-gray-300 dark:border-surface-700 text-gray-800 dark:text-gray-200 bg-white dark:bg-surface-900 hover:border-primary-500 dark:hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 font-semibold'
                            : 'border-gray-200 dark:border-surface-800 text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-surface-900/10 line-through cursor-pointer'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Step 3: Thickness ─── */}
          {!isCustomSize && (
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                <span className="text-gray-400 mr-1">{stepNum + 2}.</span> Thickness
              </p>
              <div className="flex flex-wrap gap-2">
                {THICKNESS_OPTIONS.map(t => {
                  const isActive = selectedThickness === t;
                  return (
                    <button
                      key={t}
                      onClick={() => {
                        setSelectedThickness(t);
                        handleMattressSizeChange(selectedBeddingSize, selectedSize, t);
                      }}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all duration-200 ${
                        isActive
                          ? 'border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-400 shadow-sm'
                          : 'border-gray-300 dark:border-surface-600 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════
           NON-MATTRESS: Original Size & Color Selectors
         ═══════════════════════════════════════════════════ */}
      {!isMattress && (
        <>
          {/* ─── Size Selection ─── */}
          {hasSizes && (
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                <span className="text-gray-400 mr-1">1.</span> Size
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.filter(v => v.size).map((v, i) => {
                  const isSelected = !isCustomSize && selectedVariant === v;
                  const inStock = v.stock === undefined || v.stock > 0;
                  return (
                    <button
                      key={i}
                      onClick={() => handleVariantSelect(v)}
                      disabled={!inStock}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-400 shadow-sm'
                          : inStock
                            ? 'border-gray-300 dark:border-surface-600 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400'
                            : 'border-gray-200 dark:border-surface-800 text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-surface-900/10 line-through cursor-not-allowed'
                      }`}
                    >
                      {v.size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Color Selection ─── */}
          {hasColors && (
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                <span className="text-gray-400 mr-1">{hasSizes ? '2.' : '1.'}</span> Color
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.filter(v => v.color).map((v, i) => {
                  const isSelected = !isCustomSize && selectedVariant === v;
                  return (
                    <button
                      key={i}
                      onClick={() => handleVariantSelect(v)}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-400 shadow-sm'
                          : 'border-gray-300 dark:border-surface-600 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400'
                      }`}
                    >
                      {v.color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Generic variants */}
          {!hasSizes && !hasColors && variants?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                <span className="text-gray-400 mr-1">1.</span> Select Variant
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v, i) => {
                  const isSelected = !isCustomSize && selectedVariant === v;
                  return (
                    <button
                      key={i}
                      onClick={() => handleVariantSelect(v)}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-400 shadow-sm'
                          : 'border-gray-300 dark:border-surface-600 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400'
                      }`}
                    >
                      {v.name || v.size || v.color || `Option ${i + 1}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Only custom size for mattress with no variants */}
      {isMattress && !variants?.length && !isCustomSize && (
        <></>  /* Handled above in the mattress section */
      )}
    </div>
  );
};

export default VariantSelector;
