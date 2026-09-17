import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { useLayout } from '../../context/LayoutContext';
import { FRAME_OPTIONS, FRAME_SHELL_COLORS } from '../../pages/overlayOptions';
import type { CardAspectRatio, CardBackdrop, CardBorderStyle } from '../../frames/types';
import { CODE_LANGUAGE_LABELS, type CodeBlockPosition, type CodeLanguage, type TickerDirection, type TickerPosition } from '../../motion/types';
import type { ProgressBarPosition, WatermarkPosition } from '../../overlay/types';

const CARD_ASPECT_RATIOS: { value: CardAspectRatio; label: string; sub: string }[] = [
  { value: '9:16', label: '9:16', sub: 'Vertical' },
  { value: '4:5', label: '4:5', sub: 'Portrait' },
  { value: '1:1', label: '1:1', sub: 'Square' },
  { value: '16:9', label: '16:9', sub: 'Wide' },
];

const CARD_BORDER_STYLES: { value: CardBorderStyle; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'double', label: 'Double' },
];

const CARD_BORDER_SWATCHES = ['#ffffff', '#000000', '#0066ff', '#00d4ff', '#fbbf24', '#ec4899'];

const BACKDROP_OPTIONS: { value: CardBackdrop; label: string; icon: string }[] = [
  { value: 'none', label: 'None', icon: 'block' },
  { value: 'solid', label: 'Solid', icon: 'palette' },
  { value: 'gradient', label: 'Gradient', icon: 'gradient' },
  { value: 'blurred-video', label: 'Blur FX', icon: 'blur_on' },
];

const BACKDROP_SOLID_SWATCHES = ['#121214', '#0f172a', '#000000', '#f4efe6', '#f8fafc', '#1e1b4b'];

const BACKDROP_GRADIENT_PRESETS = [
  { name: 'Midnight', gradient: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)' },
  { name: 'Sunset', gradient: 'linear-gradient(135deg, #431407 0%, #1e1b4b 100%)' },
  { name: 'Cyber', gradient: 'linear-gradient(180deg, #09090b 0%, #1e1b4b 50%, #0284c7 100%)' },
  { name: 'Smoke', gradient: 'linear-gradient(180deg, #27272a 0%, #09090b 100%)' },
];

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
    cardMode,
    setCardMode,
    customScale,
    setCustomScale,
    customAspectRatio,
    setCustomAspectRatio,
    customPositionY,
    setCustomPositionY,
    customBorderRadius,
    setCustomBorderRadius,
    customBorderEnabled,
    setCustomBorderEnabled,
    customBorderWidth,
    setCustomBorderWidth,
    customBorderColor,
    setCustomBorderColor,
    customBorderStyle,
    setCustomBorderStyle,
    customShadowEnabled,
    setCustomShadowEnabled,
    customShadowBlur,
    setCustomShadowBlur,
    customShadowOpacity,
    setCustomShadowOpacity,
    customBackdrop,
    setCustomBackdrop,
    customBackdropColor,
    setCustomBackdropColor,
    customBackdropGradient,
    setCustomBackdropGradient,
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
      {/* SECTION 1: Frames & Video Card */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
            Video Frame & Card
          </span>
          <span className="text-[11px] text-outline capitalize">
            {cardMode === 'custom' ? `Custom (${customAspectRatio})` : frameVariant}
          </span>
        </div>

        {/* Mode Switch: Preset vs Custom */}
        <div className="flex bg-surface-container p-1 rounded-lg border border-outline-variant/30">
          <button
            type="button"
            onClick={() => setCardMode('preset')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              cardMode === 'preset'
                ? 'bg-white text-primary shadow-xs font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Preset Frames
          </button>
          <button
            type="button"
            onClick={() => setCardMode('custom')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              cardMode === 'custom'
                ? 'bg-white text-primary shadow-xs font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Custom Card
          </button>
        </div>

        {/* PRESET MODE VIEW */}
        {cardMode === 'preset' && (
          <>
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
          </>
        )}

        {/* CUSTOM CARD MODE VIEW */}
        {cardMode === 'custom' && (
          <div className="flex flex-col gap-3.5">
            {/* 1. Aspect Ratio */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-on-surface">Card Aspect Ratio</span>
              <div className="grid grid-cols-4 gap-1.5">
                {CARD_ASPECT_RATIOS.map((ratio) => {
                  const isSelected = customAspectRatio === ratio.value;
                  return (
                    <button
                      key={ratio.value}
                      type="button"
                      onClick={() => setCustomAspectRatio(ratio.value)}
                      className={`py-2 px-1 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-primary font-bold shadow-2xs'
                          : 'border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:border-primary/40'
                      }`}
                    >
                      <span className="text-xs">{ratio.label}</span>
                      <span className="text-[9px] text-outline opacity-80">{ratio.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Scale Slider */}
            <div className="flex flex-col gap-1 p-3 bg-surface-container-low rounded-lg border border-outline-variant/40">
              <div className="flex justify-between text-xs text-on-surface">
                <span className="text-[11px] font-medium">Card Scale</span>
                <span className="font-mono text-outline">{Math.round(customScale * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={1.0}
                step={0.01}
                value={customScale}
                onChange={(e) => setCustomScale(Number(e.target.value))}
                className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
              />
            </div>

            {/* 3. Position Slider */}
            <div className="flex flex-col gap-1 p-3 bg-surface-container-low rounded-lg border border-outline-variant/40">
              <div className="flex justify-between text-xs text-on-surface">
                <span className="text-[11px] font-medium">Vertical Placement</span>
                <span className="font-mono text-outline">
                  {customPositionY <= 0.1
                    ? 'Top'
                    : customPositionY >= 0.9
                    ? 'Bottom'
                    : customPositionY === 0.5
                    ? 'Center'
                    : `${Math.round(customPositionY * 100)}%`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={customPositionY}
                onChange={(e) => setCustomPositionY(Number(e.target.value))}
                className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
              />
            </div>

            {/* 4. Corner Radius Slider */}
            <div className="flex flex-col gap-1 p-3 bg-surface-container-low rounded-lg border border-outline-variant/40">
              <div className="flex justify-between text-xs text-on-surface">
                <span className="text-[11px] font-medium">Corner Radius</span>
                <span className="font-mono text-outline">{customBorderRadius}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                step={2}
                value={customBorderRadius}
                onChange={(e) => setCustomBorderRadius(Number(e.target.value))}
                className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
              />
            </div>

            {/* 5. Border Configuration */}
            <div className="flex flex-col gap-2.5 p-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-on-surface">Card Border</span>
                  <span className="text-[11px] text-outline">Outer stroke boundary</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomBorderEnabled(!customBorderEnabled)}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-150 cursor-pointer shrink-0 ${
                    customBorderEnabled ? 'bg-primary' : 'bg-outline-variant'
                  }`}
                  aria-pressed={customBorderEnabled}
                  aria-label="Toggle card border"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-150 ${
                      customBorderEnabled ? 'translate-x-4' : ''
                    }`}
                  />
                </button>
              </div>

              {customBorderEnabled && (
                <div className="flex flex-col gap-3 pt-2 border-t border-outline-variant/30 mt-1">
                  {/* Border Width */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] text-on-surface">
                      <span>Width</span>
                      <span className="font-mono text-outline">{customBorderWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={16}
                      step={1}
                      value={customBorderWidth}
                      onChange={(e) => setCustomBorderWidth(Number(e.target.value))}
                      className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
                    />
                  </div>

                  {/* Border Style */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-on-surface font-medium">Style</span>
                    <div className="grid grid-cols-3 gap-1 bg-surface-container p-1 rounded-md">
                      {CARD_BORDER_STYLES.map((st) => (
                        <button
                          key={st.value}
                          type="button"
                          onClick={() => setCustomBorderStyle(st.value)}
                          className={`h-7 rounded text-[11px] font-medium transition-all cursor-pointer ${
                            customBorderStyle === st.value
                              ? 'bg-white text-primary font-bold shadow-2xs'
                              : 'text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Border Color */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-on-surface font-medium">Color</span>
                      <div className="flex items-center gap-1.5">
                        <label className="relative w-6 h-6 rounded overflow-hidden border border-outline-variant cursor-pointer shrink-0">
                          <input
                            type="color"
                            value={customBorderColor}
                            onChange={(e) => setCustomBorderColor(e.target.value)}
                            className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer border-0 p-0"
                          />
                        </label>
                        <input
                          type="text"
                          value={customBorderColor}
                          onChange={(e) => setCustomBorderColor(e.target.value)}
                          className="w-20 px-2 py-1 text-xs font-mono uppercase border border-outline-variant/80 rounded bg-surface"
                        />
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {CARD_BORDER_SWATCHES.map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setCustomBorderColor(hex)}
                          className={`w-5 h-5 rounded border border-outline-variant cursor-pointer transition-transform hover:scale-105 ${
                            customBorderColor.toLowerCase() === hex.toLowerCase()
                              ? 'ring-2 ring-primary ring-offset-1'
                              : ''
                          }`}
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Card Shadow / Elevation */}
            <div className="flex flex-col gap-2.5 p-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-on-surface">Card Elevation Shadow</span>
                  <span className="text-[11px] text-outline">Floating depth effect</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomShadowEnabled(!customShadowEnabled)}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-150 cursor-pointer shrink-0 ${
                    customShadowEnabled ? 'bg-primary' : 'bg-outline-variant'
                  }`}
                  aria-pressed={customShadowEnabled}
                  aria-label="Toggle card shadow"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-150 ${
                      customShadowEnabled ? 'translate-x-4' : ''
                    }`}
                  />
                </button>
              </div>

              {customShadowEnabled && (
                <div className="flex flex-col gap-3 pt-2 border-t border-outline-variant/30 mt-1">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] text-on-surface">
                      <span>Blur Radius</span>
                      <span className="font-mono text-outline">{customShadowBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={60}
                      step={2}
                      value={customShadowBlur}
                      onChange={(e) => setCustomShadowBlur(Number(e.target.value))}
                      className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] text-on-surface">
                      <span>Shadow Opacity</span>
                      <span className="font-mono text-outline">{customShadowOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={customShadowOpacity}
                      onChange={(e) => setCustomShadowOpacity(Number(e.target.value))}
                      className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 7. Canvas Backdrop */}
            <div className="flex flex-col gap-2.5 p-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest">
              <span className="text-xs font-semibold text-on-surface">Canvas Backdrop</span>
              <div className="grid grid-cols-4 gap-1 bg-surface-container p-1 rounded-md">
                {BACKDROP_OPTIONS.map((bd) => (
                  <button
                    key={bd.value}
                    type="button"
                    onClick={() => setCustomBackdrop(bd.value)}
                    className={`h-8 rounded text-[11px] font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      customBackdrop === bd.value
                        ? 'bg-white text-primary font-bold shadow-2xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span>{bd.label}</span>
                  </button>
                ))}
              </div>

              {/* Solid Backdrop Customizer */}
              {customBackdrop === 'solid' && (
                <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/30 mt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-on-surface">Solid Color</span>
                    <div className="flex items-center gap-1.5">
                      <label className="relative w-6 h-6 rounded overflow-hidden border border-outline-variant cursor-pointer shrink-0">
                        <input
                          type="color"
                          value={customBackdropColor}
                          onChange={(e) => setCustomBackdropColor(e.target.value)}
                          className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer border-0 p-0"
                        />
                      </label>
                      <input
                        type="text"
                        value={customBackdropColor}
                        onChange={(e) => setCustomBackdropColor(e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-mono uppercase border border-outline-variant/80 rounded bg-surface"
                      />
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {BACKDROP_SOLID_SWATCHES.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setCustomBackdropColor(hex)}
                        className={`w-6 h-6 rounded border border-outline-variant cursor-pointer transition-transform hover:scale-105 ${
                          customBackdropColor.toLowerCase() === hex.toLowerCase()
                            ? 'ring-2 ring-primary ring-offset-1'
                            : ''
                        }`}
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Gradient Backdrop Customizer */}
              {customBackdrop === 'gradient' && (
                <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/30 mt-1">
                  <span className="text-[11px] font-medium text-on-surface">Gradient Preset</span>
                  <div className="grid grid-cols-2 gap-2">
                    {BACKDROP_GRADIENT_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setCustomBackdropGradient(p.gradient)}
                        className={`h-9 rounded-lg border flex items-center px-2 gap-2 cursor-pointer transition-all ${
                          customBackdropGradient === p.gradient
                            ? 'ring-2 ring-primary ring-offset-1 border-primary font-bold'
                            : 'border-outline-variant/60 hover:border-primary/40'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-md shrink-0 border border-white/20 shadow-2xs"
                          style={{ background: p.gradient }}
                        />
                        <span className="text-xs text-on-surface">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
