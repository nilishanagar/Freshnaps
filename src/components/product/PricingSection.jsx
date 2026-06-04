import React from 'react';

const formatPrice = (p) => `₹${p?.toLocaleString('en-IN')}`;

const PricingSection = ({ displayPrice, basePrice, hasDiscount, discountAmount, discountPct, isCustomSize, customSurcharge }) => {
  const emi = displayPrice ? Math.round(displayPrice / 3) : 0;

  return (
    <div className="bg-gray-50 dark:bg-surface-900 rounded-xl border border-gray-200 dark:border-surface-700 p-4">
      {/* "Starting from." label */}
      <p className="text-[11px] text-gray-400 font-medium mb-1">Starting from.</p>

      {/* Price row */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-2xl font-extrabold text-gray-900 dark:text-white font-display">
          {formatPrice(displayPrice)}
        </span>
        {hasDiscount && (
          <>
            <span className="text-sm text-gray-400 line-through">MRP {formatPrice(basePrice)}</span>
            <span className="text-[11px] font-bold text-gray-900 dark:text-white bg-amber-300 dark:bg-amber-400 px-2 py-0.5 rounded">
              {discountPct}% OFF
            </span>
          </>
        )}
        <span className="text-[11px] text-gray-400">(Incl. of all taxes)</span>
      </div>

      {isCustomSize && (
        <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
          Includes custom manufacturing surcharge of ₹{customSurcharge?.toLocaleString('en-IN')}
        </p>
      )}

      {/* EMI / Cashback Row */}
      {displayPrice > 1000 && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-600 px-2.5 py-1 rounded-md">
            10% Cashback*
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-300">
            {formatPrice(emi)}/month at <span className="font-semibold">0% EMI</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default PricingSection;
