import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import SectionHeading from './SectionHeading';

const FAQS_BY_CATEGORY = {
  mattress: [
    { q: 'How long does the mattress take to expand fully?', a: 'Our mattresses expand to full size within 24-48 hours after unboxing. You can sleep on it after 6 hours, but we recommend waiting 24 hours for optimal comfort.' },
    { q: 'What is the firmness level of the mattress?', a: 'Our mattresses are medium-firm, rated 6.5/10 on the firmness scale. This provides the perfect balance of comfort and support for most sleepers.' },
    { q: 'Do I need to flip the mattress?', a: 'Our mattresses are designed as single-sided and do not need flipping. However, we recommend rotating the mattress 180° every 3 months for even wear.' },
    { q: 'Is the mattress suitable for back pain?', a: 'Yes! Our orthopedic foam provides proper spinal alignment and pressure point relief, making it ideal for those with back pain.' },
    { q: 'What is the return policy for mattresses?', a: 'We offer a 30-day trial period. If you\'re not satisfied, we\'ll arrange a free pickup and full refund.' },
  ],
  default: [
    { q: 'What material is this product made of?', a: 'Our products are made from premium quality fabrics sourced for durability and comfort. Check the Specifications section for exact material details.' },
    { q: 'How do I wash this product?', a: 'Machine wash in cold water on a gentle cycle. Tumble dry on low heat. Avoid bleach and harsh detergents.' },
    { q: 'What is the delivery timeline?', a: 'Standard delivery takes 3-7 business days depending on your location. Free shipping is available on all orders across India.' },
    { q: 'What if I receive a damaged product?', a: 'Contact our support team within 48 hours of delivery with photos. We\'ll arrange a free replacement or full refund.' },
    { q: 'Can I return this product?', a: 'We offer hassle-free 30-day returns. The product must be unused and in original packaging.' },
  ],
};

const FAQSection = ({ categorySlug }) => {
  const [openIdx, setOpenIdx] = useState(null);
  const faqs = FAQS_BY_CATEGORY[categorySlug] || FAQS_BY_CATEGORY.default;

  return (
    <div>
      <SectionHeading eyebrow="Got Questions?" title="Frequently Asked" gradient="Questions" />
      <div className="bg-white dark:bg-surface-950 rounded-xl border border-gray-200 dark:border-surface-700 overflow-hidden divide-y divide-gray-200 dark:divide-surface-700">
        {faqs.map((faq, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={i}>
              <button onClick={() => setOpenIdx(isOpen ? null : i)} className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-surface-900 transition-colors">
                <HelpCircle size={16} className="text-primary-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex-1">{faq.q}</span>
                <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-5 pb-4 pl-12 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQSection;
