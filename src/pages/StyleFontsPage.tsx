import React, { useState } from 'react';
import { SubPanelView } from '../components/common/SubPanelView';
import { useProject } from '../context/ProjectContext';
import { FONT_PRESETS, type FontPresetOrientation } from '../captions/styles/presets';

const ORIENTATION_FILTERS: { value: FontPresetOrientation | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'vertical', label: 'Vertical' },
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'both', label: 'Both' },
];

export const StyleFontsPage: React.FC = () => {
  const { presetName, setPresetName } = useProject();
  const [orientationFilter, setOrientationFilter] = useState<FontPresetOrientation | 'all'>('all');

  const filteredPresets =
    orientationFilter === 'all' ? FONT_PRESETS : FONT_PRESETS.filter((p) => p.orientation === orientationFilter);

  return (
    <SubPanelView title="Font" backTo="/style" backLabel="Back to Style">
      <div className="grid grid-cols-4 gap-1 bg-surface-container-low p-1 rounded-lg">
        {ORIENTATION_FILTERS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setOrientationFilter(opt.value)}
            className={`h-8 flex items-center justify-center rounded-md text-xs font-medium transition-all cursor-pointer ${orientationFilter === opt.value
                ? 'bg-white border border-primary/40 text-primary'
                : 'border border-transparent hover:bg-primary-container/20'
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {filteredPresets.map((p) => (
          <button
            key={p.name}
            onClick={() => setPresetName(p.name)}
            className={`h-16 flex items-center justify-center px-2 text-center border rounded-lg hover:border-primary transition-all duration-150 cursor-pointer ${presetName === p.name ? 'active-ring border-primary' : 'border-outline-variant'
              }`}
          >
            <span className={`text-sm leading-tight ${p.labelClass}`} style={{ fontFamily: p.fontFamily }}>
              {p.name}
            </span>
          </button>
        ))}
      </div>
    </SubPanelView>
  );
};
