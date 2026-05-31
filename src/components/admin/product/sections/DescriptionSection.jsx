import React from 'react';
import SectionCard from '../ui/SectionCard';
import RichTextEditor from '../ui/RichTextEditor';
import { AlignLeft } from 'lucide-react';

/**
 * Description and Rich Text Content Section.
 */
const DescriptionSection = ({ form, onChange }) => {
  const [activeTab, setActiveTab] = React.useState('description');

  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <SectionCard
      title="Product Content & Details"
      subtitle="Provide rich descriptions, wash instructions, and materials details"
      icon={AlignLeft}
    >
      <div className="space-y-4">
        {/* Short Description */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase">
            Short Description *
          </label>
          <input
            type="text"
            required
            value={form.shortDescription}
            onChange={(e) => handleChange('shortDescription', e.target.value)}
            className="input w-full"
            placeholder="A compelling one-liner for listing cards and cards"
          />
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-gray-100 dark:border-surface-800">
          {[
            { id: 'description', label: 'Full Description' },
            { id: 'material', label: 'Material & Construction' },
            { id: 'washCare', label: 'Wash & Care Instructions' },
            { id: 'warranty', label: 'Warranty Details' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'description' && (
            <RichTextEditor
              value={form.description}
              onChange={(val) => handleChange('description', val)}
              placeholder="Write premium product description here..."
            />
          )}

          {activeTab === 'material' && (
            <textarea
              rows={5}
              value={form.material || ''}
              onChange={(e) => handleChange('material', e.target.value)}
              className="input w-full resize-none font-sans"
              placeholder="Detail the foam composition, fabrics, organic cotton, etc."
            />
          )}

          {activeTab === 'washCare' && (
            <textarea
              rows={5}
              value={form.washCare || ''}
              onChange={(e) => handleChange('washCare', e.target.value)}
              className="input w-full resize-none font-sans"
              placeholder="Dry clean recommended. Gentle wash in cold water..."
            />
          )}

          {activeTab === 'warranty' && (
            <textarea
              rows={5}
              value={form.warranty || ''}
              onChange={(e) => handleChange('warranty', e.target.value)}
              className="input w-full resize-none font-sans"
              placeholder="e.g. 5-year brand warranty covering structural defects..."
            />
          )}
        </div>
      </div>
    </SectionCard>
  );
};

export default DescriptionSection;
