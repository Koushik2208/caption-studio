import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PreviewPlayer } from '../preview/PreviewPlayer';
import { useLayout } from '../context/LayoutContext';
import { useProject } from '../context/ProjectContext';
import { FONT_PRESETS } from '../captions/styles/presets';

export const StylePage: React.FC = () => {
  const navigate = useNavigate();
  const { layoutMode } = useLayout();
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
    verticalAlign,
    setVerticalAlign,
    horizontalAlign,
    setHorizontalAlign,
  } = useProject();

  const animationStyles: { value: typeof animation; label: string }[] = [
    { value: 'signature', label: 'Signature' },
    { value: 'calmPhrase', label: 'Calm Phrase' },
    { value: 'typewriter', label: 'Typewriter' },
    { value: 'slideUp', label: 'Slide-up' },
    { value: 'outlineDraw', label: 'Outline Draw' },
  ];

  const colors = [
    { hex: '#0066ff', bgClass: 'bg-primary' },
    { hex: '#ba1a1a', bgClass: 'bg-error' },
    { hex: '#ffdbd0', bgClass: 'bg-tertiary-fixed' },
    { hex: '#1a1c1d', bgClass: 'bg-on-surface' },
    { hex: '#ffffff', bgClass: 'bg-white border border-outline-variant' },
  ];

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Central Workspace Canvas */}
      <main className="flex-1 p-canvas-margin flex items-center justify-center bg-surface overflow-hidden relative">
        {/* Preview Canvas */}
        <div
          className={`relative bg-black rounded-2xl overflow-hidden canvas-shadow border border-outline-variant/30 transition-all duration-300 ${layoutMode === 'horizontal'
              ? 'aspect-video w-full max-w-[800px] h-auto'
              : 'aspect-9/16 h-[calc(100vh-160px)] max-h-[720px]'
            }`}
        >
          <PreviewPlayer />
        </div>

        {/* Floating Info Tags */}
        <div className="absolute top-8 left-8 flex items-center gap-2">
          <div className="px-3 py-1 bg-surface-container-lowest rounded-full border border-outline-variant/60 flex items-center gap-1.5 shadow-xs">
            <span className="material-symbols-outlined text-[15px] text-on-surface-variant">aspect_ratio</span>
            <span className="text-label-caps font-label-caps text-[10px] text-on-surface-variant uppercase">
              {layoutMode === 'horizontal' ? '16:9 Horizontal' : '9:16 Vertical'}
            </span>
          </div>
        </div>
      </main>

      {/* Style Tool Panel (Right Sidebar) */}
      <aside className="w-panel-width min-w-panel-width max-w-panel-width bg-surface-bright border-l border-outline-variant flex flex-col p-gutter h-full shrink-0 grow-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-stack-gap">
          {/* Card 1: Animation Style */}
          <Card title="ANIMATION STYLE">
            <div className="grid grid-cols-2 gap-2">
              {animationStyles.map((a) => (
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
          </Card>

          {/* Card 2: Font */}
          <Card title="FONT">
            <div className="grid grid-cols-2 gap-2">
              {FONT_PRESETS.map((p) => (
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
          </Card>

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

          {/* Card 5: Position Grid */}
          <Card title="POSITION">
            <div className="grid grid-cols-3 gap-1 aspect-square max-w-[120px] mx-auto bg-surface-container-low p-1 rounded-lg">
              {/* Row 1 */}
              <button
                onClick={() => {
                  setVerticalAlign('flex-start');
                  setHorizontalAlign('start');
                }}
                className={`aspect-square bg-white border rounded flex items-center justify-center hover:bg-primary-container/20 transition-all cursor-pointer ${verticalAlign === 'flex-start' && horizontalAlign === 'start'
                    ? 'border-primary/40 bg-primary-container/10'
                    : 'border-outline-variant/30'
                  }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${verticalAlign === 'flex-start' && horizontalAlign === 'start' ? 'bg-primary' : 'bg-outline'
                    }`}
                ></div>
              </button>
              <button
                onClick={() => {
                  setVerticalAlign('flex-start');
                  setHorizontalAlign('center');
                }}
                className={`aspect-square bg-white border rounded flex items-center justify-center hover:bg-primary-container/20 transition-all cursor-pointer ${verticalAlign === 'flex-start' && horizontalAlign === 'center'
                    ? 'border-primary/40 bg-primary-container/10'
                    : 'border-outline-variant/30'
                  }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${verticalAlign === 'flex-start' && horizontalAlign === 'center' ? 'bg-primary' : 'bg-outline'
                    }`}
                ></div>
              </button>
              <button
                onClick={() => {
                  setVerticalAlign('flex-start');
                  setHorizontalAlign('end');
                }}
                className={`aspect-square bg-white border rounded flex items-center justify-center hover:bg-primary-container/20 transition-all cursor-pointer ${verticalAlign === 'flex-start' && horizontalAlign === 'end'
                    ? 'border-primary/40 bg-primary-container/10'
                    : 'border-outline-variant/30'
                  }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${verticalAlign === 'flex-start' && horizontalAlign === 'end' ? 'bg-primary' : 'bg-outline'
                    }`}
                ></div>
              </button>

              {/* Row 2 */}
              <button
                onClick={() => {
                  setVerticalAlign('center');
                  setHorizontalAlign('start');
                }}
                className={`aspect-square bg-white border rounded flex items-center justify-center hover:bg-primary-container/20 transition-all cursor-pointer ${verticalAlign === 'center' && horizontalAlign === 'start'
                    ? 'border-primary/40 bg-primary-container/10'
                    : 'border-outline-variant/30'
                  }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${verticalAlign === 'center' && horizontalAlign === 'start' ? 'bg-primary' : 'bg-outline'
                    }`}
                ></div>
              </button>
              <button
                onClick={() => {
                  setVerticalAlign('center');
                  setHorizontalAlign('center');
                }}
                className={`aspect-square bg-white border rounded flex items-center justify-center hover:bg-primary-container/20 transition-all cursor-pointer ${verticalAlign === 'center' && horizontalAlign === 'center'
                    ? 'border-primary/40 bg-primary-container/10'
                    : 'border-outline-variant/30'
                  }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${verticalAlign === 'center' && horizontalAlign === 'center' ? 'bg-primary' : 'bg-outline'
                    }`}
                ></div>
              </button>
              <button
                onClick={() => {
                  setVerticalAlign('center');
                  setHorizontalAlign('end');
                }}
                className={`aspect-square bg-white border rounded flex items-center justify-center hover:bg-primary-container/20 transition-all cursor-pointer ${verticalAlign === 'center' && horizontalAlign === 'end'
                    ? 'border-primary/40 bg-primary-container/10'
                    : 'border-outline-variant/30'
                  }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${verticalAlign === 'center' && horizontalAlign === 'end' ? 'bg-primary' : 'bg-outline'
                    }`}
                ></div>
              </button>

              {/* Row 3 */}
              <button
                onClick={() => {
                  setVerticalAlign('end');
                  setHorizontalAlign('start');
                }}
                className={`aspect-square bg-white border rounded flex items-center justify-center hover:bg-primary-container/20 transition-all cursor-pointer ${verticalAlign === 'end' && horizontalAlign === 'start'
                    ? 'border-primary/40 bg-primary-container/10'
                    : 'border-outline-variant/30'
                  }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${verticalAlign === 'end' && horizontalAlign === 'start' ? 'bg-primary' : 'bg-outline'
                    }`}
                ></div>
              </button>
              <button
                onClick={() => {
                  setVerticalAlign('end');
                  setHorizontalAlign('center');
                }}
                className={`aspect-square bg-white border rounded flex items-center justify-center hover:bg-primary-container/20 transition-all cursor-pointer ${verticalAlign === 'end' && horizontalAlign === 'center'
                    ? 'border-primary/40 bg-primary-container/10'
                    : 'border-outline-variant/30'
                  }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${verticalAlign === 'end' && horizontalAlign === 'center' ? 'bg-primary' : 'bg-outline'
                    }`}
                ></div>
              </button>
              <button
                onClick={() => {
                  setVerticalAlign('end');
                  setHorizontalAlign('end');
                }}
                className={`aspect-square bg-white border rounded flex items-center justify-center hover:bg-primary-container/20 transition-all cursor-pointer ${verticalAlign === 'end' && horizontalAlign === 'end'
                    ? 'border-primary/40 bg-primary-container/10'
                    : 'border-outline-variant/30'
                  }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${verticalAlign === 'end' && horizontalAlign === 'end' ? 'bg-primary' : 'bg-outline'
                    }`}
                ></div>
              </button>
            </div>
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
    </div>
  );
};
