import React from 'react';
import { Truck, RotateCcw, Shield, BadgeCheck, CreditCard, Headphones } from 'lucide-react';

const badges = [
  { icon: Truck, label: 'Free Delivery', sub: 'Pan-India', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  { icon: RotateCcw, label: '30-Day Returns', sub: 'Easy Returns', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20' },
  { icon: Shield, label: 'Warranty', sub: 'Guaranteed', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/20' },
  { icon: BadgeCheck, label: 'Genuine', sub: '100% Original', color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-950/20' },
  { icon: CreditCard, label: 'Secure Pay', sub: 'SSL Encrypted', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20' },
  { icon: Headphones, label: 'Support', sub: '24/7 Help', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/20' },
];

const TrustBadges = ({ warranty }) => (
  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
    {badges.map(({ icon: Icon, label, sub, color, bg }) => (
      <div
        key={label}
        className="flex flex-col items-center text-center p-4 rounded-xl bg-white dark:bg-surface-950 border border-gray-200 dark:border-surface-700 hover:border-gray-300 dark:hover:border-surface-600 transition-all group cursor-default"
      >
        <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform`}>
          <Icon size={18} className={color} />
        </div>
        <span className="text-[11px] font-bold text-gray-800 dark:text-white leading-tight">{label}</span>
        <span className="text-[10px] text-gray-400 leading-tight mt-0.5">{label === 'Warranty' ? (warranty || sub) : sub}</span>
      </div>
    ))}
  </div>
);

export default TrustBadges;
