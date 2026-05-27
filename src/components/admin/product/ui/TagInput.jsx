import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

/**
 * TagInput component with luxury style.
 * Allows adding chips with typing + Enter.
 */
const TagInput = ({ tags = [], onChange, placeholder = 'Add tag...' }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = input.trim();
      if (val && !tags.includes(val)) {
        onChange([...tags, val]);
        setInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 p-2 border border-gray-200 dark:border-navy-700 bg-gray-50/50 dark:bg-navy-900 rounded-xl focus-within:ring-2 focus-within:ring-gold-400 focus-within:border-transparent min-h-[46px] items-center">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gold-800 dark:text-gold-200 bg-gold-50 dark:bg-gold-500/10 rounded-lg"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-gold-600 dark:text-gold-400 hover:text-gold-950 dark:hover:text-white transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 bg-transparent border-0 outline-none text-sm text-gray-800 dark:text-white min-w-[120px] focus:ring-0"
        />
      </div>
      <p className="text-[10px] text-gray-400 mt-1">Press Enter to add a tag</p>
    </div>
  );
};

export default TagInput;
