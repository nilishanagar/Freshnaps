import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const ProductAccordion = ({ product }) => {
  const [openSection, setOpenSection] = useState(null);

  const toggle = (id) => setOpenSection(prev => prev === id ? null : id);

  // Build product details table rows
  const detailRows = [
    { label: 'MRP (Inclusive of all taxes)', value: product.price ? `₹ ${product.price.toLocaleString('en-IN')}` : null },
    { label: 'Brand', value: product.brand },
    { label: 'SKU', value: product.sku },
    { label: 'Material', value: product.material },
    { label: 'Weight', value: product.weight ? `${product.weight} kg` : null },
    { label: 'Dimensions', value: product.dimensions?.length ? `${product.dimensions.length}" × ${product.dimensions.width}" × ${product.dimensions.height}"` : null },
    { label: 'Country of Origin', value: 'India' },
    { label: 'Tags', value: product.tags?.length > 0 ? product.tags.join(', ') : null },
  ].filter(r => r.value);

  const sections = [
    {
      id: 'description',
      title: 'Description',
      content: product.description ? (
        <div
          className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed prose dark:prose-invert prose-sm prose-headings:font-display prose-headings:text-gray-900 dark:prose-headings:text-white max-w-none"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      ) : <p className="text-sm text-gray-400">No description available.</p>,
    },
    {
      id: 'details',
      title: 'Product Details',
      content: detailRows.length > 0 ? (
        <div className="divide-y divide-gray-100 dark:divide-surface-800">
          {detailRows.map((row, i) => (
            <div key={i} className="flex items-start justify-between py-3 gap-4">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">{row.label}</span>
              <span className="text-sm text-gray-900 dark:text-white font-medium text-right">{row.value}</span>
            </div>
          ))}
        </div>
      ) : null,
    },
    {
      id: 'care',
      title: 'Care Instructions',
      content: product.washCare ? (
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{product.washCare}</p>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          For minor spills or stains, spot clean with a damp cloth and mild detergent – no soaking required. If it needs a deep clean, remove the cover and machine wash it on a cold, gentle cycle. Air dry for the best results or tumble dry on low. No bleach, no fabric softeners, and no wringing.
        </p>
      ),
    },
    {
      id: 'return',
      title: 'Return and Refund',
      content: (
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {product.warranty
            ? `This product comes with ${product.warranty}. `
            : ''
          }
          We offer a hassle-free 30-day return or exchange policy. If you're unsatisfied, you can return it within 30 days of purchase for a full refund or exchange. The product must be in its original packaging and reasonable condition.
        </p>
      ),
    },
  ].filter(s => s.content);

  return (
    <div className="border border-gray-200 dark:border-surface-700 rounded-xl overflow-hidden bg-white dark:bg-surface-900 divide-y divide-gray-200 dark:divide-surface-700">
      {sections.map((section) => {
        const isOpen = openSection === section.id;
        return (
          <div key={section.id}>
            <button
              onClick={() => toggle(section.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-surface-950 transition-colors"
            >
              <span className="text-sm font-bold text-gray-900 dark:text-white">{section.title}</span>
              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5">
                    {section.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default ProductAccordion;
