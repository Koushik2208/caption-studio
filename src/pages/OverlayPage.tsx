import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { Card } from '../components/common/Card';
import { CondensedCard } from '../components/common/CondensedCard';
import { Button } from '../components/common/Button';
import { FRAME_OPTIONS, CONDENSED_FRAME_COUNT } from './overlayOptions';

export const OverlayPage: React.FC = () => {
  const {
    watermarkEnabled: isWatermarkEnabled,
    setWatermarkEnabled: setIsWatermarkEnabled,
    watermarkOpacity,
    setWatermarkOpacity,
    watermarkPosition,
    setWatermarkPosition,
    progressBarEnabled: isProgressEnabled,
    setProgressBarEnabled: setIsProgressEnabled,
    progressBarColor: progressColor,
    setProgressBarColor: setProgressColor,
    progressBarPosition: progressPosition,
    setProgressBarPosition: setProgressPosition,
    frameVariant,
    setFrameVariant,
    filmDustEnabled,
    setFilmDustEnabled,
    saveNow,
  } = useProject();

  const [justSaved, setJustSaved] = useState(false);

  const handleSaveClick = () => {
    saveNow();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  const colors = [
    { name: 'Primary Blue', hex: '#0066ff', bgClass: 'bg-primary-container' },
    { name: 'Error Red', hex: '#ba1a1a', bgClass: 'bg-error' },
    { name: 'Accent Pink', hex: '#ffdbd0', bgClass: 'bg-tertiary-fixed' },
    { name: 'White', hex: '#ffffff', bgClass: 'bg-white border border-outline-variant' },
  ];

  return (
    <>
      {/* Right Tool Panel (Overlay Tools) */}
      <aside className="w-panel-width min-w-panel-width max-w-panel-width bg-surface-bright border-l border-outline-variant z-40 flex flex-col h-full shrink-0 grow-0">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <h2 className="text-headline-md font-headline-md font-bold text-on-surface">Overlay Tools</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-stack-gap">
          {/* Card 1: Watermark Tool */}
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">branding_watermark</span>
                </div>
                <div>
                  <h4 className="text-body-md font-bold text-on-surface">Watermark</h4>
                  <p className="text-body-sm text-outline text-[12px]">Brand your video</p>
                </div>
              </div>
              <button
                onClick={() => setIsWatermarkEnabled(!isWatermarkEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none ${isWatermarkEnabled ? 'bg-primary-container' : 'bg-surface-variant'
                  }`}
                aria-label="Toggle watermark"
              >
                <div
                  className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform shadow-xs ${isWatermarkEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            {isWatermarkEnabled && (
              <div className="flex flex-col gap-3 border-t border-outline-variant/30 pt-3 animate-in slide-in-from-top-1 duration-150">
                <div className="flex flex-col gap-1">
                  <span className="text-label-caps font-label-caps text-on-surface-variant uppercase text-[10px]">
                    Opacity: {watermarkOpacity}%
                  </span>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                    className="w-full h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary-container"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-label-caps font-label-caps text-on-surface-variant uppercase text-[10px]">
                    Watermark Placement
                  </span>
                  <div className="grid grid-cols-2 gap-2 max-w-[120px]">
                    <button
                      onClick={() => setWatermarkPosition('tl')}
                      className={`h-8 rounded border flex items-center justify-center cursor-pointer hover:bg-primary-container/10 transition-colors ${watermarkPosition === 'tl' ? 'border-primary/40 bg-primary-container/10' : 'border-outline-variant/30 bg-white'
                        }`}
                    >
                      <span className="text-[10px] text-label-caps font-label-caps font-semibold">T-L</span>
                    </button>
                    <button
                      onClick={() => setWatermarkPosition('tr')}
                      className={`h-8 rounded border flex items-center justify-center cursor-pointer hover:bg-primary-container/10 transition-colors ${watermarkPosition === 'tr' ? 'border-primary/40 bg-primary-container/10' : 'border-outline-variant/30 bg-white'
                        }`}
                    >
                      <span className="text-[10px] text-label-caps font-label-caps font-semibold">T-R</span>
                    </button>
                    <button
                      onClick={() => setWatermarkPosition('bl')}
                      className={`h-8 rounded border flex items-center justify-center cursor-pointer hover:bg-primary-container/10 transition-colors ${watermarkPosition === 'bl' ? 'border-primary/40 bg-primary-container/10' : 'border-outline-variant/30 bg-white'
                        }`}
                    >
                      <span className="text-[10px] text-label-caps font-label-caps font-semibold">B-L</span>
                    </button>
                    <button
                      onClick={() => setWatermarkPosition('br')}
                      className={`h-8 rounded border flex items-center justify-center cursor-pointer hover:bg-primary-container/10 transition-colors ${watermarkPosition === 'br' ? 'border-primary/40 bg-primary-container/10' : 'border-outline-variant/30 bg-white'
                        }`}
                    >
                      <span className="text-[10px] text-label-caps font-label-caps font-semibold">B-R</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Card 2: Progress Bar Tool */}
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined">linear_scale</span>
                </div>
                <div>
                  <h4 className="text-body-md font-bold text-on-surface">Progress Bar</h4>
                  <p className="text-body-sm text-outline text-[12px]">Show clip duration</p>
                </div>
              </div>
              <button
                onClick={() => setIsProgressEnabled(!isProgressEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none ${isProgressEnabled ? 'bg-primary-container' : 'bg-surface-variant'
                  }`}
                aria-label="Toggle progress bar"
              >
                <div
                  className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform shadow-xs ${isProgressEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            {isProgressEnabled && (
              <div className="flex flex-col gap-3 border-t border-outline-variant/30 pt-3 animate-in slide-in-from-top-1 duration-150">
                <div className="flex flex-col gap-1.5">
                  <span className="text-label-caps font-label-caps text-on-surface-variant uppercase text-[10px]">
                    Bar Fill Color
                  </span>
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.hex}
                        onClick={() => setProgressColor(color.hex)}
                        className={`w-8 h-8 rounded-full shadow-sm hover:scale-105 transition-transform active:scale-90 cursor-pointer ${color.bgClass} ${progressColor === color.hex ? 'active-ring' : ''
                          }`}
                        style={color.hex === '#ffffff' ? {} : { backgroundColor: color.hex }}
                        aria-label={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-label-caps font-label-caps text-on-surface-variant uppercase text-[10px]">
                    Vertical Placement
                  </span>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container rounded-lg border border-outline-variant/30">
                    <button
                      onClick={() => setProgressPosition('bottom')}
                      className={`py-1.5 px-3 rounded text-label-caps font-label-caps text-[10px] uppercase font-bold transition-all duration-200 cursor-pointer ${progressPosition === 'bottom'
                          ? 'bg-primary-container text-on-primary-container shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                    >
                      Bottom
                    </button>
                    <button
                      onClick={() => setProgressPosition('top')}
                      className={`py-1.5 px-3 rounded text-label-caps font-label-caps text-[10px] uppercase font-bold transition-all duration-200 cursor-pointer ${progressPosition === 'top'
                          ? 'bg-primary-container text-on-primary-container shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                    >
                      Top
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Card 3: Frame Tool (condensed) */}
          <CondensedCard className="flex flex-col gap-4" moreTo="/overlay/frames" moreLabel="More frames">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined">crop_free</span>
              </div>
              <div>
                <h4 className="text-body-md font-bold text-on-surface">Frame</h4>
                <p className="text-body-sm text-outline text-[12px]">Wrap your video in a device or border</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {FRAME_OPTIONS.slice(0, CONDENSED_FRAME_COUNT).map((option) => (
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
          </CondensedCard>

          {/* Card 4: Texture Overlays (condensed) */}
          <CondensedCard className="flex flex-col gap-4" moreTo="/overlay/texture-overlays" moreLabel="More overlays">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined">texture</span>
              </div>
              <div>
                <h4 className="text-body-md font-bold text-on-surface">Texture Overlays</h4>
                <p className="text-body-sm text-outline text-[12px]">Film-look grain, bloom & grid</p>
              </div>
            </div>

            {/* Film Dust - on/off only, no intensity control */}
            <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3">
              <span className="text-body-sm font-semibold text-on-surface">Film Dust</span>
              <button
                onClick={() => setFilmDustEnabled(!filmDustEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none ${filmDustEnabled ? 'bg-primary-container' : 'bg-surface-variant'
                  }`}
                aria-label="Toggle film dust"
              >
                <div
                  className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform shadow-xs ${filmDustEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>
          </CondensedCard>

          <div className="p-4 bg-primary-container/5 rounded-xl border border-primary-container/10">
            <p className="text-body-sm text-on-primary-fixed-variant leading-relaxed">
              <span className="font-bold">Pro Tip:</span> Overlays are rendered in real-time. Use the export tab to bake them into your final file.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-outline-variant bg-surface-container-lowest">
          <Button
            onClick={handleSaveClick}
            className="w-full bg-on-surface text-surface-bright hover:bg-on-surface/90 py-3 text-label-caps font-label-caps font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">
              {justSaved ? 'check' : 'save'}
            </span>
            {justSaved ? 'SAVED' : 'SAVE SETTINGS'}
          </Button>
        </div>
      </aside>
    </>
  );
};
