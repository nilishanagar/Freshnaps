import React from 'react';
import { Trash2 } from 'lucide-react';

/**
 * Premium UI Matrix builder for product variant combinations.
 */
const VariantMatrix = ({ variants = [], onChange }) => {
  const updateVariantField = (idx, field, value) => {
    const updated = [...variants];
    updated[idx] = {
      ...updated[idx],
      [field]: value,
    };
    onChange(updated);
  };

  const removeVariant = (idx) => {
    const updated = variants.filter((_, i) => i !== idx);
    onChange(updated);
  };

  if (variants.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-100 dark:border-surface-800 bg-white dark:bg-surface-900">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-gray-50 dark:bg-surface-950 border-b border-gray-100 dark:border-surface-800 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Variant</th>
            <th className="px-4 py-3">SKU</th>
            <th className="px-4 py-3 w-28">MRP Price (₹)</th>
            <th className="px-4 py-3 w-28">Sale Price (₹)</th>
            <th className="px-4 py-3 w-24">Stock</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-surface-800">
          {variants.map((v, idx) => (
            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-surface-800/30">
              <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                {v.name}
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  value={v.sku || ''}
                  onChange={(e) => updateVariantField(idx, 'sku', e.target.value)}
                  className="input px-2 py-1 text-xs w-full font-mono"
                  placeholder="SKU"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  min="0"
                  value={v.price || ''}
                  onChange={(e) => updateVariantField(idx, 'price', Number(e.target.value))}
                  className="input px-2 py-1 text-xs w-full"
                  placeholder="0"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  min="0"
                  value={v.discountPrice || ''}
                  onChange={(e) => updateVariantField(idx, 'discountPrice', Number(e.target.value))}
                  className="input px-2 py-1 text-xs w-full"
                  placeholder="0"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  min="0"
                  value={v.stock ?? ''}
                  onChange={(e) => updateVariantField(idx, 'stock', Number(e.target.value))}
                  className="input px-2 py-1 text-xs w-full"
                  placeholder="0"
                />
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => removeVariant(idx)}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VariantMatrix;
