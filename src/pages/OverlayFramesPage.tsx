import React from 'react';
import { SubPanelView } from '../components/common/SubPanelView';
import { Card } from '../components/common/Card';
import { useProject } from '../context/ProjectContext';
import { FRAME_OPTIONS, FRAME_SHELL_COLORS } from './overlayOptions';

export const OverlayFramesPage: React.FC = () => {
  const { frameVariant, setFrameVariant, frameBgColor, setFrameBgColor } = useProject();

  return (
    <SubPanelView title="Frame" backTo="/overlay" backLabel="Back to Overlay">
      <Card className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          {FRAME_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setFrameVariant(option.value)}
              className={`h-14 flex items-center justify-center px-2 text-center border rounded-lg hover:border-primary transition-all duration-150 cursor-pointer ${frameVariant === option.value ? 'active-ring border-primary' : 'border-outline-variant'
                }`}
            >
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>

        {frameVariant === 'minimalBezel' && (
          <div className="flex flex-col gap-1.5 border-t border-outline-variant/30 pt-3 animate-in slide-in-from-top-1 duration-150">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase text-[10px]">
              Shell Color
            </span>
            <div className="flex gap-2">
              {FRAME_SHELL_COLORS.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setFrameBgColor(color.hex)}
                  className={`w-8 h-8 rounded-full shadow-sm hover:scale-105 transition-transform active:scale-90 cursor-pointer ${color.bgClass} ${frameBgColor === color.hex ? 'active-ring' : ''
                    }`}
                  style={color.hex === '#ffffff' ? {} : { backgroundColor: color.hex }}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>
        )}
      </Card>
    </SubPanelView>
  );
};
