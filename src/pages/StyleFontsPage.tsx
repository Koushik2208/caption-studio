import React from 'react';
import { SubPanelView } from '../components/common/SubPanelView';
import { useProject } from '../context/ProjectContext';
import { FONT_PRESETS } from '../captions/styles/presets';

export const StyleFontsPage: React.FC = () => {
  const { presetName, setPresetName } = useProject();

  return (
    <SubPanelView title="Font" backTo="/style" backLabel="Back to Style">
      <div className="grid grid-cols-2 gap-2">
        {FONT_PRESETS.map((p) => (
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
