import React, { useState } from 'react';
import SectionCard from '../ui/SectionCard';
import ToggleSwitch from '../ui/ToggleSwitch';
import VariantMatrix from '../ui/VariantMatrix';
import { GitBranch, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Variants Builder Section.
 */
const VariantsSection = ({ form, onChange }) => {
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrValues, setNewAttrValues] = useState('');

  const handleHasVariantsChange = (val) => {
    onChange('hasVariants', val);
    if (!val) {
      onChange('variantAttributes', []);
      onChange('variants', []);
    }
  };

  const addAttribute = () => {
    const name = newAttrName.trim();
    const values = newAttrValues
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!name || values.length === 0) {
      toast.error('Attribute name and at least one value is required');
      return;
    }

    if (form.variantAttributes.some((a) => a.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Attribute already exists');
      return;
    }

    const updatedAttrs = [...form.variantAttributes, { name, values }];
    onChange('variantAttributes', updatedAttrs);
    setNewAttrName('');
    setNewAttrValues('');

    generateVariants(updatedAttrs);
  };

  const removeAttribute = (idx) => {
    const updatedAttrs = form.variantAttributes.filter((_, i) => i !== idx);
    onChange('variantAttributes', updatedAttrs);
    generateVariants(updatedAttrs);
  };

  const generateVariants = (attrs) => {
    if (attrs.length === 0) {
      onChange('variants', []);
      return;
    }

    // Helper to cartesian-product multiple arrays
    const cartesian = (arrays) => {
      return arrays.reduce(
        (acc, curr) => {
          return acc.flatMap((d) => curr.map((e) => [...d, e]));
        },
        [[]]
      );
    };

    const arrays = attrs.map((a) => a.values.map((v) => ({ attr: a.name, val: v })));
    const combinations = cartesian(arrays);

    const generated = combinations.map((combo) => {
      const name = combo.map((c) => c.val).join(' / ');
      const attributes = {};
      combo.forEach((c) => {
        attributes[c.attr] = c.val;
      });

      // Maintain old variant details if available to prevent wiping user entry
      const existing = form.variants.find((v) => v.name === name);

      return {
        name,
        sku: existing?.sku || `${form.sku || 'FN'}-${combo.map((c) => c.val.substring(0, 3).toUpperCase()).join('-')}`,
        price: existing?.price || form.price || 0,
        discountPrice: existing?.discountPrice || form.discountPrice || 0,
        stock: existing?.stock ?? form.stock ?? 0,
        attributes,
      };
    });

    onChange('variants', generated);
  };

  const handleVariantsMatrixChange = (newVariants) => {
    onChange('variants', newVariants);
  };

  return (
    <SectionCard
      title="Product Variants"
      subtitle="Configure options like size, color, pattern, and individual pricing/stock"
      icon={GitBranch}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            This product has multiple options/variants
          </span>
          <ToggleSwitch
            checked={form.hasVariants}
            onChange={handleHasVariantsChange}
            id="hasVariants"
          />
        </div>

        {form.hasVariants && (
          <div className="space-y-6 border-t border-gray-100 dark:border-surface-800 pt-4">
            {/* Attribute List */}
            {form.variantAttributes.length > 0 && (
              <div className="space-y-2">
                {form.variantAttributes.map((attr, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-surface-950 rounded-xl"
                  >
                    <div>
                      <span className="font-semibold text-sm text-gray-800 dark:text-white mr-2">
                        {attr.name}:
                      </span>
                      <span className="text-xs text-gray-500">
                        {attr.values.join(', ')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttribute(idx)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100 dark:hover:bg-surface-900 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Attribute Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 border border-dashed border-gray-200 dark:border-surface-800 rounded-2xl">
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Option Name
                </label>
                <input
                  type="text"
                  value={newAttrName}
                  onChange={(e) => setNewAttrName(e.target.value)}
                  className="input w-full py-1.5 text-xs"
                  placeholder="e.g. Size"
                />
              </div>
              <div className="md:col-span-2 flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    Values (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={newAttrValues}
                    onChange={(e) => setNewAttrValues(e.target.value)}
                    className="input w-full py-1.5 text-xs"
                    placeholder="e.g. Small, Medium, Large"
                  />
                </div>
                <button
                  type="button"
                  onClick={addAttribute}
                  className="btn-primary py-2 px-3 flex items-center justify-center h-[38px] cursor-pointer"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            {/* Variants Table Matrix */}
            {form.variants.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Variant Matrix Options
                </span>
                <VariantMatrix
                  variants={form.variants}
                  onChange={handleVariantsMatrixChange}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default VariantsSection;
