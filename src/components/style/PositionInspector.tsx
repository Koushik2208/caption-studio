import React from 'react';
import { useProject } from '../../context/ProjectContext';
import type { CaptionPosition } from '../../captions/styles/types';

interface PositionOption {
  value: CaptionPosition;
  label: string;
  icon: string;
  description: string;
}

const POSITION_OPTIONS: PositionOption[] = [
  {
    value: 'top',
    label: 'Top',
    icon: 'align_vertical_top',
    description: 'Positioned near the upper area with safe status bar margin',
  },
  {
    value: 'center',
    label: 'Center',
    icon: 'align_vertical_center',
    description: 'Vertically and horizontally centered for maximum focus',
  },
  {
    value: 'bottom',
    label: 'Bottom',
    icon: 'align_vertical_bottom',
    description: 'Standard lower third placement with safe home indicator clearance',
  },
];

export const PositionInspector: React.FC = () => {
  const { position, setPosition } = useProject();

  return (
    <div className="flex flex-col gap-6 p-4">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
            Vertical Placement
          </span>
        </div>

        {/* Visual Placement Selector */}
        <div className="flex flex-col gap-2.5">
          {POSITION_OPTIONS.map((opt) => {
            const isSelected = position === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPosition(opt.value)}
                className={`flex items-center gap-3.5 p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary-container/5 shadow-xs ring-1 ring-primary'
                    : 'border-outline-variant/60 bg-surface-container-lowest hover:border-primary/50 hover:bg-surface-container-low'
                }`}
              >
                {/* Visual miniature representation */}
                <div
                  className={`w-12 h-16 rounded-md border flex flex-col items-center justify-between p-1 shrink-0 ${
                    isSelected
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-outline-variant/50 bg-surface-container-low'
                  }`}
                >
                  <div
                    className={`w-8 h-1.5 rounded-full transition-all ${
                      opt.value === 'top'
                        ? isSelected
                          ? 'bg-primary shadow-xs'
                          : 'bg-on-surface-variant'
                        : 'opacity-0'
                    }`}
                  />
                  <div
                    className={`w-8 h-1.5 rounded-full transition-all ${
                      opt.value === 'center'
                        ? isSelected
                          ? 'bg-primary shadow-xs'
                          : 'bg-on-surface-variant'
                        : 'opacity-0'
                    }`}
                  />
                  <div
                    className={`w-8 h-1.5 rounded-full transition-all ${
                      opt.value === 'bottom'
                        ? isSelected
                          ? 'bg-primary shadow-xs'
                          : 'bg-on-surface-variant'
                        : 'opacity-0'
                    }`}
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      {opt.icon}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        isSelected ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      {opt.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-outline mt-0.5 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <hr className="border-outline-variant/40" />

      {/* Info Callout */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px] text-outline shrink-0 mt-0.5">
          info
        </span>
        <div className="flex flex-col gap-0.5 text-[11px] leading-normal text-outline">
          <span className="font-semibold text-on-surface">Safe-Zone Margin Rule</span>
          <span>
            Captions automatically maintain a 9% relative height buffer to stay clear of TikTok/Reels UI badges and platform navigation.
          </span>
        </div>
      </div>
    </div>
  );
};
