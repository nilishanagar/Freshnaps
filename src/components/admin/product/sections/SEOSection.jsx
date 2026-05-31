import React from 'react';
import SectionCard from '../ui/SectionCard';
import { Search } from 'lucide-react';

/**
 * SEO & Search Optimization Section.
 */
const SEOSection = ({ form, onChange }) => {
  const handleChange = (field, value) => {
    onChange(`seo.${field}`, value);
  };

  // Preview helper values
  const metaTitle = form.seo?.metaTitle || form.name || 'Product Title';
  const metaDesc =
    form.seo?.metaDescription ||
    form.shortDescription ||
    'Provide premium sleep accessories & custom mattresses crafted to perfection.';
  const slug = form.seo?.seoSlug || form.sku || 'product-url';

  return (
    <SectionCard
      title="Search Engine Optimization (SEO)"
      subtitle="Improve product discoverability on Google, Yahoo and Bing"
      icon={Search}
    >
      <div className="space-y-6">
        {/* Google Snippet Live Preview */}
        <div className="p-4 bg-gray-50 dark:bg-surface-950 border border-gray-100 dark:border-surface-950 rounded-2xl space-y-1">
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
            Google Search Snippet Preview
          </span>
          <div className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium font-sans truncate text-lg">
            {metaTitle} | Freshnaps
          </div>
          <div className="text-xs text-green-700 dark:text-green-500 font-sans truncate">
            https://freshnaps.in/product/{slug}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-sans line-clamp-2 leading-relaxed">
            {metaDesc}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* SEO Title */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Meta Title
              </label>
              <span className="text-[10px] text-gray-400">
                {form.seo?.metaTitle?.length || 0} / 60 chars
              </span>
            </div>
            <input
              type="text"
              value={form.seo?.metaTitle || ''}
              onChange={(e) => handleChange('metaTitle', e.target.value)}
              className="input w-full"
              placeholder="Google search listing title"
              maxLength={60}
            />
          </div>

          {/* Meta Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Meta Description
              </label>
              <span className="text-[10px] text-gray-400">
                {form.seo?.metaDescription?.length || 0} / 160 chars
              </span>
            </div>
            <textarea
              rows={3}
              value={form.seo?.metaDescription || ''}
              onChange={(e) => handleChange('metaDescription', e.target.value)}
              className="input w-full resize-none"
              placeholder="Search result snippet details..."
              maxLength={160}
            />
          </div>

          {/* Keywords & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
                Focus Keyword
              </label>
              <input
                type="text"
                value={form.seo?.focusKeyword || ''}
                onChange={(e) => handleChange('focusKeyword', e.target.value)}
                className="input w-full"
                placeholder="e.g. Memory Foam Mattress"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
                SEO Slug URL
              </label>
              <input
                type="text"
                value={form.seo?.seoSlug || ''}
                onChange={(e) => handleChange('seoSlug', e.target.value)}
                className="input w-full font-mono text-xs"
                placeholder="e.g. comfort-foam-mattress"
              />
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default SEOSection;
