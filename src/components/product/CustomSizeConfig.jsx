import React from 'react';
import { motion } from 'framer-motion';
import { Ruler, Check, Info } from 'lucide-react';

const CUSTOM_SIZE_PRESETS = [
  { label: 'Single Bed', length: 72, width: 36, thickness: 5 },
  { label: 'Double Bed', length: 75, width: 48, thickness: 6 },
  { label: 'Queen Bed', length: 78, width: 60, thickness: 6 },
  { label: 'King Bed', length: 78, width: 72, thickness: 8 },
  { label: 'Super King', length: 84, width: 72, thickness: 8 },
];

const CustomSizeConfig = ({
  customLength, setCustomLength,
  customWidth, setCustomWidth,
  customThickness, setCustomThickness,
  activePreset, setActivePreset,
  customSurcharge,
}) => {
  const applyPreset = (preset, idx) => {
    setActivePreset(idx);
    setCustomLength(String(preset.length));
    setCustomWidth(String(preset.width));
    setCustomThickness(String(preset.thickness));
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-gray-200 dark:border-surface-700 overflow-hidden bg-white dark:bg-surface-900"
    >
      <div className="px-5 py-3.5 bg-gray-50 dark:bg-surface-950 border-b border-gray-200 dark:border-surface-700 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Ruler size={16} className="text-primary-600 dark:text-primary-400" />
          <div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-white">Custom Size</h4>
            <p className="text-[10px] text-gray-400">Configure your exact dimensions</p>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full">
          +5% surcharge
        </span>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Presets</p>
          <div className="flex flex-wrap gap-2">
            {CUSTOM_SIZE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(preset, idx)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                  activePreset === idx
                    ? 'border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-400 shadow-sm font-bold'
                    : 'border-gray-300 dark:border-surface-600 text-gray-500 dark:text-gray-400 hover:border-gray-500'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Length (in)', value: customLength, setter: setCustomLength, ph: '75', min: 24, max: 120 },
            { label: 'Width (in)', value: customWidth, setter: setCustomWidth, ph: '60', min: 24, max: 120 },
            { label: 'Thickness (in)', value: customThickness, setter: setCustomThickness, ph: '6', min: 4, max: 14 },
          ].map(({ label, value, setter, ph, min, max }) => (
            <div key={label}>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
              <input
                type="number" min={min} max={max} value={value}
                onChange={e => { setter(e.target.value); setActivePreset(null); }}
                placeholder={ph}
                className="w-full text-sm font-semibold text-gray-800 dark:text-white bg-gray-50 dark:bg-surface-950 border border-gray-200 dark:border-surface-700 rounded-lg px-3 py-2.5 outline-none focus:border-primary-500 transition-all"
              />
            </div>
          ))}
        </div>

        {customLength && customWidth && customThickness && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 dark:bg-surface-950 border border-gray-200 dark:border-surface-700 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check size={14} className="text-primary-500" />
              <span className="text-xs font-bold text-gray-800 dark:text-white">Your Custom Size</span>
            </div>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{customLength}" × {customWidth}" × {customThickness}"</span>
          </motion.div>
        )}

        <div className="flex items-start gap-2 text-[11px] text-gray-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg p-3">
          <Info size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p>Custom sizes require <strong className="text-amber-600 dark:text-amber-400">3-5 extra business days</strong>. Verify your bed frame dimensions before ordering.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default CustomSizeConfig;
