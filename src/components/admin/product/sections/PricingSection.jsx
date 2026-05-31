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
            onChange={(e) => handleChange('price', e.target.value)}
            className="input w-full"
            placeholder={form.hasVariants ? 'Calculated from variants' : 'e.g. 12000'}
          />
        </div>

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
            onChange={(e) => handleChange('discountPrice', e.target.value)}
            className="input w-full"
            placeholder={form.hasVariants ? 'Calculated from variants' : '0 = no discount'}
          />
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
              <span className={`font-semibold ${profitMargin < 15 ? 'text-red-500' : 'text-green-500'}`}>
                {cost > 0 ? `${profitMargin}%` : '—'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Discount</span>
              <span className="font-semibold text-primary-600 dark:text-primary-400">
                {discountPercent > 0 ? `${discountPercent}% Off` : 'None'}
              </span>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default PricingSection;
