import React from 'react';
import { SubPanelView } from '../components/common/SubPanelView';
import { Card } from '../components/common/Card';
import { useProject } from '../context/ProjectContext';
import { INTENSITY_OPTIONS } from './overlayOptions';

export const OverlayTextureOverlaysPage: React.FC = () => {
  const {
    filmDustEnabled,
    setFilmDustEnabled,
    halationEnabled,
    setHalationEnabled,
    halationIntensity,
    setHalationIntensity,
    gridEnabled,
    setGridEnabled,
    gridIntensity,
    setGridIntensity,
    crtScanlinesEnabled,
    setCrtScanlinesEnabled,
    crtScanlinesIntensity,
    setCrtScanlinesIntensity,
    halftoneEnabled,
    setHalftoneEnabled,
    halftoneIntensity,
    setHalftoneIntensity,
    lightLeakEnabled,
    setLightLeakEnabled,
    lightLeakIntensity,
    setLightLeakIntensity,
  } = useProject();

  return (
    <SubPanelView title="Texture Overlays" backTo="/overlay" backLabel="Back to Overlay">
      <Card className="flex flex-col gap-4">
        {/* Film Dust - on/off only, no intensity control */}
        <div className="flex items-center justify-between">
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

        {/* Halation */}
        <div className="flex flex-col gap-3 border-t border-outline-variant/30 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-body-sm font-semibold text-on-surface">Halation</span>
            <button
              onClick={() => setHalationEnabled(!halationEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none ${halationEnabled ? 'bg-primary-container' : 'bg-surface-variant'
                }`}
              aria-label="Toggle halation"
            >
              <div
                className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform shadow-xs ${halationEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>
          {halationEnabled && (
            <div className="grid grid-cols-3 gap-2 p-1 bg-surface-container rounded-lg border border-outline-variant/30 animate-in slide-in-from-top-1 duration-150">
              {INTENSITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setHalationIntensity(option.value)}
                  className={`py-1.5 px-2 rounded text-label-caps font-label-caps text-[10px] uppercase font-bold transition-all duration-200 cursor-pointer ${halationIntensity === option.value
                      ? 'bg-primary-container text-on-primary-container shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="flex flex-col gap-3 border-t border-outline-variant/30 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-body-sm font-semibold text-on-surface">Grid</span>
            <button
              onClick={() => setGridEnabled(!gridEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none ${gridEnabled ? 'bg-primary-container' : 'bg-surface-variant'
                }`}
              aria-label="Toggle grid"
            >
              <div
                className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform shadow-xs ${gridEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>
          {gridEnabled && (
            <div className="grid grid-cols-3 gap-2 p-1 bg-surface-container rounded-lg border border-outline-variant/30 animate-in slide-in-from-top-1 duration-150">
              {INTENSITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGridIntensity(option.value)}
                  className={`py-1.5 px-2 rounded text-label-caps font-label-caps text-[10px] uppercase font-bold transition-all duration-200 cursor-pointer ${gridIntensity === option.value
                      ? 'bg-primary-container text-on-primary-container shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Halftone */}
        <div className="flex flex-col gap-3 border-t border-outline-variant/30 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-body-sm font-semibold text-on-surface">Halftone</span>
            <button
              onClick={() => setHalftoneEnabled(!halftoneEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none ${halftoneEnabled ? 'bg-primary-container' : 'bg-surface-variant'
                }`}
              aria-label="Toggle halftone"
            >
              <div
                className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform shadow-xs ${halftoneEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>
          {halftoneEnabled && (
            <div className="grid grid-cols-3 gap-2 p-1 bg-surface-container rounded-lg border border-outline-variant/30 animate-in slide-in-from-top-1 duration-150">
              {INTENSITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setHalftoneIntensity(option.value)}
                  className={`py-1.5 px-2 rounded text-label-caps font-label-caps text-[10px] uppercase font-bold transition-all duration-200 cursor-pointer ${halftoneIntensity === option.value
                      ? 'bg-primary-container text-on-primary-container shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Light Leak */}
        <div className="flex flex-col gap-3 border-t border-outline-variant/30 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-body-sm font-semibold text-on-surface">Light Leak</span>
            <button
              onClick={() => setLightLeakEnabled(!lightLeakEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none ${lightLeakEnabled ? 'bg-primary-container' : 'bg-surface-variant'
                }`}
              aria-label="Toggle light leak"
            >
              <div
                className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform shadow-xs ${lightLeakEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>
          {lightLeakEnabled && (
            <div className="grid grid-cols-3 gap-2 p-1 bg-surface-container rounded-lg border border-outline-variant/30 animate-in slide-in-from-top-1 duration-150">
              {INTENSITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setLightLeakIntensity(option.value)}
                  className={`py-1.5 px-2 rounded text-label-caps font-label-caps text-[10px] uppercase font-bold transition-all duration-200 cursor-pointer ${lightLeakIntensity === option.value
                      ? 'bg-primary-container text-on-primary-container shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CRT Scanlines */}
        <div className="flex flex-col gap-3 border-t border-outline-variant/30 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-body-sm font-semibold text-on-surface">CRT Scanlines</span>
            <button
              onClick={() => setCrtScanlinesEnabled(!crtScanlinesEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none ${crtScanlinesEnabled ? 'bg-primary-container' : 'bg-surface-variant'
                }`}
              aria-label="Toggle CRT scanlines"
            >
              <div
                className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform shadow-xs ${crtScanlinesEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>
          {crtScanlinesEnabled && (
            <div className="grid grid-cols-3 gap-2 p-1 bg-surface-container rounded-lg border border-outline-variant/30 animate-in slide-in-from-top-1 duration-150">
              {INTENSITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCrtScanlinesIntensity(option.value)}
                  className={`py-1.5 px-2 rounded text-label-caps font-label-caps text-[10px] uppercase font-bold transition-all duration-200 cursor-pointer ${crtScanlinesIntensity === option.value
                      ? 'bg-primary-container text-on-primary-container shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>
    </SubPanelView>
  );
};
