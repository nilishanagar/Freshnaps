import React from 'react';
import SectionCard from '../ui/SectionCard';
import ToggleSwitch from '../ui/ToggleSwitch';
import { Eye } from 'lucide-react';

/**
 * Status and Visibility Sidebar Section.
 */
const StatusSection = ({ form, onChange }) => {
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <SectionCard
      title="Publish Status"
      subtitle="Configure visibility and launch scheduling options"
      icon={Eye}
    >
      <div className="space-y-4">
        {/* Status Dropdown */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
            Product Status
          </label>
          <select
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="input w-full font-semibold"
          >
            <option value="draft">Draft (Private)</option>
            <option value="published">Published (Storefront)</option>
            <option value="archived">Archived (Hidden)</option>
          </select>
        </div>

        {/* Scheduled Launch */}
        {form.status === 'draft' && (
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
              Schedule Launch Date
            </label>
            <input
              type="datetime-local"
              value={form.scheduledAt || ''}
              onChange={(e) => handleChange('scheduledAt', e.target.value)}
              className="input w-full text-xs font-sans"
            />
          </div>
        )}

        {/* Extra visibility toggles */}
        <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-surface-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Visible on Storefront Search
            </span>
            <ToggleSwitch
              size="sm"
              checked={form.isSearchable}
              onChange={(val) => handleChange('isSearchable', val)}
              id="isSearchable"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Include in Recommendations
            </span>
            <ToggleSwitch
              size="sm"
              checked={form.showInRecommendations}
              onChange={(val) => handleChange('showInRecommendations', val)}
              id="showInRecommendations"
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default StatusSection;
