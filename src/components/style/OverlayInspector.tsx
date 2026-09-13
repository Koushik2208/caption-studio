import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { useLayout } from '../../context/LayoutContext';
import { FRAME_OPTIONS, FRAME_SHELL_COLORS } from '../../pages/overlayOptions';
import { CODE_LANGUAGE_LABELS, type CodeBlockPosition, type CodeLanguage, type TickerDirection, type TickerPosition } from '../../motion/types';
import type { ProgressBarPosition, WatermarkPosition } from '../../overlay/types';

const WATERMARK_POSITIONS: { value: WatermarkPosition; label: string }[] = [
  { value: 'tl', label: 'Top-L' },
  { value: 'tr', label: 'Top-R' },
  { value: 'bl', label: 'Btm-L' },
  { value: 'br', label: 'Btm-R' },
];

const PROGRESS_POSITIONS: { value: ProgressBarPosition; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
];

const PROGRESS_COLORS = [
  { name: 'Primary Blue', hex: '#0066ff' },
  { name: 'Error Red', hex: '#ba1a1a' },
  { name: 'Accent Pink', hex: '#ffdbd0' },
  { name: 'White', hex: '#ffffff' },
];

const CODE_POSITIONS: { value: CodeBlockPosition; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'center', label: 'Center' },
  { value: 'bottom', label: 'Bottom' },
];

const TICKER_POSITIONS: { value: TickerPosition; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
];

const TICKER_DIRECTIONS: { value: TickerDirection; label: string }[] = [
  { value: 'left', label: 'Scroll Left' },
  { value: 'right', label: 'Scroll Right' },
];

export const OverlayInspector: React.FC = () => {
  const { setIsCodeEditorOpen } = useLayout();
  const {
    frameVariant,
    setFrameVariant,
    frameBgColor,
    setFrameBgColor,
    bezelRadiusMultiplier,
    setBezelRadiusMultiplier,
    watermarkEnabled,
    setWatermarkEnabled,
    watermarkOpacity,
    setWatermarkOpacity,
    watermarkPosition,
    setWatermarkPosition,
    progressBarEnabled,
    setProgressBarEnabled,
    progressBarColor,
    setProgressBarColor,
    progressBarPosition,
    setProgressBarPosition,
    codeBlockEnabled,
    setCodeBlockEnabled,
    codeBlockLanguage,
    setCodeBlockLanguage,
    codeBlockPosition,
    setCodeBlockPosition,
    codeBlockLinesPerPage,
    setCodeBlockLinesPerPage,
    numberCounterEnabled,
    setNumberCounterEnabled,
    numberCounterStart,
    setNumberCounterStart,
    numberCounterEnd,
    setNumberCounterEnd,
    numberCounterPrefix,
    setNumberCounterPrefix,
    numberCounterSuffix,
    setNumberCounterSuffix,
    tickerEnabled,
    setTickerEnabled,
    tickerText,
    setTickerText,
    tickerDirection,
    setTickerDirection,
    tickerPosition,
    setTickerPosition,
  } = useProject();

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* SECTION 1: Frames & Bezels */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
            Frames & Borders
          </span>
          <span className="text-[11px] text-outline capitalize">{frameVariant}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {FRAME_OPTIONS.map((opt) => {
            const isSelected = frameVariant === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFrameVariant(opt.value)}
                className={`h-11 flex items-center justify-center px-2 text-center border rounded-lg transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'active-ring border-primary bg-primary-container/5 shadow-2xs font-semibold text-primary'
                    : 'border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:border-primary/50'
                }`}
              >
                <span className="text-xs leading-tight">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {(frameVariant === 'minimalBezel' || frameVariant === 'squareBezel') && (
          <div className="flex flex-col gap-2 p-3 bg-surface-container-low rounded-lg border border-outline-variant/40 mt-1">
            <span className="text-[11px] font-semibold text-on-surface">Shell Color</span>
            <div className="flex gap-2">
              {FRAME_SHELL_COLORS.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setFrameBgColor(color.hex)}
                  className={`w-7 h-7 rounded-full shadow-xs hover:scale-105 transition-transform active:scale-90 cursor-pointer ${color.bgClass} ${
                    frameBgColor === color.hex ? 'ring-2 ring-primary ring-offset-1' : ''
                  }`}
                  style={color.hex === '#ffffff' ? {} : { backgroundColor: color.hex }}
                  title={color.name}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>
        )}

        {frameVariant === 'minimalBezel' && (
          <div className="flex flex-col gap-1 p-3 bg-surface-container-low rounded-lg border border-outline-variant/40">
            <div className="flex justify-between text-xs text-on-surface">
              <span className="text-[11px] font-medium">Corner Radius</span>
              <span className="font-mono text-outline">{Math.round(bezelRadiusMultiplier * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1.5}
              step={0.05}
              value={bezelRadiusMultiplier}
              onChange={(e) => setBezelRadiusMultiplier(Number(e.target.value))}
              className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
            />
          </div>
        )}
      </section>

      <hr className="border-outline-variant/40" />

      {/* SECTION 2: Watermark */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
              Watermark
            </span>
            <span className="text-[11px] text-outline">Brand badge overlay</span>
          </div>
          <button
            type="button"
            onClick={() => setWatermarkEnabled(!watermarkEnabled)}
            className={`relative w-9 h-5 rounded-full transition-colors duration-150 cursor-pointer shrink-0 ${
              watermarkEnabled ? 'bg-primary' : 'bg-outline-variant'
            }`}
            aria-pressed={watermarkEnabled}
            aria-label="Toggle watermark"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-150 ${
                watermarkEnabled ? 'translate-x-4' : ''
              }`}
            />
          </button>
        </div>

        {watermarkEnabled && (
          <div className="flex flex-col gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant/40">
            {/* Opacity */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-on-surface">
                <span className="text-[11px] font-medium">Opacity</span>
                <span className="font-mono text-outline">{watermarkOpacity}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={watermarkOpacity}
                onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
              />
            </div>

            {/* Position */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-on-surface">Corner Position</span>
              <div className="grid grid-cols-4 gap-1 bg-surface-container p-1 rounded-md">
                {WATERMARK_POSITIONS.map((pos) => (
                  <button
                    key={pos.value}
                    type="button"
                    onClick={() => setWatermarkPosition(pos.value)}
                    className={`h-7 rounded text-[11px] font-medium transition-all cursor-pointer ${
                      watermarkPosition === pos.value
                        ? 'bg-white text-primary font-bold shadow-2xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <hr className="border-outline-variant/40" />

      {/* SECTION 3: Progress Bar */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
              Progress Bar
            </span>
            <span className="text-[11px] text-outline">Video timeline bar</span>
          </div>
          <button
            type="button"
            onClick={() => setProgressBarEnabled(!progressBarEnabled)}
            className={`relative w-9 h-5 rounded-full transition-colors duration-150 cursor-pointer shrink-0 ${
              progressBarEnabled ? 'bg-primary' : 'bg-outline-variant'
            }`}
            aria-pressed={progressBarEnabled}
            aria-label="Toggle progress bar"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-150 ${
                progressBarEnabled ? 'translate-x-4' : ''
              }`}
            />
          </button>
        </div>

        {progressBarEnabled && (
          <div className="flex flex-col gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant/40">
            {/* Position */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-on-surface">Placement</span>
              <div className="grid grid-cols-2 gap-1 bg-surface-container p-1 rounded-md">
                {PROGRESS_POSITIONS.map((pos) => (
                  <button
                    key={pos.value}
                    type="button"
                    onClick={() => setProgressBarPosition(pos.value)}
                    className={`h-7 rounded text-[11px] font-medium transition-all cursor-pointer ${
                      progressBarPosition === pos.value
                        ? 'bg-white text-primary font-bold shadow-2xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-medium text-on-surface">Bar Color</span>
              <div className="flex gap-1.5">
                {PROGRESS_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setProgressBarColor(c.hex)}
                    className={`w-6 h-6 rounded border border-outline-variant cursor-pointer ${
                      progressBarColor.toLowerCase() === c.hex.toLowerCase() ? 'ring-2 ring-primary ring-offset-1' : ''
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <hr className="border-outline-variant/40" />

      {/* SECTION 4: Motion Graphics */}
      <section className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
          Motion Graphics
        </span>

        {/* 1. Code Block */}
        <div className="flex flex-col gap-2.5 p-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-on-surface">Syntax Code Block</span>
              <span className="text-[11px] text-outline">Terminal code animation</span>
            </div>
            <button
              type="button"
              onClick={() => setCodeBlockEnabled(!codeBlockEnabled)}
              className={`relative w-9 h-5 rounded-full transition-colors duration-150 cursor-pointer shrink-0 ${
                codeBlockEnabled ? 'bg-primary' : 'bg-outline-variant'
              }`}
              aria-pressed={codeBlockEnabled}
              aria-label="Toggle code block"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-150 ${
                  codeBlockEnabled ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {codeBlockEnabled && (
            <div className="flex flex-col gap-2.5 pt-2 border-t border-outline-variant/30 mt-1">
              <button
                type="button"
                onClick={() => setIsCodeEditorOpen(true)}
                className="w-full py-1.5 px-3 rounded-md bg-primary-container/10 border border-primary/30 text-primary text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-primary-container/20 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">code</span>
                <span>Open Code Snippet Editor</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-outline">Language</span>
                  <select
                    value={codeBlockLanguage}
                    onChange={(e) => setCodeBlockLanguage(e.target.value as CodeLanguage)}
                    className="px-2 py-1 text-xs border border-outline-variant rounded bg-surface"
                  >
                    {Object.entries(CODE_LANGUAGE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-outline">Position</span>
                  <select
                    value={codeBlockPosition}
                    onChange={(e) => setCodeBlockPosition(e.target.value as CodeBlockPosition)}
                    className="px-2 py-1 text-xs border border-outline-variant rounded bg-surface"
                  >
                    {CODE_POSITIONS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] text-on-surface">
                  <span>Lines per Page</span>
                  <span className="font-mono text-outline">{codeBlockLinesPerPage}</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={16}
                  value={codeBlockLinesPerPage}
                  onChange={(e) => setCodeBlockLinesPerPage(Number(e.target.value))}
                  className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. Number Counter */}
        <div className="flex flex-col gap-2.5 p-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-on-surface">Animated Counter</span>
              <span className="text-[11px] text-outline">Dynamic rolling statistic</span>
            </div>
            <button
              type="button"
              onClick={() => setNumberCounterEnabled(!numberCounterEnabled)}
              className={`relative w-9 h-5 rounded-full transition-colors duration-150 cursor-pointer shrink-0 ${
                numberCounterEnabled ? 'bg-primary' : 'bg-outline-variant'
              }`}
              aria-pressed={numberCounterEnabled}
              aria-label="Toggle number counter"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-150 ${
                  numberCounterEnabled ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {numberCounterEnabled && (
            <div className="flex flex-col gap-2.5 pt-2 border-t border-outline-variant/30 mt-1">
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-outline">Start</span>
                  <input
                    type="number"
                    value={numberCounterStart}
                    onChange={(e) => setNumberCounterStart(Number(e.target.value))}
                    className="px-2 py-1 text-xs border border-outline-variant rounded bg-surface"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-outline">End</span>
                  <input
                    type="number"
                    value={numberCounterEnd}
                    onChange={(e) => setNumberCounterEnd(Number(e.target.value))}
                    className="px-2 py-1 text-xs border border-outline-variant rounded bg-surface"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-outline">Prefix</span>
                  <input
                    type="text"
                    value={numberCounterPrefix}
                    placeholder="e.g. $"
                    onChange={(e) => setNumberCounterPrefix(e.target.value)}
                    className="px-2 py-1 text-xs border border-outline-variant rounded bg-surface"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-outline">Suffix</span>
                  <input
                    type="text"
                    value={numberCounterSuffix}
                    placeholder="e.g. % or k"
                    onChange={(e) => setNumberCounterSuffix(e.target.value)}
                    className="px-2 py-1 text-xs border border-outline-variant rounded bg-surface"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* 3. Ticker Lower Third */}
        <div className="flex flex-col gap-2.5 p-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-on-surface">News Ticker</span>
              <span className="text-[11px] text-outline">Continuous scrolling headline</span>
            </div>
            <button
              type="button"
              onClick={() => setTickerEnabled(!tickerEnabled)}
              className={`relative w-9 h-5 rounded-full transition-colors duration-150 cursor-pointer shrink-0 ${
                tickerEnabled ? 'bg-primary' : 'bg-outline-variant'
              }`}
              aria-pressed={tickerEnabled}
              aria-label="Toggle ticker"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-150 ${
                  tickerEnabled ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {tickerEnabled && (
            <div className="flex flex-col gap-2.5 pt-2 border-t border-outline-variant/30 mt-1">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] text-outline">Headline Text</span>
                <input
                  type="text"
                  value={tickerText}
                  onChange={(e) => setTickerText(e.target.value)}
                  className="px-2 py-1 text-xs border border-outline-variant rounded bg-surface"
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-outline">Direction</span>
                  <select
                    value={tickerDirection}
                    onChange={(e) => setTickerDirection(e.target.value as TickerDirection)}
                    className="px-2 py-1 text-xs border border-outline-variant rounded bg-surface"
                  >
                    {TICKER_DIRECTIONS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-outline">Placement</span>
                  <select
                    value={tickerPosition}
                    onChange={(e) => setTickerPosition(e.target.value as TickerPosition)}
                    className="px-2 py-1 text-xs border border-outline-variant rounded bg-surface"
                  >
                    {TICKER_POSITIONS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
