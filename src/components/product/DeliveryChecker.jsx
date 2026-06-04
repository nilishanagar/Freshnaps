import React, { useState } from 'react';
import { MapPin, Check, Truck, RotateCcw, CreditCard } from 'lucide-react';

const DeliveryChecker = ({ isFreeShipping = true, isCOD = true }) => {
  const [pincode, setPincode] = useState(() => localStorage.getItem('fn_pincode') || '');
  const [checked, setChecked] = useState(() => !!localStorage.getItem('fn_pincode'));

  const getDeliveryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
  };

  const handleCheck = () => {
    if (pincode.length === 6) {
      localStorage.setItem('fn_pincode', pincode);
      setChecked(true);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-surface-700 p-4 bg-white dark:bg-surface-900">
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
        <MapPin size={14} className="text-primary-500" /> Delivery & Services
      </p>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          maxLength={6}
          value={pincode}
          onChange={e => { setPincode(e.target.value.replace(/\D/g, '')); setChecked(false); }}
          placeholder="Enter Pincode"
          className="flex-1 text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-surface-950 border border-gray-200 dark:border-surface-700 rounded-lg px-3 py-2 outline-none focus:border-primary-500 transition-all"
        />
        <button
          onClick={handleCheck}
          disabled={pincode.length !== 6}
          className="px-4 py-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 disabled:bg-gray-200 dark:disabled:bg-surface-700 text-white dark:text-gray-900 disabled:text-gray-400 text-xs font-bold rounded-lg transition-colors"
        >
          Check
        </button>
      </div>

      {checked && (
        <div className="space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
            <Check size={14} className="text-emerald-500 flex-shrink-0" />
            <span>Delivery by <strong className="text-gray-800 dark:text-white">{getDeliveryDate()}</strong></span>
          </div>
          {isFreeShipping && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <Truck size={14} className="text-emerald-500 flex-shrink-0" />
              <span>Free Shipping</span>
            </div>
          )}
          {isCOD && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <CreditCard size={14} className="text-emerald-500 flex-shrink-0" />
              <span>Cash on Delivery Available</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
            <RotateCcw size={14} className="text-emerald-500 flex-shrink-0" />
            <span>Easy 30-Day Returns</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryChecker;
