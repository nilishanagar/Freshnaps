import React from 'react';
import { Sparkles, Loader2, Check, AlertCircle } from 'lucide-react';

/**
 * Premium Indicator that handles auto-save status and last saved time.
 */
const AutoSaveIndicator = ({ isSaving, lastSaved, isDirty }) => {
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 dark:bg-surface-950 border border-gray-100 dark:border-surface-800 rounded-full text-xs font-medium">
      {isSaving ? (
        <>
          <Loader2 className="w-3.5 h-3.5 text-primary-500 animate-spin" />
          <span className="text-gray-500 dark:text-gray-400">Saving draft...</span>
        </>
      ) : isDirty ? (
        <>
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span className="text-amber-600 dark:text-amber-400">Unsaved changes</span>
        </>
      ) : lastSaved ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-500" />
          <span className="text-green-600 dark:text-green-400">
            Draft saved at {formatTime(lastSaved)}
          </span>
        </>
      ) : (
        <>
          <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-400">No draft saved</span>
        </>
      )}
    </div>
  );
};

export default AutoSaveIndicator;
