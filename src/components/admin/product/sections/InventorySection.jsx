import React from 'react';
import SectionCard from '../ui/SectionCard';
import ToggleSwitch from '../ui/ToggleSwitch';
import { Archive } from 'lucide-react';

/**
 * Inventory Management Sidebar Section.
 */
const InventorySection = ({ form, onChange }) => {
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <SectionCard
      title="Inventory Management"
      subtitle="Stock level thresholds and warehouse listings"
      icon={Archive}
    >
      <div className="space-y-4">
        {/* Track Inventory Toggle */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-50 dark:border-surface-950">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Track Stock Levels
          </span>
          <ToggleSwitch
            size="sm"
            checked={form.trackInventory}
            onChange={(val) => handleChange('trackInventory', val)}
            id="trackInventory"
          />
        </div>

        {form.trackInventory && (
          <>
            {/* Stock Count */}
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
                Available Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                required={form.trackInventory && !form.hasVariants}
                disabled={form.hasVariants}
                value={form.stock}
                onChange={(e) => handleChange('stock', Number(e.target.value))}
                className="input w-full"
                placeholder={form.hasVariants ? 'Calculated from variants' : 'e.g. 50'}
              />
              {form.hasVariants && (
                <p className="text-[10px] text-gray-400 mt-1">
                  Controlled by Variant Matrix values.
                </p>
              )}
            </div>

            {/* Low stock threshold */}
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
                Low Stock Warning Threshold
              </label>
              <input
                type="number"
                min="0"
                value={form.lowStockThreshold}
                onChange={(e) => handleChange('lowStockThreshold', e.target.value)}
                className="input w-full"
                placeholder="e.g. 5"
              />
            </div>
          </>
        )}

        {/* Warehouse Location */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
            Warehouse/Shelf Location
          </label>
          <input
            type="text"
            value={form.warehouseLocation || ''}
            onChange={(e) => handleChange('warehouseLocation', e.target.value)}
            className="input w-full font-mono text-xs"
            placeholder="e.g. AISLE-4B-SHELF-2"
          />
        </div>

        {/* Allow Backorders */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Allow Customer Backorders
          </span>
          <ToggleSwitch
            size="sm"
            checked={form.allowBackorders}
            onChange={(val) => handleChange('allowBackorders', val)}
            id="allowBackorders"
          />
        </div>
      </div>
    </SectionCard>
  );
};

export default InventorySection;
