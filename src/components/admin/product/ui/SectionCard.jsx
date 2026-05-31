import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Reusable card wrapper for product form sections.
 * Props:
 *   title: string
 *   subtitle?: string
 *   icon?: LucideIcon component
 *   collapsible?: boolean
 *   defaultOpen?: boolean
 *   className?: string
 *   actions?: ReactNode
 */
const SectionCard = ({
  title,
  subtitle,
  icon: Icon,
  collapsible = false,
  defaultOpen = true,
  className = '',
  actions,
  children,
}) => {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div
      className={`bg-white dark:bg-surface-900 rounded-2xl shadow-card border border-gray-100 dark:border-surface-800 overflow-hidden transition-shadow duration-200 hover:shadow-card-hover ${className}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-surface-800 ${collapsible ? 'cursor-pointer select-none' : ''}`}
        onClick={collapsible ? () => setOpen((p) => !p) : undefined}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center flex-shrink-0">
              <Icon size={16} className="text-primary-600 dark:text-primary-400" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actions && <div onClick={(e) => e.stopPropagation()}>{actions}</div>}
          {collapsible && (
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          )}
        </div>
      </div>

      {/* Body */}
      {(!collapsible || open) && (
        <div className="p-6">{children}</div>
      )}
    </div>
  );
};

export default SectionCard;
