import React, { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

const OrderFilters = ({ activeTab = 'all', onTabChange, onSearch, initialSearch = '' }) => {
  const [searchValue, setSearchValue] = useState(initialSearch);
  const debounceRef = useRef(null);

  const tabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'active', label: 'Active' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'returned', label: 'Returned & Refunded' },
  ];

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(searchValue);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchValue]);

  return (
    <div className="bg-white dark:bg-surface-700 rounded-2xl shadow-card border border-surface-200 dark:border-surface-800/60 p-4 md:p-6 mb-6 transition-all duration-300">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Status Tabs */}
        <div className="flex items-center overflow-x-auto gap-2 pb-2 lg:pb-0 select-none scrollbar-thin scrollbar-thumb-surface-300">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-300 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-brand-gradient text-white border-transparent shadow-brand'
                    : 'bg-surface-50 hover:bg-surface-100/60 text-gray-600 border-surface-200 dark:bg-surface-800 dark:hover:bg-surface-900 dark:text-gray-300 dark:border-surface-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search by Order ID or Product Name..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-surface-300 dark:border-surface-800 bg-surface-50/30 dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:border-transparent text-gray-700 dark:text-gray-200 transition-all placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        
      </div>
    </div>
  );
};

export default OrderFilters;
