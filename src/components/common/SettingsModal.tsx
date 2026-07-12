import React from 'react';
import { useLayout } from '../../context/LayoutContext';

export const SettingsModal: React.FC = () => {
  const { layoutMode, setLayoutMode, isSettingsOpen, setIsSettingsOpen } = useLayout();

  if (!isSettingsOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={() => setIsSettingsOpen(false)}
    >
      <div
        className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-5 relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/60 pb-3">
          <h2 className="text-headline-md font-headline-md font-bold text-on-surface">
            Project Settings
          </h2>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container transition-all active:scale-95 cursor-pointer"
            aria-label="Close settings"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-label-caps font-label-caps text-outline uppercase tracking-wider text-[11px]">
              Layout Format
            </span>
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container rounded-lg border border-outline-variant/30">
              <button
                onClick={() => setLayoutMode('vertical')}
                className={`py-2 px-3 rounded-md text-body-sm font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  layoutMode === 'vertical'
                    ? 'bg-primary-container text-on-primary-container shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">stay_current_portrait</span>
                9:16 Vertical
              </button>
              <button
                onClick={() => setLayoutMode('horizontal')}
                className={`py-2 px-3 rounded-md text-body-sm font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  layoutMode === 'horizontal'
                    ? 'bg-primary-container text-on-primary-container shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">stay_current_landscape</span>
                16:9 Horizontal
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-body-sm text-on-surface-variant leading-relaxed p-3 bg-primary-container/5 rounded-lg border border-primary-container/10">
            <span className="font-bold text-primary">Layout Adaptive Preview:</span>
            Switching layout formats instantly refits the player canvas and asset proportions across the Dashboard editing workflows.
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-outline-variant/60">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-5 py-2 bg-primary text-on-primary font-bold text-body-sm rounded-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};
