import React from 'react';
import { Wind, Shield, Droplets, Sparkles } from 'lucide-react';

const DEFAULT_USPS = [
  { text: 'Premium comfort all night', icon: Sparkles },
  { text: 'Even pressure distribution', icon: Shield },
  { text: 'Quickly regains shape', icon: Wind },
  { text: 'Comfort in budget', icon: Droplets },
];

const ICONS = [Sparkles, Shield, Wind, Droplets];

const ProductUSPs = ({ features }) => {
  const items = features?.length >= 4
    ? features.slice(0, 4).map((f, i) => ({ text: f, icon: ICONS[i % ICONS.length] }))
    : DEFAULT_USPS;

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
      {items.map((item, i) => {
        const Icon = item.icon;
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
