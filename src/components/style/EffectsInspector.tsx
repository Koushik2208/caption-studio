import React from 'react';
import { useProject } from '../../context/ProjectContext';
import type { OverlayIntensity } from '../../textures/types';

const STROKE_SWATCHES = ['#000000', '#ffffff', '#1a1c1d', '#e8262b'];

const INTENSITIES: { value: OverlayIntensity; label: string }[] = [
  { value: 'low', label: 'Subtle' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'Heavy' },
];

export const EffectsInspector: React.FC = () => {
  const {
    strokeEnabled,
    setStrokeEnabled,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    shadowEnabled,
    setShadowEnabled,
    filmDustEnabled,
    setFilmDustEnabled,
    filmGrainEnabled,
    setFilmGrainEnabled,
    filmGrainIntensity,
    setFilmGrainIntensity,
    halationEnabled,
    setHalationEnabled,
    halationIntensity,
    setHalationIntensity,
    lightLeakEnabled,
    setLightLeakEnabled,
    lightLeakIntensity,
    setLightLeakIntensity,
    crtScanlinesEnabled,
    setCrtScanlinesEnabled,
    crtScanlinesIntensity,
    setCrtScanlinesIntensity,
    halftoneEnabled,
    setHalftoneEnabled,
    halftoneIntensity,
    setHalftoneIntensity,
    gridEnabled,
    setGridEnabled,
    gridIntensity,
    setGridIntensity,
    chromaticAberrationEnabled,
    setChromaticAberrationEnabled,
    chromaticAberrationIntensity,
    setChromaticAberrationIntensity,
    audioPulseEnabled,
    setAudioPulseEnabled,
    audioPulseIntensity,
    setAudioPulseIntensity,
    keywordPunchEnabled,
    setKeywordPunchEnabled,
    keywordPunchIntensity,
    setKeywordPunchIntensity,
  } = useProject();

  const renderTextureItem = (
    title: string,
    description: string,
    enabled: boolean,
    onToggle: () => void,
    intensity?: OverlayIntensity,
    onIntensityChange?: (val: OverlayIntensity) => void,
  ) => (
    <div className="flex flex-col gap-2.5 p-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest transition-all">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-on-surface">{title}</span>
          <span className="text-[11px] text-outline leading-tight">{description}</span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`relative w-9 h-5 rounded-full transition-colors duration-150 cursor-pointer shrink-0 ${
            enabled ? 'bg-primary' : 'bg-outline-variant'
          }`}
          aria-pressed={enabled}
          aria-label={`Toggle ${title}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-150 ${
              enabled ? 'translate-x-4' : ''
            }`}
          />
        </button>
      </div>

      {enabled && intensity !== undefined && onIntensityChange && (
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-container-low rounded-lg border border-outline-variant/30 mt-1">
          {INTENSITIES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onIntensityChange(opt.value)}
              className={`py-1 px-1.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                intensity === opt.value
                  ? 'bg-white text-primary shadow-2xs border border-primary/30'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* SECTION: Caption Legibility Effects */}
      <section className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
          Caption Legibility
        </span>

        {/* Stroke Outline */}
        <div className="flex flex-col gap-2.5 p-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-on-surface">Stroke Boundary</span>
              <span className="text-[11px] text-outline">High-contrast edge definition</span>
            </div>
            <button
              type="button"
              onClick={() => setStrokeEnabled(!strokeEnabled)}
              className={`relative w-9 h-5 rounded-full transition-colors duration-150 cursor-pointer shrink-0 ${
                strokeEnabled ? 'bg-primary' : 'bg-outline-variant'
              }`}
              aria-pressed={strokeEnabled}
              aria-label="Toggle stroke outline"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-150 ${
                  strokeEnabled ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {strokeEnabled && (
            <div className="flex flex-col gap-2.5 pt-2 border-t border-outline-variant/30 mt-1">
              <div className="flex items-center gap-2">
                <label className="relative w-6 h-6 rounded overflow-hidden border border-outline-variant cursor-pointer shrink-0">
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer border-0 p-0"
                  />
                </label>
                <input
                  type="text"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-20 px-2 py-1 text-xs font-mono uppercase border border-outline-variant/80 rounded bg-surface"
                />
                <div className="flex items-center gap-1 ml-auto">
                  {STROKE_SWATCHES.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setStrokeColor(hex)}
                      className={`w-5 h-5 rounded border border-outline-variant cursor-pointer ${
                        strokeColor.toLowerCase() === hex.toLowerCase() ? 'ring-2 ring-primary ring-offset-1' : ''
                      }`}
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] text-on-surface">
                  <span>Width</span>
                  <span className="font-mono text-outline">{strokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={0.5}
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Ambient Drop Shadow */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-on-surface">Ambient Shadow</span>
            <span className="text-[11px] text-outline">Diffused 360° blur against bright video</span>
          </div>
          <button
            type="button"
            onClick={() => setShadowEnabled(!shadowEnabled)}
            className={`relative w-9 h-5 rounded-full transition-colors duration-150 cursor-pointer shrink-0 ${
              shadowEnabled ? 'bg-primary' : 'bg-outline-variant'
            }`}
            aria-pressed={shadowEnabled}
            aria-label="Toggle text shadow"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-150 ${
                shadowEnabled ? 'translate-x-4' : ''
              }`}
            />
          </button>
        </div>
      </section>

      <hr className="border-outline-variant/40" />

      {/* SECTION: Video Atmosphere & Textures */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
            Atmosphere & Textures
          </span>
          <span className="text-[11px] text-outline">Stackable FX</span>
        </div>

        <div className="flex flex-col gap-2">
          {renderTextureItem(
            'Film Grain',
            'Organic 35mm cinematic film grain',
            filmGrainEnabled,
            () => setFilmGrainEnabled(!filmGrainEnabled),
            filmGrainIntensity,
            setFilmGrainIntensity,
          )}

          {renderTextureItem(
            'Halation',
            'Warm red glow bleeding around highlights',
            halationEnabled,
            () => setHalationEnabled(!halationEnabled),
            halationIntensity,
            setHalationIntensity,
          )}

          {renderTextureItem(
            'Light Leak',
            'Subtle amber lens flare and anamorphic glow',
            lightLeakEnabled,
            () => setLightLeakEnabled(!lightLeakEnabled),
            lightLeakIntensity,
            setLightLeakIntensity,
          )}

          {renderTextureItem(
            'Film Dust & Scratches',
            'Vintage analog dust particles and hairs',
            filmDustEnabled,
            () => setFilmDustEnabled(!filmDustEnabled),
          )}

          {renderTextureItem(
            'CRT Scanlines',
            'Retro television raster scanlines',
            crtScanlinesEnabled,
            () => setCrtScanlinesEnabled(!crtScanlinesEnabled),
            crtScanlinesIntensity,
            setCrtScanlinesIntensity,
          )}

          {renderTextureItem(
            'Chromatic Aberration',
            'RGB color fringing across video edges',
            chromaticAberrationEnabled,
            () => setChromaticAberrationEnabled(!chromaticAberrationEnabled),
            chromaticAberrationIntensity,
            setChromaticAberrationIntensity,
          )}

          {renderTextureItem(
            'Halftone Print',
            'Newspaper comic dot-matrix screen',
            halftoneEnabled,
            () => setHalftoneEnabled(!halftoneEnabled),
            halftoneIntensity,
            setHalftoneIntensity,
          )}

          {renderTextureItem(
            'Grid Overlay',
            'Technical cyberpunk viewport grid lines',
            gridEnabled,
            () => setGridEnabled(!gridEnabled),
            gridIntensity,
            setGridIntensity,
          )}

          {renderTextureItem(
            'Audio-Reactive Pulse',
            'Dynamic subtle scale pulses on voice beat',
            audioPulseEnabled,
            () => setAudioPulseEnabled(!audioPulseEnabled),
            audioPulseIntensity,
            setAudioPulseIntensity,
          )}

          {renderTextureItem(
            'Keyword-Synced Punch',
            'Focal zoom on spoken keyword triggers',
            keywordPunchEnabled,
            () => setKeywordPunchEnabled(!keywordPunchEnabled),
            keywordPunchIntensity,
            setKeywordPunchIntensity,
          )}
        </div>
      </section>
    </div>
  );
};
