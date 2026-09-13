import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';

const HIGHLIGHT_SWATCHES = ['#ffd23f', '#0066ff', '#ba1a1a', '#ffdbd0', '#ffffff'];

export const HighlightInspector: React.FC = () => {
  const {
    highlightColor,
    setHighlightColor,
    keywordHighlightEnabled,
    setKeywordHighlightEnabled,
    highlightIntensity,
    setHighlightIntensity,
    keywords,
    setKeywords,
  } = useProject();

  const [keywordsText, setKeywordsText] = useState(() => keywords.join(', '));

  const handleKeywordsChange = (value: string) => {
    setKeywordsText(value);
    setKeywords(
      value
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* SECTION: Active Word / Pop Color */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
            Active Word Color
          </span>
          <span className="text-[11px] text-outline">
            Accent color applied to the word currently being spoken
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="relative w-8 h-8 rounded-lg overflow-hidden border border-outline-variant cursor-pointer shrink-0 shadow-2xs hover:border-primary transition-colors">
            <input
              type="color"
              value={highlightColor}
              onChange={(e) => setHighlightColor(e.target.value)}
              className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
              aria-label="Pick highlight color"
            />
          </label>
          <input
            type="text"
            value={highlightColor}
            onChange={(e) => setHighlightColor(e.target.value)}
            placeholder="#FFD23F"
            className="min-w-0 w-24 px-2.5 py-1.5 text-xs font-mono uppercase border border-outline-variant/80 rounded-lg bg-surface focus:outline-none focus:border-primary"
          />
          <div className="flex items-center gap-1.5 flex-wrap ml-auto">
            {HIGHLIGHT_SWATCHES.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => setHighlightColor(hex)}
                className={`w-6 h-6 rounded-md border border-outline-variant transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                  highlightColor.toLowerCase() === hex.toLowerCase() ? 'ring-2 ring-primary ring-offset-1' : ''
                }`}
                style={{ backgroundColor: hex }}
                title={hex}
                aria-label={`Select highlight color ${hex}`}
              />
            ))}
          </div>
        </div>
      </section>

      <hr className="border-outline-variant/40" />

      {/* SECTION: Keyword Emphasis & Glow */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
              Keyword Glow
            </span>
            <span className="text-[11px] text-outline">
              Emphasize high-impact spoken terms
            </span>
          </div>
          <button
            type="button"
            onClick={() => setKeywordHighlightEnabled(!keywordHighlightEnabled)}
            className={`relative w-9 h-5 rounded-full transition-colors duration-150 cursor-pointer ${
              keywordHighlightEnabled ? 'bg-primary' : 'bg-outline-variant'
            }`}
            aria-pressed={keywordHighlightEnabled}
            aria-label="Toggle keyword glow"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-150 ${
                keywordHighlightEnabled ? 'translate-x-4' : ''
              }`}
            />
          </button>
        </div>

        {keywordHighlightEnabled && (
          <div className="flex flex-col gap-4 pt-2 bg-surface-container-low/50 p-3 rounded-lg border border-outline-variant/40">
            {/* Intensity Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface font-medium">Glow Intensity</span>
                <span className="text-[11px] text-outline font-mono">
                  {Math.round(highlightIntensity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={highlightIntensity}
                onChange={(e) => setHighlightIntensity(Number(e.target.value))}
                className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded-lg appearance-none"
              />
            </div>

            {/* Comma-separated Keywords */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface font-medium">Key Phrases</span>
                <span className="text-[10px] text-outline">Comma-separated</span>
              </div>
              <input
                type="text"
                value={keywordsText}
                onChange={(e) => handleKeywordsChange(e.target.value)}
                placeholder="e.g. secret, viral, transform, build"
                className="w-full px-2.5 py-1.5 text-xs border border-outline-variant/80 rounded-md bg-surface focus:outline-none focus:border-primary placeholder:text-outline/60"
              />
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {keywords.map((kw, i) => (
                    <span
                      key={`${kw}-${i}`}
                      className="px-2 py-0.5 bg-primary-container/10 text-primary border border-primary/20 rounded text-[10px] font-mono"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
