import React from 'react';
import SectionCard from '../ui/SectionCard';
import ToggleSwitch from '../ui/ToggleSwitch';
import { Truck } from 'lucide-react';

/**
 * Shipping Sidebar Section.
 */
const ShippingSection = ({ form, onChange }) => {
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  const handleDimensionChange = (key, val) => {
    onChange(`dimensions.${key}`, val);
  };

  return (
    <SectionCard
      title="Shipping & Logistics"
      subtitle="Configure product dimensions, weight, free shipping, and Cash-on-Delivery"
      icon={Truck}
    >
      <div className="space-y-4">
        {/* Weight */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
            Weight (kg)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.weight}
            onChange={(e) => handleChange('weight', e.target.value)}
            className="input w-full"
            placeholder="e.g. 15.5"
          />
        </div>

        {/* Dimensions L/W/H */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
            Dimensions (L × W × H) (cm)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              min="0"
              placeholder="L"
              value={form.dimensions?.length || ''}
              onChange={(e) => handleDimensionChange('length', e.target.value)}
              className="input w-full px-2 text-center"
            />
            <input
              type="number"
              min="0"
              placeholder="W"
              value={form.dimensions?.width || ''}
              onChange={(e) => handleDimensionChange('width', e.target.value)}
              className="input w-full px-2 text-center"
            />
            <input
              type="number"
              min="0"
              placeholder="H"
              value={form.dimensions?.height || ''}
              onChange={(e) => handleDimensionChange('height', e.target.value)}
              className="input w-full px-2 text-center"
            />
          </div>
        </div>

        {/* Shipping Class */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
            Shipping Class
          </label>
          <select
            value={form.shippingClass}
            onChange={(e) => handleChange('shippingClass', e.target.value)}
            className="input w-full"
          >
            <option value="standard">Standard Shipping</option>
            <option value="heavy">Heavy Goods (Bulky)</option>
            <option value="express">Express Class Only</option>
          </select>
        </div>

        {/* Shipping Toggles */}
        <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-surface-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Free Shipping Enabled
            </span>
            <ToggleSwitch
              size="sm"
              checked={form.isFreeShipping}
              onChange={(val) => handleChange('isFreeShipping', val)}
              id="isFreeShipping"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Cash on Delivery (COD)
            </span>
            <ToggleSwitch
              size="sm"
              checked={form.isCOD}
              onChange={(val) => handleChange('isCOD', val)}
              id="isCOD"
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default ShippingSection;
