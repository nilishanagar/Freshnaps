import React from 'react';
import { Ruler } from 'lucide-react';

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
}) => {
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

  if (!variants?.length && !isMattress) return null;

  // Separate size and color variants
  const hasSizes = variants?.some(v => v.size);
  const hasColors = variants?.some(v => v.color);

  return (
    <div className="space-y-5">

      {/* ─── Step 1: Size Selection ─── */}
      {hasSizes && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              <span className="text-gray-400 mr-1">1.</span> Size
            </p>
            {isMattress && (
              <button className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                <Ruler size={12} /> Size Guide
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {variants.filter(v => v.size).map((v, i) => {
              const isSelected = !isCustomSize && selectedVariant === v;
              const inStock = v.stock === undefined || v.stock > 0;
              return (
                <button
                  key={i}
                  onClick={() => handleVariantSelect(v)}
                  disabled={!inStock}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : inStock
                        ? 'border-gray-300 dark:border-surface-600 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400'
                        : 'border-gray-100 dark:border-surface-800 text-gray-300 dark:text-gray-600 line-through cursor-not-allowed'
                  }`}
                >
                  {v.size}
                </button>
              );
            })}
            {/* Custom Size pill */}
            {isMattress && (
              <button
                onClick={() => setIsCustomSize(true)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-all duration-200 flex items-center gap-1.5 ${
                  isCustomSize
                    ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'border-dashed border-gray-300 dark:border-surface-600 text-gray-500 dark:text-gray-400 hover:border-gray-500 dark:hover:border-gray-400'
                }`}
              >
                <Ruler size={13} /> Custom
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Step 2: Color Selection (if any) ─── */}
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
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900'
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

      {/* If only non-size/color variants exist */}
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
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900'
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

      {/* Only custom size for mattress with no variants */}
      {isMattress && !variants?.length && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              <span className="text-gray-400 mr-1">1.</span> Size
            </p>
            <button className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              <Ruler size={12} /> Size Guide
            </button>
          </div>
          <button
            onClick={() => setIsCustomSize(true)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-all duration-200 flex items-center gap-1.5 ${
              isCustomSize
                ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'border-dashed border-gray-300 dark:border-surface-600 text-gray-500 dark:text-gray-400 hover:border-gray-500 dark:hover:border-gray-400'
            }`}
          >
            <Ruler size={13} /> Custom Size
          </button>
        </div>
      )}
    </div>
  );
};

export default VariantSelector;
