import React from 'react';

const OrderStatusBadge = ({ status }) => {
  const config = {
    placed: {
      label: 'Order Placed',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/50',
    },
    confirmed: {
      label: 'Confirmed',
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-100 dark:border-indigo-900/50',
    },
    packed: {
      label: 'Packed & Ready',
      bg: 'bg-cyan-50 dark:bg-cyan-950/30',
      text: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-100 dark:border-cyan-900/50',
    },
    shipped: {
      label: 'Shipped',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-100 dark:border-purple-900/50',
    },
    out_for_delivery: {
      label: 'Out for Delivery',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/50',
      pulse: true,
    },
    delivered: {
      label: 'Delivered',
      bg: 'bg-green-50 dark:bg-green-950/30',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-100 dark:border-green-900/50',
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-900/50',
    },
    returned: {
      label: 'Returned',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-100 dark:border-orange-900/50',
    },
    refunded: {
      label: 'Refunded',
      bg: 'bg-teal-50 dark:bg-teal-950/30',
      text: 'text-teal-600 dark:text-teal-400',
      border: 'border-teal-100 dark:border-teal-900/50',
    },
  };

  const current = config[status?.toLowerCase()] || {
    label: status || 'Unknown',
    bg: 'bg-gray-50 dark:bg-gray-900',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-100 dark:border-gray-800',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${current.bg} ${current.text} ${current.border} shadow-sm backdrop-blur-[2px] transition-all`}
    >
      {current.pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
      )}
      {current.label}
    </span>
  );
};

export default OrderStatusBadge;
