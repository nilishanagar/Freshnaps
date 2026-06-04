import React from 'react';
import { Wind, Shield, Droplets, Sparkles, ShieldCheck } from 'lucide-react';

const DEFAULT_USPS = [
  { text: 'Premium comfort all night', icon: Sparkles },
  { text: 'Even pressure distribution', icon: Shield },
  { text: 'Quickly regains shape', icon: Wind },
  { text: 'Comfort in budget', icon: Droplets },
];

const ICONS = [Sparkles, Shield, Wind, Droplets];

const ProductUSPs = ({ features, warranty }) => {
  // 1. Identify if any feature contains "warranty" (case-insensitive) to prevent duplication
  let resolvedWarranty = warranty || '';
  let cleanFeatures = features ? [...features] : [];

  if (!resolvedWarranty && features) {
    const warrantyIndex = features.findIndex(f => /warranty/i.test(f));
    if (warrantyIndex !== -1) {
      resolvedWarranty = features[warrantyIndex];
      // Remove it from the features list so we don't display it twice
      cleanFeatures.splice(warrantyIndex, 1);
    }
  }

  // Fallback if no warranty is found on the product
  if (!resolvedWarranty) {
    resolvedWarranty = '5 Year Warranty';
  }

  // 2. Take the first 4 features from the cleaned list
  const items = cleanFeatures.length >= 4
    ? cleanFeatures.slice(0, 4).map((f, i) => ({ text: f, icon: ICONS[i % ICONS.length] }))
    : (cleanFeatures.length > 0 
        ? cleanFeatures.map((f, i) => ({ text: f, icon: ICONS[i % ICONS.length] }))
        : DEFAULT_USPS);

  // 3. Append the warranty item
  const displayItems = [...items];
  const text = /warranty/i.test(resolvedWarranty) ? resolvedWarranty : `${resolvedWarranty} Warranty`;
  displayItems.push({
    text,
    icon: ShieldCheck,
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3.5 items-center">
      {displayItems.map((item, i) => {
        const Icon = item.icon;
        const isWarranty = Icon === ShieldCheck;

        if (isWarranty) {
          return (
            <div key={i} className="flex items-center">
              <span className="inline-flex items-center gap-1 bg-[#dcfce7] dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm capitalize border border-emerald-200/50 dark:border-emerald-900/30">
                <Icon size={12} className="text-emerald-600 dark:text-emerald-400" />
                {item.text}
              </span>
            </div>
          );
        }

        return (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-950/20 flex items-center justify-center flex-shrink-0">
              <Icon size={15} className="text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-300 leading-tight">{item.text}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ProductUSPs;
