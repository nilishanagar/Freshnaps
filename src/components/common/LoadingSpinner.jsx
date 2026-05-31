import React from 'react';

const sizes = {
  sm: 'w-5 h-5 border-[2px]',
  md: 'w-8 h-8 border-[2.5px]',
  lg: 'w-12 h-12 border-[3px]',
  xl: 'w-16 h-16 border-[3.5px]',
};

const LoadingSpinner = ({ size = 'md', className = '' }) => (
  <div className={`${sizes[size]} rounded-full border-primary-100 dark:border-surface-800 border-t-primary-500 animate-spin ${className}`} />
);

export default LoadingSpinner;
