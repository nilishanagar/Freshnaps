import React from 'react';

const SectionHeading = ({ eyebrow, title, gradient, subtitle, className = '' }) => (
  <div className={`mb-8 ${className}`}>
    {eyebrow && (
      <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em]">
        {eyebrow}
      </span>
    )}
    <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white mt-1">
      {title}{' '}
      {gradient && <span className="text-transparent bg-clip-text bg-brand-gradient">{gradient}</span>}
    </h2>
    {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>}
  </div>
);

export default SectionHeading;
