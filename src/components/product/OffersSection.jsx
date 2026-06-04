import React from 'react';
import { Gift, CreditCard, ChevronRight } from 'lucide-react';

const OFFERS = [
  { icon: Gift, amount: '₹500', label: 'Get Free Gift Coupon', desc: 'Get ₹500 Coupon on order above ₹1499' },
  { icon: Gift, amount: '₹1000', label: 'Get Free Gift Coupon', desc: 'Get ₹1000 Coupon on order above ₹4999' },
  { icon: CreditCard, amount: '10%', label: 'Bank Cashback', desc: 'Get 10% cashback with ICICI/HDFC cards' },
];

const OffersSection = () => (
  <div>
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">Bank Offers</p>
      <button className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">View All</button>
    </div>

    {/* Horizontal scrollable cards */}
    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
      {OFFERS.map((offer, i) => {
        const Icon = offer.icon;
        return (
          <div
            key={i}
            className="flex items-start gap-3 min-w-[260px] p-3.5 rounded-xl border border-gray-200 dark:border-surface-700 bg-white dark:bg-surface-900 hover:border-gray-300 dark:hover:border-surface-600 transition-colors flex-shrink-0 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center flex-shrink-0 border border-amber-200/50 dark:border-amber-800/30">
              <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400">{offer.amount}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-white leading-tight">
                {offer.label}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{offer.desc}</p>
            </div>
            <ChevronRight size={14} className="text-gray-300 dark:text-surface-600 flex-shrink-0 mt-1 group-hover:text-gray-500 transition-colors" />
          </div>
        );
      })}
    </div>
  </div>
);

export default OffersSection;
