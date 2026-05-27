import React from 'react';
import SectionCard from '../ui/SectionCard';
import TagInput from '../ui/TagInput';
import ToggleSwitch from '../ui/ToggleSwitch';
import { Tag } from 'lucide-react';

/**
 * Tags and Badging Sidebar Section.
 */
const TagsSection = ({ form, onChange }) => {
  const handleTagsChange = (newTags) => {
    onChange('tags', newTags);
  };

  const handleToggle = (field, val) => {
    onChange(field, val);
  };

  return (
    <SectionCard
      title="Tags & Store Badging"
      subtitle="Organize navigation categories and highlight with storefront badges"
      icon={Tag}
    >
      <div className="space-y-4">
        {/* Tags input */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
            Product Tags
          </label>
          <TagInput tags={form.tags || []} onChange={handleTagsChange} />
        </div>

        {/* Store badges (Featured, Bestseller, Trending, New Arrival) */}
        <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-navy-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Featured Product
            </span>
            <ToggleSwitch
              size="sm"
              checked={form.isFeatured}
              onChange={(val) => handleToggle('isFeatured', val)}
              id="isFeatured"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Bestseller Tag
            </span>
            <ToggleSwitch
              size="sm"
              checked={form.isBestseller}
              onChange={(val) => handleToggle('isBestseller', val)}
              id="isBestseller"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Trending Tag
            </span>
            <ToggleSwitch
              size="sm"
              checked={form.isTrending}
              onChange={(val) => handleToggle('isTrending', val)}
              id="isTrending"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              New Arrival Badge
            </span>
            <ToggleSwitch
              size="sm"
              checked={form.isNewArrival}
              onChange={(val) => handleToggle('isNewArrival', val)}
              id="isNewArrival"
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default TagsSection;
