import React, { useEffect } from 'react';
import SectionCard from '../ui/SectionCard';
import { DollarSign } from 'lucide-react';

/**
 * Pricing Sidebar Section.
 */
const PricingSection = ({ form, onChange }) => {
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  const mrp = Number(form.price) || 0;
  const salePrice = Number(form.discountPrice) || 0;
  const cost = Number(form.costPrice) || 0;

  // Calculate profit margin & discount %
  const discountPercent = mrp > 0 && salePrice > 0 ? Math.round(((mrp - salePrice) / mrp) * 100) : 0;
  const activePrice = salePrice > 0 ? salePrice : mrp;
  const profitMargin = activePrice > 0 && cost > 0 ? Math.round(((activePrice - cost) / activePrice) * 100) : 0;

  const [discountType, setDiscountType] = React.useState('percent');
  const [discountVal, setDiscountVal] = React.useState('');
  const hasInitialized = React.useRef(false);

  useEffect(() => {
    if (!hasInitialized.current && salePrice > 0 && mrp > 0 && salePrice < mrp) {
      const pct = Math.round(((mrp - salePrice) / mrp) * 100);
      setDiscountVal(String(pct));
      setDiscountType('percent');
      hasInitialized.current = true;
    }
  }, [salePrice, mrp]);

  const handleDiscountChange = (val, type = discountType) => {
    setDiscountVal(val);
    const numericVal = Number(val) || 0;
    if (numericVal <= 0) {
      onChange('discountPrice', '0');
      return;
    }
    if (mrp > 0) {
      let computedPrice = 0;
      if (type === 'percent') {
        computedPrice = Math.max(0, Math.round(mrp - (mrp * numericVal / 100)));
      } else {
        computedPrice = Math.max(0, mrp - numericVal);
      }
      onChange('discountPrice', String(computedPrice));
    }
  };

  const handleDiscountTypeChange = (type) => {
    setDiscountType(type);
    handleDiscountChange(discountVal, type);
  };

  const handleMrpChange = (newMrp) => {
    onChange('price', newMrp);
    const numericMrp = Number(newMrp) || 0;
    const numericVal = Number(discountVal) || 0;
    if (numericVal > 0 && numericMrp > 0) {
      let computedPrice = 0;
      if (discountType === 'percent') {
        computedPrice = Math.max(0, Math.round(numericMrp - (numericMrp * numericVal / 100)));
      } else {
        computedPrice = Math.max(0, numericMrp - numericVal);
      }
      onChange('discountPrice', String(computedPrice));
    }
  };

  const handleSellingPriceChange = (newSalePrice) => {
    onChange('discountPrice', newSalePrice);
    const numericSale = Number(newSalePrice) || 0;
    if (numericSale > 0 && mrp > 0 && numericSale < mrp) {
      if (discountType === 'percent') {
        const pct = Math.round(((mrp - numericSale) / mrp) * 100);
        setDiscountVal(String(pct));
      } else {
        setDiscountVal(String(mrp - numericSale));
      }
    } else {
      setDiscountVal('');
    }
  };

  // Profit calculations
  const profitAmount = activePrice > cost ? (activePrice - cost) : 0;

  return (
    <SectionCard
      title="Pricing & Margin"
      subtitle="MRP, Cost pricing, taxes, and auto margin calculations"
      icon={DollarSign}
    >
      <div className="space-y-4">
        {/* Cost Price */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
            Cost of Goods (₹)
          </label>
          <input
            type="number"
            min="0"
            value={form.costPrice}
            onChange={(e) => handleChange('costPrice', e.target.value)}
            className="input w-full"
            placeholder="e.g. 5000"
          />
        </div>

        {/* MRP Price */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
            MRP / Original Price (₹) *
          </label>
          <input
            type="number"
            min="0"
            required
            disabled={form.hasVariants}
            value={form.price}
            onChange={(e) => handleMrpChange(e.target.value)}
            className="input w-full"
            placeholder={form.hasVariants ? 'Calculated from variants' : 'e.g. 12000'}
          />
        </div>

        {/* Discount Fields */}
        {!form.hasVariants && (
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
              Discount
            </label>
            <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-surface-700 bg-white dark:bg-surface-900 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
              <input
                type="number"
                min="0"
                value={discountVal}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none"
                placeholder={discountType === 'percent' ? 'e.g. 10 for 10%' : 'e.g. 500 for ₹500 off'}
              />
              <select
                value={discountType}
                onChange={(e) => handleDiscountTypeChange(e.target.value)}
                className="px-3 bg-gray-50 dark:bg-surface-950 border-l border-gray-200 dark:border-surface-700 text-xs font-bold text-gray-600 dark:text-gray-300 focus:outline-none"
              >
                <option value="percent">% Off</option>
                <option value="flat">₹ Off</option>
              </select>
            </div>
          </div>
        )}

        {/* Discount Sale Price */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
            Selling / Discount Price (₹)
          </label>
          <input
            type="number"
            min="0"
            disabled={form.hasVariants}
            value={form.discountPrice}
            onChange={(e) => handleSellingPriceChange(e.target.value)}
            className="input w-full"
            placeholder={form.hasVariants ? 'Calculated from variants' : '0 = no discount'}
          />
          {!form.hasVariants && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
              Calculated from discount or set manually
            </span>
          )}
        </div>

        {/* Tax Percentage */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
            Tax Rate (%)
          </label>
          <select
            value={form.taxPercent}
            onChange={(e) => handleChange('taxPercent', e.target.value)}
            className="input w-full"
          >
            <option value="0">0% (GST Exempt)</option>
            <option value="5">5% GST</option>
            <option value="12">12% GST</option>
            <option value="18">18% GST (Standard)</option>
            <option value="28">28% GST</option>
          </select>
        </div>

        {/* Premium live calculations widget */}
        {!form.hasVariants && (mrp > 0 || cost > 0) && (
          <div className="p-3 bg-gray-50 dark:bg-surface-950 border border-gray-100 dark:border-surface-950 rounded-xl grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-400 block">Margin</span>
              <span className={`font-semibold ${profitMargin < 15 ? 'text-amber-500' : 'text-green-500'}`}>
                {cost > 0 ? `${profitMargin}%` : '—'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Profit</span>
              <span className={`font-semibold ${profitAmount > 0 ? 'text-emerald-500' : 'text-gray-400'}`}>
                {cost > 0 && profitAmount > 0 ? `₹ ${profitAmount.toLocaleString('en-IN')}` : '—'}
              </span>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default PricingSection;
