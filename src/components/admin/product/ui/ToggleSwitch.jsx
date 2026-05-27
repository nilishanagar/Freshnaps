import React from 'react';

/**
 * Premium toggle switch.
 * Props: checked, onChange, disabled?, size? ('sm'|'md'|'lg')
 */
const ToggleSwitch = ({ checked, onChange, disabled = false, size = 'md', label, id }) => {
  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', on: 'translate-x-4', off: 'translate-x-0.5' },
    md: { track: 'w-10 h-6', thumb: 'w-4 h-4', on: 'translate-x-4', off: 'translate-x-1' },
    lg: { track: 'w-12 h-7', thumb: 'w-5 h-5', on: 'translate-x-5', off: 'translate-x-1' },
  };
  const s = sizes[size];

  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-2.5 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <div
        className={`relative ${s.track} rounded-full transition-all duration-200 focus-within:ring-2 focus-within:ring-gold-400 focus-within:ring-offset-1 ${
          checked
            ? 'bg-gold-500 shadow-sm'
            : 'bg-gray-200 dark:bg-navy-600'
        }`}
      >
        <div
          className={`absolute top-1/2 -translate-y-1/2 ${s.thumb} rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? s.on : s.off
          }`}
        />
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          className="sr-only"
          disabled={disabled}
        />
      </div>
      {label && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">
          {label}
        </span>
      )}
    </label>
  );
};

export default ToggleSwitch;
