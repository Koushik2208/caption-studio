import React, { useRef } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useLayout } from '../../context/LayoutContext';
import { FRAME_OPTIONS, FRAME_SHELL_COLORS } from '../../pages/overlayOptions';
import type { CardAspectRatio, CardBackdrop, CardBorderStyle, CompositionLayout } from '../../frames/types';
import {
  CODE_LANGUAGE_LABELS,
  type CodeBlockPosition,
  type CodeLanguage,
  type TickerDirection,
  type TickerPosition,
} from '../../motion/types';
import type { ProgressBarPosition, WatermarkPosition } from '../../overlay/types';
import { normalizeWatermarkPosition } from '../../creative/schema';

const LAYOUT_OPTIONS: { value: CompositionLayout; label: string; icon: string; sub: string }[] = [
  { value: 'floating-card', label: 'Floating Card', icon: 'crop_free', sub: 'Framed card' },
  { value: 'full-bleed', label: 'Full Bleed', icon: 'fullscreen', sub: 'Edge-to-edge' },
  { value: 'top-bottom-split', label: 'Top / Bottom', icon: 'vertical_split', sub: 'Vertical split' },
  { value: 'left-right-split', label: 'Left / Right', icon: 'view_column', sub: 'Horizontal split' },
];

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

const WATERMARK_GRID_POSITIONS: { value: WatermarkPosition; label: string; icon: string }[] = [
  { value: 'top-left', label: 'Top-L', icon: 'north_west' },
  { value: 'top-center', label: 'Top-C', icon: 'north' },
  { value: 'top-right', label: 'Top-R', icon: 'north_east' },
  { value: 'center-left', label: 'Mid-L', icon: 'west' },
  { value: 'center', label: 'Center', icon: 'filter_center_focus' },
  { value: 'center-right', label: 'Mid-R', icon: 'east' },
  { value: 'bottom-left', label: 'Btm-L', icon: 'south_west' },
  { value: 'bottom-center', label: 'Btm-C', icon: 'south' },
  { value: 'bottom-right', label: 'Btm-R', icon: 'south_east' },
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

/**
 * CompositionInspector (OverlayInspector)
 * Structured across conceptual sections:
 * 1. Layout (Floating Card, Full Bleed, Top / Bottom Split)
 * 2. Video Frame & Styling
 * 3. Canvas Background
 * 4. Card Containers
 * 5. Watermark
 * 6. Progress Bar
 * 7. Motion Graphics
 */
export const OverlayInspector: React.FC = () => {
  const { setIsCodeEditorOpen } = useLayout();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleWatermarkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validExtensions = /\.(png|jpe?g|webp|svg)$/i;
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type) && !validExtensions.test(file.name)) {
      alert('Please select a valid image file (.png, .jpg, .webp, .svg). PNG or WebP with transparency is recommended.');
      return;
    }
    setWatermark(file);
    e.target.value = '';
  };
  const {
    layout,
    setLayout,
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
    splitGap,
    setSplitGap,
    splitTopFocalX,
    setSplitTopFocalX,
    splitTopFocalY,
    setSplitTopFocalY,
    splitBottomFocalX,
    setSplitBottomFocalX,
    splitBottomFocalY,
    setSplitBottomFocalY,
    splitLeftFocalX,
    setSplitLeftFocalX,
    splitLeftFocalY,
    setSplitLeftFocalY,
    splitRightFocalX,
    setSplitRightFocalX,
    splitRightFocalY,
    setSplitRightFocalY,
    watermarkEnabled,
    setWatermarkEnabled,
    watermarkOpacity,
    setWatermarkOpacity,
    watermarkPosition,
    setWatermarkPosition,
    watermarkSize,
    setWatermarkSize,
    watermarkFile,
    watermarkUrl,
    watermarkFilename,
    setWatermark,
    removeWatermark,
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
    <div className="flex flex-col gap-5 p-4">
      {/* =========================================================================
          SECTION 1: Composition Layout
          ========================================================================= */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
              Composition Layout
            </span>
            <span className="text-[11px] text-outline">Canvas structural arrangement</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold uppercase tracking-wide">
            {layout}
          </span>
        </div>

        {/* Layout Mode Selector */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-surface-container rounded-xl border border-outline-variant/30">
          {LAYOUT_OPTIONS.map((opt) => {
            const isSelected = layout === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLayout(opt.value)}
                className={`py-2 px-1 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-white text-primary font-bold shadow-2xs'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] mb-0.5">{opt.icon}</span>
                <span className="text-[10.5px] leading-tight text-center font-medium">{opt.label}</span>
                <span className="text-[8.5px] text-outline opacity-75">{opt.sub}</span>
              </button>
            );
          })}
        </div>
      </section>

      <hr className="border-outline-variant/40" />

      {/* =========================================================================
          SECTION 2: Video Frame & Styling
          ========================================================================= */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
              Video Frame
            </span>
            <span className="text-[11px] text-outline">
              {layout === 'top-bottom-split' || layout === 'left-right-split'
                ? 'Dual zone card styling'
                : layout === 'full-bleed'
                ? 'Full canvas media'
                : 'Card shape & styling'}
            </span>
          </div>
          <span className="text-[11px] text-outline capitalize font-mono">
            {layout === 'full-bleed'
              ? 'Full Bleed'
              : layout === 'top-bottom-split' || layout === 'left-right-split'
              ? 'Split Zones'
              : cardMode === 'custom'
              ? `Custom (${customAspectRatio})`
              : frameVariant}
          </span>
        </div>

        {/* FULL BLEED NOTICE */}
        {layout === 'full-bleed' && (
          <div className="flex items-center gap-2 p-3 rounded-xl border border-primary/20 bg-primary/5 text-primary">
            <span className="material-symbols-outlined text-[18px]">fullscreen</span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold">Full Bleed Active</span>
              <span className="text-[11px] text-on-surface-variant">
                Video fills the composition edge-to-edge with no border insets.
              </span>
            </div>
          </div>
        )}

        {/* TOP / BOTTOM & LEFT / RIGHT SPLIT CONTROLS */}
        {(layout === 'top-bottom-split' || layout === 'left-right-split') && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 p-2.5 rounded-lg border border-primary/20 bg-primary/5 text-primary">
              <span className="material-symbols-outlined text-[18px]">
                {layout === 'top-bottom-split' ? 'vertical_split' : 'view_column'}
              </span>
              <span className="text-xs font-medium">
                {layout === 'top-bottom-split'
                  ? 'Dual video cards with central typography band'
                  : 'Dual video cards with side-by-side horizontal split'}
              </span>
            </div>

            {/* Split Gap Slider */}
            <div className="flex flex-col gap-1 p-3 bg-surface-container-low rounded-lg border border-outline-variant/40">
              <div className="flex justify-between text-xs text-on-surface">
                <span className="text-[11px] font-medium">Split Gap</span>
                <span className="font-mono text-outline">
                  {splitGap === 0 ? '0px (Touching)' : `${splitGap}px`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                step={1}
                value={splitGap}
                onChange={(e) => setSplitGap(Number(e.target.value))}
                className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
              />
            </div>

            {/* Zone Video Focus Controls */}
            <div className="flex flex-col gap-2.5 p-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-on-surface">Zone Video Focus</span>
                <span className="text-[11px] text-outline">Crop & focal positioning per region</span>
              </div>

              {layout === 'top-bottom-split' ? (
                <div className="flex flex-col gap-3 pt-1 border-t border-outline-variant/30">
                  {/* Top Video Focus */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-primary">Top Video</span>
                      <span className="text-[10px] font-mono text-outline">
                        {Math.round(splitTopFocalX * 100)}% X, {Math.round(splitTopFocalY * 100)}% Y
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] text-outline">
                        <span>Horizontal</span>
                        <span>{Math.round(splitTopFocalX * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={splitTopFocalX}
                        onChange={(e) => setSplitTopFocalX(Number(e.target.value))}
                        className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] text-outline">
                        <span>Vertical</span>
                        <span>{Math.round(splitTopFocalY * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={splitTopFocalY}
                        onChange={(e) => setSplitTopFocalY(Number(e.target.value))}
                        className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
                      />
                    </div>
                  </div>

                  <hr className="border-outline-variant/20" />

                  {/* Bottom Video Focus */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-primary">Bottom Video</span>
                      <span className="text-[10px] font-mono text-outline">
                        {Math.round(splitBottomFocalX * 100)}% X, {Math.round(splitBottomFocalY * 100)}% Y
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] text-outline">
                        <span>Horizontal</span>
                        <span>{Math.round(splitBottomFocalX * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={splitBottomFocalX}
                        onChange={(e) => setSplitBottomFocalX(Number(e.target.value))}
                        className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] text-outline">
                        <span>Vertical</span>
                        <span>{Math.round(splitBottomFocalY * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={splitBottomFocalY}
                        onChange={(e) => setSplitBottomFocalY(Number(e.target.value))}
                        className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 pt-1 border-t border-outline-variant/30">
                  {/* Left Video Focus */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-primary">Left Video</span>
                      <span className="text-[10px] font-mono text-outline">
                        {Math.round(splitLeftFocalX * 100)}% X, {Math.round(splitLeftFocalY * 100)}% Y
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] text-outline">
                        <span>Horizontal</span>
                        <span>{Math.round(splitLeftFocalX * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={splitLeftFocalX}
                        onChange={(e) => setSplitLeftFocalX(Number(e.target.value))}
                        className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] text-outline">
                        <span>Vertical</span>
                        <span>{Math.round(splitLeftFocalY * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={splitLeftFocalY}
                        onChange={(e) => setSplitLeftFocalY(Number(e.target.value))}
                        className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
                      />
                    </div>
                  </div>

                  <hr className="border-outline-variant/20" />

                  {/* Right Video Focus */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-primary">Right Video</span>
                      <span className="text-[10px] font-mono text-outline">
                        {Math.round(splitRightFocalX * 100)}% X, {Math.round(splitRightFocalY * 100)}% Y
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] text-outline">
                        <span>Horizontal</span>
                        <span>{Math.round(splitRightFocalX * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={splitRightFocalX}
                        onChange={(e) => setSplitRightFocalX(Number(e.target.value))}
                        className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] text-outline">
                        <span>Vertical</span>
                        <span>{Math.round(splitRightFocalY * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={splitRightFocalY}
                        onChange={(e) => setSplitRightFocalY(Number(e.target.value))}
                        className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Corner Radius Slider */}
            <div className="flex flex-col gap-1 p-3 bg-surface-container-low rounded-lg border border-outline-variant/40">
              <div className="flex justify-between text-xs text-on-surface">
                <span className="text-[11px] font-medium">Zone Corner Radius</span>
                <span className="font-mono text-outline">{customBorderRadius}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={60}
                step={2}
                value={customBorderRadius}
                onChange={(e) => setCustomBorderRadius(Number(e.target.value))}
                className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
              />
            </div>

            {/* Border Configuration */}
            <div className="flex flex-col gap-2.5 p-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-on-surface">Zone Border</span>
                  <span className="text-[11px] text-outline">Outer stroke boundary</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomBorderEnabled(!customBorderEnabled)}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-150 cursor-pointer shrink-0 ${
                    customBorderEnabled ? 'bg-primary' : 'bg-outline-variant'
                  }`}
                  aria-pressed={customBorderEnabled}
                  aria-label="Toggle zone border"
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
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] text-on-surface">
                      <span>Width</span>
                      <span className="font-mono text-outline">{customBorderWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={12}
                      step={1}
                      value={customBorderWidth}
                      onChange={(e) => setCustomBorderWidth(Number(e.target.value))}
                      className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
                    />
                  </div>

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
                </div>
              )}
            </div>

            {/* Shadow Elevation */}
            <div className="flex flex-col gap-2.5 p-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-on-surface">Zone Elevation Shadow</span>
                  <span className="text-[11px] text-outline">Floating depth effect</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomShadowEnabled(!customShadowEnabled)}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-150 cursor-pointer shrink-0 ${
                    customShadowEnabled ? 'bg-primary' : 'bg-outline-variant'
                  }`}
                  aria-pressed={customShadowEnabled}
                  aria-label="Toggle zone shadow"
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
                </div>
              )}
            </div>
          </div>
        )}

        {/* FLOATING CARD CONTROLS (Default) */}
        {layout === 'floating-card' && (
          <>
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
              <div className="flex flex-col gap-2.5">
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
                  <div className="flex flex-col gap-2 p-3 bg-surface-container-low rounded-lg border border-outline-variant/40">
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
              </div>
            )}

            {/* CUSTOM CARD MODE VIEW */}
            {cardMode === 'custom' && (
              <div className="flex flex-col gap-3">
                {/* Aspect Ratio */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-medium text-on-surface">Aspect Ratio</span>
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

                {/* Scale Slider */}
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

                {/* Vertical Position Slider */}
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

                {/* Corner Radius Slider */}
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

                {/* Border Configuration */}
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

                {/* Shadow Elevation */}
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
              </div>
            )}
          </>
        )}
      </section>

      <hr className="border-outline-variant/40" />

      {/* =========================================================================
          SECTION 3: Canvas Background (Independent Backdrop)
          ========================================================================= */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
              Canvas Background
            </span>
            <span className="text-[11px] text-outline">Full composition backdrop</span>
          </div>
          <span className="text-[11px] text-outline capitalize font-mono">{customBackdrop}</span>
        </div>

        {/* Backdrop Mode Options */}
        <div className="grid grid-cols-4 gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant/30">
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

        {/* Solid Color Customizer */}
        {customBackdrop === 'solid' && (
          <div className="flex flex-col gap-2.5 p-3 rounded-xl border border-outline-variant/40 bg-surface-container-low">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-on-surface">Backdrop Color</span>
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

        {/* Gradient Presets */}
        {customBackdrop === 'gradient' && (
          <div className="flex flex-col gap-2 p-3 rounded-xl border border-outline-variant/40 bg-surface-container-low">
            <span className="text-[11px] font-medium text-on-surface">Gradient Presets</span>
            <div className="grid grid-cols-2 gap-2">
              {BACKDROP_GRADIENT_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setCustomBackdropGradient(p.gradient)}
                  className={`h-9 rounded-lg border flex items-center px-2 gap-2 cursor-pointer transition-all ${
                    customBackdropGradient === p.gradient
                      ? 'ring-2 ring-primary ring-offset-1 border-primary font-bold bg-white'
                      : 'border-outline-variant/60 bg-surface-container-lowest hover:border-primary/40'
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

        {/* Blur FX Info */}
        {customBackdrop === 'blurred-video' && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg border border-primary/20 bg-primary/5 text-primary">
            <span className="material-symbols-outlined text-[18px]">blur_on</span>
            <span className="text-xs font-medium">Dynamic video blur backdrop active</span>
          </div>
        )}
      </section>

      <hr className="border-outline-variant/40" />

      {/* =========================================================================
          SECTION 4: Card Containers (Architecture Foundation)
          ========================================================================= */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
              Card Containers
            </span>
            <span className="text-[11px] text-outline">Composition layer hierarchy</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
            {layout === 'top-bottom-split' || layout === 'left-right-split'
              ? '2 Zones Active'
              : layout === 'full-bleed'
              ? 'Full Bleed'
              : '1 Card Active'}
          </span>
        </div>

        {layout === 'top-bottom-split' ? (
          <div className="flex flex-col gap-2">
            <div className="p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[15px]">vertical_align_top</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-on-surface">Top Video Region</span>
                  <span className="text-[10px] text-outline">Upper framing focus (42% height)</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-outline">Zone 1</span>
            </div>
            <div className="p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[15px]">vertical_align_bottom</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-on-surface">Bottom Video Region</span>
                  <span className="text-[10px] text-outline">Action framing focus (42% height)</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-outline">Zone 2</span>
            </div>
          </div>
        ) : layout === 'left-right-split' ? (
          <div className="flex flex-col gap-2">
            <div className="p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[15px]">align_horizontal_left</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-on-surface">Left Video Region</span>
                  <span className="text-[10px] text-outline">Left framing focus (~45% width)</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-outline">Zone 1</span>
            </div>
            <div className="p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[15px]">align_horizontal_right</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-on-surface">Right Video Region</span>
                  <span className="text-[10px] text-outline">Right framing focus (~45% width)</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-outline">Zone 2</span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[17px]">video_file</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-on-surface">
                  {layout === 'full-bleed' ? 'Full Bleed Canvas' : 'Primary Video Card'}
                </span>
                <span className="text-[10px] text-outline">
                  {layout === 'full-bleed'
                    ? 'Canvas Layer (Full Viewport)'
                    : 'Layer 1 (Active Media Container)'}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-outline font-mono">100%</span>
          </div>
        )}
      </section>

      <hr className="border-outline-variant/40" />

      {/* =========================================================================
          SECTION 5: Watermark
          ========================================================================= */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
              Watermark
            </span>
            <span className="text-[11px] text-outline">Brand badge & logo overlay</span>
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

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleWatermarkUpload}
        />

        {watermarkEnabled && (
          <div className="flex flex-col gap-3.5 p-3 bg-surface-container-low rounded-lg border border-outline-variant/40">
            {/* Upload / Replace / Remove Watermark */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-on-surface">Logo Asset</span>
              {watermarkUrl ? (
                <div className="flex items-center gap-2.5 p-2 bg-surface-container rounded-lg border border-outline-variant/30">
                  <div className="w-10 h-10 rounded bg-black/40 flex items-center justify-center overflow-hidden shrink-0 border border-outline-variant/20 p-1">
                    <img src={watermarkUrl} alt="Watermark Preview" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-semibold text-on-surface truncate">
                      {watermarkFilename || watermarkFile?.name || 'Custom Watermark'}
                    </span>
                    <span className="text-[10px] text-outline truncate">
                      {watermarkFile ? `${(watermarkFile.size / 1024).toFixed(1)} KB` : 'Local Asset'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
                      title="Replace watermark"
                      aria-label="Replace watermark image"
                    >
                      <span className="material-symbols-outlined text-base">swap_horiz</span>
                    </button>
                    <button
                      type="button"
                      onClick={removeWatermark}
                      className="p-1.5 rounded-md text-on-surface-variant hover:text-error hover:bg-surface-container-high transition-colors cursor-pointer"
                      title="Remove watermark"
                      aria-label="Remove watermark image"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg border border-dashed border-outline hover:border-primary bg-surface-container/40 hover:bg-surface-container text-on-surface text-xs font-medium transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base text-primary">add_photo_alternate</span>
                  <span>Upload Logo (PNG, WebP, SVG, JPG)</span>
                </button>
              )}
            </div>

            {/* Position 3x3 Grid */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-on-surface">
                <span className="text-[11px] font-medium">Position</span>
                <span className="font-mono text-outline capitalize text-[10px]">
                  {watermarkPosition.replace('-', ' ')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-surface-container p-1 rounded-md">
                {WATERMARK_GRID_POSITIONS.map((pos) => {
                  const isSelected = normalizeWatermarkPosition(watermarkPosition) === pos.value;
                  return (
                    <button
                      key={pos.value}
                      type="button"
                      onClick={() => setWatermarkPosition(pos.value)}
                      title={pos.label}
                      className={`h-7 rounded text-[10px] font-medium transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-white text-primary font-bold shadow-2xs'
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">{pos.icon}</span>
                      <span>{pos.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-on-surface">
                <span className="text-[11px] font-medium">Size</span>
                <span className="font-mono text-outline">{watermarkSize}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={40}
                value={watermarkSize}
                onChange={(e) => setWatermarkSize(Number(e.target.value))}
                className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
              />
            </div>

            {/* Opacity Slider */}
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
          </div>
        )}
      </section>

      <hr className="border-outline-variant/40" />

      {/* =========================================================================
          SECTION 6: Progress Bar
          ========================================================================= */}
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

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-medium text-on-surface">Bar Color</span>
              <div className="flex gap-1.5">
                {PROGRESS_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setProgressBarColor(c.hex)}
                    className={`w-6 h-6 rounded border border-outline-variant cursor-pointer ${
                      progressBarColor.toLowerCase() === c.hex.toLowerCase()
                        ? 'ring-2 ring-primary ring-offset-1'
                        : ''
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

      {/* =========================================================================
          SECTION 7: Motion Graphics
          ========================================================================= */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
            Motion Graphics
          </span>
          <span className="text-[11px] text-outline">Dynamic animated overlays</span>
        </div>

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
                      <option key={k} value={k}>
                        {v}
                      </option>
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
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
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
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
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
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
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
