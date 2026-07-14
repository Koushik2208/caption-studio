import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { CondensedCard } from '../components/common/CondensedCard';
import { Button } from '../components/common/Button';
import { useProject } from '../context/ProjectContext';
import { useLayout } from '../context/LayoutContext';
import { getPrioritizedFontPresets } from '../captions/styles/presets';
import type { CaptionPosition } from '../captions/styles/types';
import { ANIMATION_STYLES, CONDENSED_ANIMATION_COUNT, CONDENSED_FONT_COUNT } from './styleOptions';

const POSITION_OPTIONS: { value: CaptionPosition; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'center', label: 'Center' },
  { value: 'bottom', label: 'Bottom' },
];

export const StylePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    presetName,
    setPresetName,
    animation,
    setAnimation,
    keywordHighlightEnabled,
    setKeywordHighlightEnabled,
    highlightIntensity,
    setHighlightIntensity,
    highlightColor,
    setHighlightColor,
    keywords,
    setKeywords,
    position,
    setPosition,
    fontSizeMultiplier,
    setFontSizeMultiplier,
  } = useProject();
  const { layoutMode } = useLayout();
  const condensedFontPresets = getPrioritizedFontPresets(layoutMode);

  // Local raw text mirrors the comma-separated input so mid-typing states
  // (trailing comma, extra spaces) don't get collapsed by the parsed array
  // re-rendering the field on every keystroke.
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

  const colors = [
    { hex: '#0066ff', bgClass: 'bg-primary' },
    { hex: '#ba1a1a', bgClass: 'bg-error' },
    { hex: '#ffdbd0', bgClass: 'bg-tertiary-fixed' },
    { hex: '#1a1c1d', bgClass: 'bg-on-surface' },
    { hex: '#ffffff', bgClass: 'bg-white border border-outline-variant' },
  ];

  return (
    <>
      {/* Style Tool Panel (Right Sidebar) */}
      <aside className="w-panel-width min-w-panel-width max-w-panel-width bg-surface-bright border-l border-outline-variant flex flex-col p-gutter h-full shrink-0 grow-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-stack-gap">
          {/* Card 1: Animation Style (condensed) */}
          <CondensedCard title="ANIMATION STYLE" moreTo="/style/animations" moreLabel="More animations">
            <div className="grid grid-cols-2 gap-2">
              {ANIMATION_STYLES.slice(0, CONDENSED_ANIMATION_COUNT).map((a) => (
                <button
                  key={a.value}
                  onClick={() => setAnimation(a.value)}
                  className={`h-16 flex items-center justify-center border rounded-lg hover:border-primary transition-all duration-150 cursor-pointer ${animation === a.value ? 'active-ring border-primary' : 'border-outline-variant'
                    }`}
                >
                  <span className="text-sm font-medium">{a.label}</span>
                </button>
              ))}
            </div>
          </CondensedCard>

          {/* Card 2: Font (condensed) */}
          <CondensedCard title="FONT" moreTo="/style/fonts" moreLabel="More fonts">
            <div className="grid grid-cols-2 gap-2">
              {condensedFontPresets.slice(0, CONDENSED_FONT_COUNT).map((p) => (
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
          </CondensedCard>

          {/* Card 3: Keyword Highlight */}
          <Card title="KEYWORD HIGHLIGHT">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setKeywordHighlightEnabled(!keywordHighlightEnabled)}
                className="flex items-center justify-between cursor-pointer"
                aria-pressed={keywordHighlightEnabled}
              >
                <span className="text-sm font-medium">Enabled</span>
                <span
                  className={`relative w-10 h-6 rounded-full transition-colors duration-150 ${keywordHighlightEnabled ? 'bg-primary' : 'bg-outline-variant'
                    }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-150 ${keywordHighlightEnabled ? 'translate-x-4' : ''
                      }`}
                  />
                </span>
              </button>

              <label className={`flex flex-col gap-1 ${keywordHighlightEnabled ? '' : 'opacity-40'}`}>
                <span className="text-xs text-on-surface-variant">
                  Intensity ({Math.round(highlightIntensity * 100)}%)
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={highlightIntensity}
                  disabled={!keywordHighlightEnabled}
                  onChange={(e) => setHighlightIntensity(Number(e.target.value))}
                  className="w-full cursor-pointer accent-primary"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-on-surface-variant">Keywords (comma-separated)</span>
                <input
                  type="text"
                  value={keywordsText}
                  onChange={(e) => handleKeywordsChange(e.target.value)}
                  placeholder="e.g. bacteria, chemistry, hydrogen"
                  className="w-full px-2 py-1.5 text-sm border border-outline-variant rounded-md bg-surface focus:outline-none focus:border-primary"
                />
              </label>
            </div>
          </Card>

          {/* Card 4: Color & Highlight */}
          <Card title="COLOR & HIGHLIGHT">
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setHighlightColor(color.hex)}
                  className={`w-10 h-10 rounded-full shadow-sm hover:scale-105 transition-transform active:scale-90 cursor-pointer ${color.bgClass} ${highlightColor === color.hex ? 'active-ring' : ''
                    }`}
                  style={color.hex === '#ffffff' ? {} : { backgroundColor: color.hex }}
                  aria-label={`Color ${color.hex}`}
                />
              ))}
            </div>
          </Card>

          {/* Card 5: Position */}
          <Card title="POSITION">
            <div className="grid grid-cols-3 gap-1 bg-surface-container-low p-1 rounded-lg">
              {POSITION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPosition(opt.value)}
                  className={`h-10 flex items-center justify-center rounded-md text-sm font-medium transition-all cursor-pointer ${position === opt.value
                      ? 'bg-white border border-primary/40 text-primary'
                      : 'border border-transparent hover:bg-primary-container/20'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Card 6: Font Size */}
          <Card title="FONT SIZE">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-on-surface-variant">
                Size ({Math.round(fontSizeMultiplier * 100)}%)
              </span>
              <input
                type="range"
                min={0.7}
                max={1.3}
                step={0.05}
                value={fontSizeMultiplier}
                onChange={(e) => setFontSizeMultiplier(Number(e.target.value))}
                className="w-full cursor-pointer accent-primary"
              />
            </label>
          </Card>
        </div>

        {/* Footer Action */}
        <div className="mt-4 pt-4 border-t border-outline-variant">
          <Button
            onClick={() => navigate('/overlay')}
            className="w-full py-3 shadow-lg shadow-primary-container/20 text-body-md"
          >
            Next
            <span className="material-symbols-outlined font-normal text-md">arrow_forward</span>
          </Button>
        </div>
      </aside>
    </>
  );
};
