import React, { useState } from 'react';
import { staticFile } from 'remotion';
import { useProject } from '../../context/ProjectContext';
import { useMediaDurationFrames } from '../../preview/useMediaDurationFrames';
import type { OverlayIntensity, GradientOverlayDirection } from '../../textures/types';
import { TRANSITION_OVERLAYS, SOUND_EFFECTS, getAssetById } from '../../assets/registry';

const STROKE_SWATCHES = ['#000000', '#ffffff', '#1a1c1d', '#e8262b'];
const GLOW_SWATCHES = ['#0066ff', '#00f0ff', '#a855f7', '#ec4899', '#eab308', '#22c55e', '#ffffff'];
const GRADIENT_SWATCHES = ['#ffffff', '#10b981', '#0066ff', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];
const GRADIENT_OVERLAY_SWATCHES = ['#000000', '#111827', '#0f172a', '#1e1b4b', '#18181b', '#ffffff'];

const GRADIENT_OVERLAY_DIRECTIONS: { value: GradientOverlayDirection; label: string }[] = [
  { value: 'bottom', label: 'Bottom' },
  { value: 'top', label: 'Top' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
];

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
    glowEnabled,
    setGlowEnabled,
    glowColor,
    setGlowColor,
    glowIntensity,
    setGlowIntensity,
    glowBlur,
    setGlowBlur,
    glowOpacity,
    setGlowOpacity,
    gradientEnabled,
    setGradientEnabled,
    gradientStart,
    setGradientStart,
    gradientEnd,
    setGradientEnd,
    gradientAngle,
    setGradientAngle,
    filmDustEnabled,
    setFilmDustEnabled,
    filmGrainEnabled,
    setFilmGrainEnabled,
    filmGrainIntensity,
    setFilmGrainIntensity,
    gradientOverlayEnabled,
    setGradientOverlayEnabled,
    gradientOverlayColor,
    setGradientOverlayColor,
    gradientOverlayOpacity,
    setGradientOverlayOpacity,
    gradientOverlayStrength,
    setGradientOverlayStrength,
    gradientOverlayDirection,
    setGradientOverlayDirection,
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
    transitionOverlays,
    addTransitionOverlay,
    removeTransitionOverlay,
    updateTransitionOverlay,
    soundEffects,
    addSoundEffect,
    removeSoundEffect,
    updateSoundEffect,
    currentCreativeProject,
    captions,
    mediaUrl,
  } = useProject();

  const fps = currentCreativeProject?.fps ?? 30;
  const mediaDurationFrames = useMediaDurationFrames(mediaUrl, fps);
  const hasCaptions = !!captions && captions.length > 0;
  const captionDurationFrames = hasCaptions
    ? Math.max(1, Math.round((captions[captions.length - 1].endMs / 1000) * fps))
    : 300;
  const totalDurationFrames =
    mediaUrl && mediaDurationFrames > 0
      ? Math.max(mediaDurationFrames, captionDurationFrames)
      : (currentCreativeProject?.durationInFrames ?? captionDurationFrames);
  const totalDurationSec = Math.round((totalDurationFrames / fps) * 100) / 100;

  const framesToSec = (frames: number): number => {
    return Math.round((frames / fps) * 100) / 100;
  };

  const secToFrames = (sec: number): number => {
    return Math.round(sec * fps);
  };

  const [selectedTransitionId, setSelectedTransitionId] = useState<string>(
    TRANSITION_OVERLAYS[0]?.id ?? 'film_burn',
  );
  const [newTransitionStartSec, setNewTransitionStartSec] = useState<string>('0');
  const [newTransitionDurationSec, setNewTransitionDurationSec] = useState<string>('0.5');

  const [selectedSfxId, setSelectedSfxId] = useState<string>(
    SOUND_EFFECTS[0]?.id ?? 'vine_boom',
  );
  const [newSfxStartSec, setNewSfxStartSec] = useState<string>('0');

  const handlePlayAudio = (assetPath: string) => {
    try {
      const src = staticFile(assetPath);
      const audio = new Audio(src);
      audio.play().catch((e) => console.warn('Audio preview error:', e));
    } catch (err) {
      console.warn('Failed to play preview:', err);
    }
  };

  const parsedTransStart = parseFloat(newTransitionStartSec);
  const parsedTransDur = parseFloat(newTransitionDurationSec);

  const isTransStartValid = !isNaN(parsedTransStart) && parsedTransStart >= 0 && (totalDurationSec <= 0 || parsedTransStart <= totalDurationSec);
  const isTransDurValid = !isNaN(parsedTransDur) && parsedTransDur > 0 && (totalDurationSec <= 0 || (parsedTransStart + parsedTransDur) <= totalDurationSec + 0.001);

  const transValidationError = isNaN(parsedTransStart) || parsedTransStart < 0
    ? 'Start time must be >= 0 sec'
    : totalDurationSec > 0 && parsedTransStart > totalDurationSec
    ? `Start time exceeds project duration (${totalDurationSec}s)`
    : isNaN(parsedTransDur) || parsedTransDur <= 0
    ? 'Duration must be > 0 sec'
    : totalDurationSec > 0 && (parsedTransStart + parsedTransDur) > totalDurationSec + 0.001
    ? `Transition extends beyond project duration (${totalDurationSec}s)`
    : null;

  const parsedSfxStart = parseFloat(newSfxStartSec);
  const isSfxStartValid = !isNaN(parsedSfxStart) && parsedSfxStart >= 0 && (totalDurationSec <= 0 || parsedSfxStart <= totalDurationSec);

  const sfxValidationError = isNaN(parsedSfxStart) || parsedSfxStart < 0
    ? 'Start time must be >= 0 sec'
    : totalDurationSec > 0 && parsedSfxStart > totalDurationSec
    ? `Start time exceeds project duration (${totalDurationSec}s)`
    : null;

  const handleAddTransition = () => {
    if (transValidationError) return;
    const startSec = Math.max(0, parseFloat(newTransitionStartSec) || 0);
    const durSec = Math.max(0.05, parseFloat(newTransitionDurationSec) || 0.5);
    const startFrame = secToFrames(startSec);
    const durationInFrames = Math.max(1, secToFrames(durSec));

    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `trans-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    addTransitionOverlay({
      id,
      assetId: selectedTransitionId,
      startFrame,
      durationInFrames,
      opacity: 1,
    });
  };

  const handleAddSfx = () => {
    if (sfxValidationError) return;
    const startSec = Math.max(0, parseFloat(newSfxStartSec) || 0);
    const startFrame = secToFrames(startSec);

    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `sfx-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    addSoundEffect({
      id,
      assetId: selectedSfxId,
      startFrame,
      volume: 1,
    });
  };

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

        {/* Caption Glow */}
        <div className="flex flex-col gap-2.5 p-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-on-surface">Caption Glow</span>
              <span className="text-[11px] text-outline">Soft luminous atmospheric text radiance</span>
            </div>
            <button
              type="button"
              onClick={() => setGlowEnabled(!glowEnabled)}
              className={`relative w-9 h-5 rounded-full transition-colors duration-150 cursor-pointer shrink-0 ${
                glowEnabled ? 'bg-primary' : 'bg-outline-variant'
              }`}
              aria-pressed={glowEnabled}
              aria-label="Toggle caption glow"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-150 ${
                  glowEnabled ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {glowEnabled && (
            <div className="flex flex-col gap-3 pt-2 border-t border-outline-variant/30 mt-1">
              {/* Color */}
              <div className="flex items-center gap-2">
                <label className="relative w-6 h-6 rounded overflow-hidden border border-outline-variant cursor-pointer shrink-0">
                  <input
                    type="color"
                    value={glowColor}
                    onChange={(e) => setGlowColor(e.target.value)}
                    className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer border-0 p-0"
                  />
                </label>
                <input
                  type="text"
                  value={glowColor}
                  onChange={(e) => setGlowColor(e.target.value)}
                  className="w-20 px-2 py-1 text-xs font-mono uppercase border border-outline-variant/80 rounded bg-surface"
                />
                <div className="flex items-center gap-1 ml-auto">
                  {GLOW_SWATCHES.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setGlowColor(hex)}
                      className={`w-5 h-5 rounded border border-outline-variant cursor-pointer ${
                        glowColor.toLowerCase() === hex.toLowerCase() ? 'ring-2 ring-primary ring-offset-1' : ''
                      }`}
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>

              {/* Intensity Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] text-on-surface">
                  <span>Intensity</span>
                  <span className="font-mono text-outline">{Math.round(glowIntensity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={glowIntensity}
                  onChange={(e) => setGlowIntensity(Number(e.target.value))}
                  className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
                />
              </div>

              {/* Blur Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] text-on-surface">
                  <span>Blur</span>
                  <span className="font-mono text-outline">{glowBlur}px</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={30}
                  step={1}
                  value={glowBlur}
                  onChange={(e) => setGlowBlur(Number(e.target.value))}
                  className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
                />
              </div>

              {/* Opacity Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] text-on-surface">
                  <span>Opacity</span>
                  <span className="font-mono text-outline">{Math.round(glowOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={glowOpacity}
                  onChange={(e) => setGlowOpacity(Number(e.target.value))}
                  className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Text Gradient */}
        <div className="flex flex-col gap-2.5 p-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-on-surface">Text Gradient</span>
              <span className="text-[11px] text-outline">Linear two-tone color gradient fill</span>
            </div>
            <button
              type="button"
              onClick={() => setGradientEnabled(!gradientEnabled)}
              className={`relative w-9 h-5 rounded-full transition-colors duration-150 cursor-pointer shrink-0 ${
                gradientEnabled ? 'bg-primary' : 'bg-outline-variant'
              }`}
              aria-pressed={gradientEnabled}
              aria-label="Toggle text gradient"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-150 ${
                  gradientEnabled ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {gradientEnabled && (
            <div className="flex flex-col gap-3 pt-2 border-t border-outline-variant/30 mt-1">
              {/* Start Color */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-on-surface">Start Color</span>
                  <div className="flex items-center gap-1.5">
                    <label className="relative w-6 h-6 rounded overflow-hidden border border-outline-variant cursor-pointer shrink-0">
                      <input
                        type="color"
                        value={gradientStart}
                        onChange={(e) => setGradientStart(e.target.value)}
                        className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer border-0 p-0"
                      />
                    </label>
                    <input
                      type="text"
                      value={gradientStart}
                      onChange={(e) => setGradientStart(e.target.value)}
                      className="w-20 px-2 py-1 text-xs font-mono uppercase border border-outline-variant/80 rounded bg-surface"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {GRADIENT_SWATCHES.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setGradientStart(hex)}
                      className={`w-5 h-5 rounded border border-outline-variant cursor-pointer transition-transform hover:scale-105 ${
                        gradientStart.toLowerCase() === hex.toLowerCase() ? 'ring-2 ring-primary ring-offset-1' : ''
                      }`}
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>

              {/* End Color */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-on-surface">End Color</span>
                  <div className="flex items-center gap-1.5">
                    <label className="relative w-6 h-6 rounded overflow-hidden border border-outline-variant cursor-pointer shrink-0">
                      <input
                        type="color"
                        value={gradientEnd}
                        onChange={(e) => setGradientEnd(e.target.value)}
                        className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer border-0 p-0"
                      />
                    </label>
                    <input
                      type="text"
                      value={gradientEnd}
                      onChange={(e) => setGradientEnd(e.target.value)}
                      className="w-20 px-2 py-1 text-xs font-mono uppercase border border-outline-variant/80 rounded bg-surface"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {GRADIENT_SWATCHES.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setGradientEnd(hex)}
                      className={`w-5 h-5 rounded border border-outline-variant cursor-pointer transition-transform hover:scale-105 ${
                        gradientEnd.toLowerCase() === hex.toLowerCase() ? 'ring-2 ring-primary ring-offset-1' : ''
                      }`}
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>

              {/* Angle Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] text-on-surface">
                  <span>Angle</span>
                  <span className="font-mono text-outline">{gradientAngle}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={5}
                  value={gradientAngle}
                  onChange={(e) => setGradientAngle(Number(e.target.value))}
                  className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
                />
              </div>
            </div>
          )}
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
          {/* Gradient Overlay */}
          <div className="flex flex-col gap-2.5 p-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-on-surface">Gradient Overlay</span>
                <span className="text-[11px] text-outline">Directional vignette for video depth & caption legibility</span>
              </div>
              <button
                type="button"
                onClick={() => setGradientOverlayEnabled(!gradientOverlayEnabled)}
                className={`relative w-9 h-5 rounded-full transition-colors duration-150 cursor-pointer shrink-0 ${
                  gradientOverlayEnabled ? 'bg-primary' : 'bg-outline-variant'
                }`}
                aria-pressed={gradientOverlayEnabled}
                aria-label="Toggle gradient overlay"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-150 ${
                    gradientOverlayEnabled ? 'translate-x-4' : ''
                  }`}
                />
              </button>
            </div>

            {gradientOverlayEnabled && (
              <div className="flex flex-col gap-3 pt-2 border-t border-outline-variant/30 mt-1">
                {/* Color */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-on-surface">Color</span>
                    <div className="flex items-center gap-1.5">
                      <label className="relative w-6 h-6 rounded overflow-hidden border border-outline-variant cursor-pointer shrink-0">
                        <input
                          type="color"
                          value={gradientOverlayColor}
                          onChange={(e) => setGradientOverlayColor(e.target.value)}
                          className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer border-0 p-0"
                        />
                      </label>
                      <input
                        type="text"
                        value={gradientOverlayColor}
                        onChange={(e) => setGradientOverlayColor(e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-mono uppercase border border-outline-variant/80 rounded bg-surface"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {GRADIENT_OVERLAY_SWATCHES.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setGradientOverlayColor(hex)}
                        className={`w-5 h-5 rounded border border-outline-variant cursor-pointer transition-transform hover:scale-105 ${
                          gradientOverlayColor.toLowerCase() === hex.toLowerCase() ? 'ring-2 ring-primary ring-offset-1' : ''
                        }`}
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                  </div>
                </div>

                {/* Direction */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-on-surface">Direction</span>
                  <select
                    value={gradientOverlayDirection}
                    onChange={(e) => setGradientOverlayDirection(e.target.value as GradientOverlayDirection)}
                    className="w-full text-xs p-1.5 rounded-md bg-surface-container-high border border-outline-variant/50 text-on-surface focus:outline-hidden focus:border-primary cursor-pointer"
                  >
                    {GRADIENT_OVERLAY_DIRECTIONS.map((dir) => (
                      <option key={dir.value} value={dir.value}>
                        {dir.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Opacity Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] text-on-surface">
                    <span>Opacity</span>
                    <span className="font-mono text-outline">{Math.round(gradientOverlayOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={gradientOverlayOpacity}
                    onChange={(e) => setGradientOverlayOpacity(Number(e.target.value))}
                    className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
                  />
                </div>

                {/* Strength Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] text-on-surface">
                    <span>Strength</span>
                    <span className="font-mono text-outline">{Math.round(gradientOverlayStrength * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={gradientOverlayStrength}
                    onChange={(e) => setGradientOverlayStrength(Number(e.target.value))}
                    className="w-full cursor-pointer accent-primary h-1.5 bg-surface-container-high rounded appearance-none"
                  />
                </div>
              </div>
            )}
          </div>

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

      <hr className="border-outline-variant/40" />

      {/* SECTION: Transition Overlays (Visual Assets) */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
            Transition Overlays
          </span>
          <span className="text-[11px] text-outline">Visual Bursts</span>
        </div>

        {/* Add Placement Card */}
        <div className="flex flex-col gap-2.5 p-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-on-surface">Select Transition</span>
            <select
              value={selectedTransitionId}
              onChange={(e) => setSelectedTransitionId(e.target.value)}
              className="w-full text-xs p-2 rounded-lg bg-surface-container-high border border-outline-variant/50 text-on-surface focus:outline-hidden focus:border-primary cursor-pointer"
            >
              {TRANSITION_OVERLAYS.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.label} ({asset.tags.join(', ')})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-outline">Start (sec)</span>
              <input
                type="number"
                min={0}
                max={totalDurationSec > 0 ? totalDurationSec : undefined}
                step="0.05"
                value={newTransitionStartSec}
                onChange={(e) => setNewTransitionStartSec(e.target.value)}
                className={`w-full text-xs p-1.5 rounded-md bg-surface-container-high border ${
                  !isTransStartValid && newTransitionStartSec !== '' ? 'border-error' : 'border-outline-variant/50'
                } text-on-surface`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-outline">Duration (sec)</span>
              <input
                type="number"
                min={0.05}
                max={totalDurationSec > 0 ? totalDurationSec : undefined}
                step="0.05"
                value={newTransitionDurationSec}
                onChange={(e) => setNewTransitionDurationSec(e.target.value)}
                className={`w-full text-xs p-1.5 rounded-md bg-surface-container-high border ${
                  !isTransDurValid && newTransitionDurationSec !== '' ? 'border-error' : 'border-outline-variant/50'
                } text-on-surface`}
              />
            </div>
          </div>
          {transValidationError && (
            <span className="text-[10px] text-error flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-xs">error</span>
              {transValidationError}
            </span>
          )}

          <button
            type="button"
            onClick={handleAddTransition}
            disabled={!!transValidationError}
            className={`w-full mt-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors ${
              transValidationError
                ? 'bg-surface-container-high text-outline cursor-not-allowed opacity-60'
                : 'bg-primary text-on-primary hover:bg-primary/90 cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Transition Placement
          </button>
        </div>

        {/* Placed Overlays List */}
        {transitionOverlays.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">
              Placed Transitions ({transitionOverlays.length})
            </span>
            {transitionOverlays.map((item) => {
              const asset = getAssetById(item.assetId);
              const startSec = framesToSec(item.startFrame);
              const durSec = framesToSec(item.durationInFrames);
              const endSec = framesToSec(item.startFrame + item.durationInFrames);
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 p-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-low"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-on-surface">{asset?.label ?? item.assetId}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-outline font-mono">
                        {startSec}s - {endSec}s
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTransitionOverlay(item.id)}
                      className="p-1 rounded text-outline hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                      title="Remove Overlay"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-outline">Start (sec)</span>
                      <input
                        type="number"
                        min={0}
                        max={totalDurationSec > 0 ? totalDurationSec : undefined}
                        step="0.05"
                        value={startSec}
                        onChange={(e) => {
                          const val = Math.max(0, parseFloat(e.target.value) || 0);
                          updateTransitionOverlay(item.id, { startFrame: secToFrames(val) });
                        }}
                        className="w-full text-xs p-1 rounded bg-surface-container-high border border-outline-variant/40 text-on-surface"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-outline">Duration (sec)</span>
                      <input
                        type="number"
                        min={0.05}
                        max={totalDurationSec > 0 ? totalDurationSec : undefined}
                        step="0.05"
                        value={durSec}
                        onChange={(e) => {
                          const val = Math.max(0.05, parseFloat(e.target.value) || 0.05);
                          updateTransitionOverlay(item.id, { durationInFrames: Math.max(1, secToFrames(val)) });
                        }}
                        className="w-full text-xs p-1 rounded bg-surface-container-high border border-outline-variant/40 text-on-surface"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5 text-[11px]">
                    <span className="text-outline">Opacity ({Math.round((item.opacity ?? 1) * 100)}%)</span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={item.opacity ?? 1}
                      onChange={(e) =>
                        updateTransitionOverlay(item.id, { opacity: parseFloat(e.target.value) })
                      }
                      className="w-full accent-primary h-1.5 bg-surface-container-high rounded appearance-none cursor-pointer mt-1"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <hr className="border-outline-variant/40" />

      {/* SECTION: Sound Effects (SFX Library) */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
            Sound Effects (SFX)
          </span>
          <span className="text-[11px] text-outline">{SOUND_EFFECTS.length} Audio Cues</span>
        </div>

        {/* Add SFX Card */}
        <div className="flex flex-col gap-2.5 p-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-on-surface">Select SFX</span>
            <div className="flex gap-1.5 items-center">
              <select
                value={selectedSfxId}
                onChange={(e) => setSelectedSfxId(e.target.value)}
                className="grow text-xs p-2 rounded-lg bg-surface-container-high border border-outline-variant/50 text-on-surface focus:outline-hidden focus:border-primary cursor-pointer"
              >
                {SOUND_EFFECTS.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    [{asset.category.toUpperCase()}] {asset.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const asset = getAssetById(selectedSfxId);
                  if (asset) handlePlayAudio(asset.path);
                }}
                className="p-2 rounded-lg bg-surface-container-high border border-outline-variant/50 hover:border-primary text-primary transition-colors cursor-pointer shrink-0"
                title="Play Audio Preview"
              >
                <span className="material-symbols-outlined text-base">volume_up</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-outline">Start (sec)</span>
            <input
              type="number"
              min={0}
              max={totalDurationSec > 0 ? totalDurationSec : undefined}
              step="0.05"
              value={newSfxStartSec}
              onChange={(e) => setNewSfxStartSec(e.target.value)}
              className={`w-full text-xs p-1.5 rounded-md bg-surface-container-high border ${
                !isSfxStartValid && newSfxStartSec !== '' ? 'border-error' : 'border-outline-variant/50'
              } text-on-surface`}
            />
          </div>
          {sfxValidationError && (
            <span className="text-[10px] text-error flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-xs">error</span>
              {sfxValidationError}
            </span>
          )}

          <button
            type="button"
            onClick={handleAddSfx}
            disabled={!!sfxValidationError}
            className={`w-full mt-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors ${
              sfxValidationError
                ? 'bg-surface-container-high text-outline cursor-not-allowed opacity-60'
                : 'bg-primary text-on-primary hover:bg-primary/90 cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Sound Effect
          </button>
        </div>

        {/* Placed SFX List */}
        {soundEffects.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">
              Placed SFX ({soundEffects.length})
            </span>
            {soundEffects.map((item) => {
              const asset = getAssetById(item.assetId);
              const startSec = framesToSec(item.startFrame);
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 p-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-low"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (asset) handlePlayAudio(asset.path);
                        }}
                        className="p-1 rounded text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                        title="Play Audio"
                      >
                        <span className="material-symbols-outlined text-sm">play_arrow</span>
                      </button>
                      <span className="text-xs font-semibold text-on-surface">{asset?.label ?? item.assetId}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-outline font-mono">
                        @ {startSec}s
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSoundEffect(item.id)}
                      className="p-1 rounded text-outline hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                      title="Remove SFX"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-outline">Start (sec)</span>
                      <input
                        type="number"
                        min={0}
                        max={totalDurationSec > 0 ? totalDurationSec : undefined}
                        step="0.05"
                        value={startSec}
                        onChange={(e) => {
                          const val = Math.max(0, parseFloat(e.target.value) || 0);
                          updateSoundEffect(item.id, { startFrame: secToFrames(val) });
                        }}
                        className="w-full text-xs p-1 rounded bg-surface-container-high border border-outline-variant/40 text-on-surface"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-outline">Volume ({Math.round((item.volume ?? 1) * 100)}%)</span>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={item.volume ?? 1}
                        onChange={(e) =>
                          updateSoundEffect(item.id, { volume: parseFloat(e.target.value) })
                        }
                        className="w-full accent-primary h-1.5 bg-surface-container-high rounded appearance-none cursor-pointer mt-2"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
