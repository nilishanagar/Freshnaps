import React, { useEffect, useState } from 'react';
import SectionCard from '../ui/SectionCard';
import { Package } from 'lucide-react';
import { categoryService } from '../../../../services';

/**
 * Basic Information Section:
 * Name, SKU, Barcode, Brand, Category, Subcategory, Vendor.
 */
const BasicInfoSection = ({ form, onChange }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryService
      .getAll()
      .then((res) => {
        setCategories(res.data.categories || []);
      })
      .catch(() => {});
  }, []);

  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <SectionCard
      title="Basic Information"
      subtitle="Standard details of the product including SKU, Category and Brands"
      icon={Package}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
            Product Name *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="input w-full"
            placeholder="e.g. Luxury Memory Foam Mattress"
          />
        </div>

        {/* SKU */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
            SKU (Stock Keeping Unit) *
          </label>
          <input
            type="text"
            required
            value={form.sku}
            onChange={(e) => handleChange('sku', e.target.value)}
            className="input w-full font-mono uppercase"
            placeholder="e.g. FN-MATT-001"
          />
        </div>

        {/* Barcode */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
            Barcode (GTIN/EAN)
          </label>
          <input
            type="text"
            value={form.barcode || ''}
            onChange={(e) => handleChange('barcode', e.target.value)}
            className="input w-full"
            placeholder="e.g. 8901234567890"
          />
        </div>

        {/* Brand */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
            Brand
          </label>
          <input
            type="text"
            value={form.brand || ''}
            onChange={(e) => handleChange('brand', e.target.value)}
            className="input w-full"
            placeholder="e.g. Freshnaps"
          />
        </div>

        {/* Vendor */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
            Vendor
          </label>
          <input
            type="text"
            value={form.vendor || ''}
            onChange={(e) => handleChange('vendor', e.target.value)}
            className="input w-full"
            placeholder="e.g. Freshnaps Private Limited"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
            Category *
          </label>
          <select
            required
            value={form.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="input w-full capitalize"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
            Subcategory
          </label>
          <input
            type="text"
            value={form.subcategory || ''}
            onChange={(e) => handleChange('subcategory', e.target.value)}
            className="input w-full"
            placeholder="e.g. Premium Foam"
          />
        </div>
      </div>
    </SectionCard>
  );
};

export default BasicInfoSection;
