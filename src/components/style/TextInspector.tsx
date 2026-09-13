import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useLayout } from '../../context/LayoutContext';
import { FONT_PRESETS, type FontPresetOrientation } from '../../captions/styles/presets';

const ORIENTATION_FILTERS: { value: FontPresetOrientation | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'vertical', label: 'Vertical' },
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'both', label: 'Universal' },
];

const WEIGHT_LABELS: Record<number, string> = {
  400: 'Regular (400)',
  500: 'Medium (500)',
  600: 'SemiBold (600)',
  700: 'Bold (700)',
  800: 'ExtraBold (800)',
  900: 'Black (900)',
};

const COLOR_SWATCHES = ['#ffffff', '#ffd23f', '#e8262b', '#0066ff', '#1a1c1d', '#00e676'];
const STROKE_SWATCHES = ['#000000', '#ffffff', '#1a1c1d', '#e8262b'];

export const TextInspector: React.FC = () => {
  const {
    presetName,
    setPresetName,
    textColor,
    setTextColor,
    fontWeight,
    setFontWeight,
    fontSizeMultiplier,
    setFontSizeMultiplier,
    strokeEnabled,
    setStrokeEnabled,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    shadowEnabled,
    setShadowEnabled,
  } = useProject();

  const { layoutMode } = useLayout();
  const [orientationFilter, setOrientationFilter] = useState<FontPresetOrientation | 'all'>(
    layoutMode === 'horizontal' ? 'horizontal' : 'all'
  );

  const currentPreset = FONT_PRESETS.find((p) => p.name === presetName) ?? FONT_PRESETS[0];
  const availableWeights = (currentPreset.availableWeights ?? [currentPreset.fontWeight]) as readonly number[];

  const filteredPresets =
    orientationFilter === 'all'
      ? FONT_PRESETS
      : FONT_PRESETS.filter((p) => p.orientation === orientationFilter || p.orientation === 'both');

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* SECTION 1: Font Presets */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
            Font Presets
          </span>
          <span className="text-[11px] text-outline font-mono">
            {filteredPresets.length} fonts
          </span>
        </div>

        {/* Orientation Filter */}
        <div className="grid grid-cols-4 gap-1 bg-surface-container-low p-1 rounded-lg">
          {ORIENTATION_FILTERS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setOrientationFilter(opt.value)}
              className={`h-7.5 flex items-center justify-center rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                orientationFilter === opt.value
                  ? 'bg-white border border-primary/40 text-primary shadow-2xs font-semibold'
                  : 'border border-transparent text-on-surface-variant hover:bg-surface-container-high/60'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Font Presets Grid */}
        <div className="grid grid-cols-2 gap-2 max-h-[210px] overflow-y-auto custom-scrollbar p-1">
          {filteredPresets.map((p) => {
            const isSelected = presetName === p.name;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => setPresetName(p.name)}
                className={`h-13 flex flex-col items-center justify-center px-2 py-1 text-center border rounded-xl transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'active-ring border-primary bg-primary-container/10 shadow-xs'
                    : 'border-outline-variant/60 bg-surface-container-lowest hover:border-primary/60 hover:bg-surface-container-low'
                }`}
              >
                <span
                  className={`text-xs leading-tight line-clamp-1 ${p.labelClass}`}
                  style={{ fontFamily: p.fontFamily }}
                >
                  {p.name}
                </span>
                <span className="text-[9px] text-outline mt-0.5 capitalize">
                  {p.orientation}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <hr className="border-outline-variant/40" />

      {/* SECTION 2: Text Color */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
            Text Color
          </span>
          <span className="text-[11px] font-mono text-outline uppercase">{textColor}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="relative w-8 h-8 rounded-lg overflow-hidden border border-outline-variant cursor-pointer shrink-0 shadow-2xs hover:border-primary transition-colors">
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
              aria-label="Pick custom text color"
            />
          </label>
          <input
            type="text"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            placeholder="#FFFFFF"
            className="min-w-0 w-24 px-2.5 py-1.5 text-xs font-mono uppercase border border-outline-variant/80 rounded-lg bg-surface focus:outline-none focus:border-primary"
          />
          <div className="flex items-center gap-1.5 flex-wrap ml-auto">
            {COLOR_SWATCHES.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => setTextColor(hex)}
                className={`w-6 h-6 rounded-md border border-outline-variant transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                  textColor.toLowerCase() === hex.toLowerCase() ? 'ring-2 ring-primary ring-offset-1' : ''
                }`}
                style={{ backgroundColor: hex }}
                title={hex}
                aria-label={`Select color ${hex}`}
              />
            ))}
          </div>
        </div>
      </section>

      <hr className="border-outline-variant/40" />

      {/* SECTION 3: Typography (Weight & Size) */}
      <section className="flex flex-col gap-3.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
          Typography Settings
        </span>

        {/* Font Weight */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-on-surface font-medium">Font Weight</span>
            <span className="text-[11px] text-outline font-mono">{fontWeight}</span>
          </div>
          <select
            value={fontWeight}
            onChange={(e) => setFontWeight(Number(e.target.value))}
            disabled={availableWeights.length <= 1}
            className="w-full px-3 py-2 text-xs border border-outline-variant/80 rounded-lg bg-surface focus:outline-none focus:border-primary cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {availableWeights.map((w) => (
              <option key={w} value={w}>
                {WEIGHT_LABELS[w] ?? `${w}`}
              </option>
            ))}
          </select>
          {availableWeights.length <= 1 && (
            <span className="text-[10px] text-outline">
              {currentPreset.name} is optimized for a single weight ({availableWeights[0]}).
            </span>
          )}
        </div>

        {/* Font Size Scale */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-on-surface font-medium">Font Scale</span>
            <span className="text-[11px] text-outline font-mono">
              {Math.round(fontSizeMultiplier * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0.7}
            max={1.3}
            step={0.05}
            value={fontSizeMultiplier}
            onChange={(e) => setFontSizeMultiplier(Number(e.target.value))}
            className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-outline font-mono px-0.5">
            <span>70%</span>
            <span>100% (Default)</span>
            <span>130%</span>
          </div>
        </div>
      </section>

      <hr className="border-outline-variant/40" />

      {/* SECTION 4: Border / Stroke */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
              Border Outline
            </span>
            <span className="text-[11px] text-outline">High-contrast edge definition</span>
          </div>
          <button
            type="button"
            onClick={() => setStrokeEnabled(!strokeEnabled)}
            className={`relative w-9 h-5 rounded-full transition-colors duration-150 cursor-pointer ${
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
          <div className="flex flex-col gap-3 pt-2 bg-surface-container-low/50 p-3 rounded-xl border border-outline-variant/40">
            <div className="flex items-center gap-2.5">
              <label className="relative w-7 h-7 rounded-md overflow-hidden border border-outline-variant cursor-pointer shrink-0 shadow-2xs hover:border-primary transition-colors">
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="absolute -top-2 -left-2 w-11 h-11 cursor-pointer border-0 p-0"
                  aria-label="Pick border color"
                />
              </label>
              <input
                type="text"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                placeholder="#000000"
                className="min-w-0 w-24 px-2 py-1 text-xs font-mono uppercase border border-outline-variant/80 rounded-md bg-surface focus:outline-none focus:border-primary"
              />
              <div className="flex items-center gap-1.5 flex-wrap ml-auto">
                {STROKE_SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setStrokeColor(hex)}
                    className={`w-5.5 h-5.5 rounded-md border border-outline-variant transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                      strokeColor.toLowerCase() === hex.toLowerCase() ? 'ring-2 ring-primary ring-offset-1' : ''
                    }`}
                    style={{ backgroundColor: hex }}
                    title={hex}
                    aria-label={`Select border color ${hex}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-on-surface">
                <span className="text-[11px] font-medium">Border Width</span>
                <span className="font-mono text-[11px] text-outline">{strokeWidth}px</span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                step={0.5}
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded-lg appearance-none"
              />
            </div>
          </div>
        )}
      </section>

      <hr className="border-outline-variant/40" />

      {/* SECTION 5: Shadow */}
      <section className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
            Text Shadow
          </span>
          <span className="text-[11px] text-outline">Ambient shadow for video contrast</span>
        </div>
        <button
          type="button"
          onClick={() => setShadowEnabled(!shadowEnabled)}
          className={`relative w-9 h-5 rounded-full transition-colors duration-150 cursor-pointer ${
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
      </section>
    </div>
  );
};
