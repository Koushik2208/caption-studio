import React from 'react';
import { useProject } from '../../context/ProjectContext';

export const PositionInspector: React.FC = () => {
  const {
    layout,
    position,
    setPosition,
    captionPositionY,
    setCaptionPositionY,
    textAlign,
    setTextAlign,
  } = useProject();

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* SECTION: Position Presets */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
            Caption Position
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-on-surface font-medium">Position Presets</span>
          <div className={`grid ${layout === 'top-bottom-split' ? 'grid-cols-3' : 'grid-cols-2'} gap-1 bg-surface-container-low p-1 rounded-lg`}>
            <button
              type="button"
              onClick={() => setPosition('bottom')}
              className={`h-8 flex items-center justify-center rounded-md text-xs font-medium transition-all cursor-pointer ${
                position === 'bottom'
                  ? 'bg-white border border-primary/40 text-primary shadow-2xs font-semibold'
                  : 'border border-transparent text-on-surface-variant hover:bg-surface-container-high/60'
              }`}
            >
              Bottom
            </button>
            <button
              type="button"
              onClick={() => setPosition('center')}
              className={`h-8 flex items-center justify-center rounded-md text-xs font-medium transition-all cursor-pointer ${
                position === 'center'
                  ? 'bg-white border border-primary/40 text-primary shadow-2xs font-semibold'
                  : 'border border-transparent text-on-surface-variant hover:bg-surface-container-high/60'
              }`}
            >
              Center
            </button>
            {layout === 'top-bottom-split' && (
              <button
                type="button"
                onClick={() => setPosition('split-center')}
                className={`h-8 flex items-center justify-center rounded-md text-xs font-medium transition-all cursor-pointer ${
                  position === 'split-center'
                    ? 'bg-white border border-primary/40 text-primary shadow-2xs font-semibold'
                    : 'border border-transparent text-on-surface-variant hover:bg-surface-container-high/60'
                }`}
              >
                Split Center
              </button>
            )}
          </div>
        </div>
      </section>

      {/* SECTION: Continuous Vertical Position */}
      <section className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-on-surface font-medium">Vertical Position</span>
          <span className="text-[11px] text-outline font-mono">
            {Math.round(captionPositionY * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0.10}
          max={0.90}
          step={0.01}
          value={captionPositionY}
          onChange={(e) => setCaptionPositionY(Number(e.target.value))}
          className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[10px] text-outline font-mono px-0.5">
          <span>Top (10%)</span>
          <span>Center (50%)</span>
          <span>Bottom (90%)</span>
        </div>
      </section>

      {/* SECTION: Caption Alignment */}
      <section className="flex flex-col gap-2">
        <span className="text-xs text-on-surface font-medium">Alignment</span>
        <div className="grid grid-cols-3 gap-1 bg-surface-container-low p-1 rounded-lg">
          {(
            [
              { value: 'left', label: 'Left', icon: 'format_align_left' },
              { value: 'center', label: 'Center', icon: 'format_align_center' },
              { value: 'right', label: 'Right', icon: 'format_align_right' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTextAlign(opt.value)}
              className={`h-8 flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                textAlign === opt.value
                  ? 'bg-white border border-primary/40 text-primary shadow-2xs font-semibold'
                  : 'border border-transparent text-on-surface-variant hover:bg-surface-container-high/60'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      <hr className="border-outline-variant/40" />

      {/* Info Callout */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px] text-outline shrink-0 mt-0.5">
          info
        </span>
        <div className="flex flex-col gap-0.5 text-[11px] leading-normal text-outline">
          <span className="font-semibold text-on-surface">Composition-Aware Positioning</span>
          <span>
            Caption presets and vertical slider adapt smoothly across Full Bleed, Floating Card, Top/Bottom Split, and Left/Right Split layouts.
          </span>
        </div>
      </div>
    </div>
  );
};
