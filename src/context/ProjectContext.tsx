import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { parseSrt, type Caption } from '@remotion/captions';
import { ensureWordLevelCaptions } from '../captions/processCaptions';
import { FONT_PRESETS, type FontPresetName } from '../captions/styles/presets';
import type { CaptionAlignment, CaptionPosition, CaptionStyleOverrides, CaptionStyleVariant, CaptionTextTransform, WordTypographyOverride } from '../captions/styles/types';
import { DEFAULT_KEYWORDS } from '../captions/styles/applyKeywordEmphasis';
import type { OverlaySettings, ProgressBarPosition, WatermarkPosition } from '../overlay/types';
import type { CardAspectRatio, CardBackdrop, CardBorderStyle, CompositionLayout, FrameCardMode, FrameSettings, FrameVariant } from '../frames/types';
import type { OverlayIntensity, TextureOverlaySettings } from '../textures/types';
import type { CodeBlockPosition, CodeLanguage, MotionGraphicsSettings, TickerDirection, TickerPosition } from '../motion/types';

export type TranscribeStatus = 'idle' | 'uploading' | 'error';
export type SaveStatus = 'saved' | 'saving';

// Project identity + Style/Overlay tab settings persist to localStorage (not
// media/captions - those are Files/large arrays that don't belong in
// localStorage, so a reload still requires re-uploading). This is what makes
// the TopBar's "Saving..."/"Saved" indicator real instead of static text.
const STORAGE_KEY = 'caption-studio:project';
const SAVE_DEBOUNCE_MS = 600;

// Dev-workflow convenience only: the transcript itself is small JSON (unlike
// the media File it came from), so it's cheap to cache separately and
// restore on reload - skips re-uploading + re-running Whisper on every
// refresh while iterating on Style/Overlay/Export. Media never persists.
const TRANSCRIPT_STORAGE_KEY = 'caption-studio:cached-transcript';
// Per-frame RMS amplitude computed alongside the transcript (server/index.ts's
// computeAudioAmplitude) - cached the same way and for the same reason, so a
// page reload restores Audio-Reactive Pulse without re-uploading/re-transcribing.
const AUDIO_AMPLITUDE_STORAGE_KEY = 'caption-studio:cached-audio-amplitude';

type PersistedState = {
  id: string;
  name: string;
  presetName: FontPresetName;
  animation: CaptionStyleVariant;
  keywordHighlightEnabled: boolean;
  highlightIntensity: number;
  highlightColor: string;
  keywords: string[];
  position: CaptionPosition;
  captionPositionY?: number;
  textAlign?: CaptionAlignment;
  fontSizeMultiplier: number;
  textColor?: string;
  fontWeight?: number | null;
  strokeEnabled?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  shadowEnabled?: boolean;
  glowEnabled?: boolean;
  glowColor?: string;
  glowIntensity?: number;
  glowBlur?: number;
  glowOpacity?: number;
  gradientEnabled?: boolean;
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number;
  letterSpacing?: number;
  lineHeight?: number;
  textTransform?: CaptionTextTransform;
  wordOverrides?: Record<string, WordTypographyOverride>;

  watermarkEnabled: boolean;
  watermarkOpacity: number;
  watermarkPosition: WatermarkPosition;
  progressBarEnabled: boolean;
  progressBarColor: string;
  progressBarPosition: ProgressBarPosition;
  frameVariant: FrameVariant;
  frameBgColor: string;
  bezelRadiusMultiplier: number;
  layout?: CompositionLayout;
  cardMode?: FrameCardMode;
  customScale?: number;
  customAspectRatio?: CardAspectRatio;
  customPositionY?: number;
  customBorderRadius?: number;
  customBorderEnabled?: boolean;
  customBorderWidth?: number;
  customBorderColor?: string;
  customBorderStyle?: CardBorderStyle;
  customShadowEnabled?: boolean;
  customShadowBlur?: number;
  customShadowOpacity?: number;
  customBackdrop?: CardBackdrop;
  customBackdropColor?: string;
  customBackdropGradient?: string;
  splitGap?: number;
  splitTopFocalX?: number;
  splitTopFocalY?: number;
  splitBottomFocalX?: number;
  splitBottomFocalY?: number;
  splitLeftFocalX?: number;
  splitLeftFocalY?: number;
  splitRightFocalX?: number;
  splitRightFocalY?: number;
  filmDustEnabled: boolean;
  halationEnabled: boolean;
  halationIntensity: OverlayIntensity;
  gridEnabled: boolean;
  gridIntensity: OverlayIntensity;
  crtScanlinesEnabled: boolean;
  crtScanlinesIntensity: OverlayIntensity;
  halftoneEnabled: boolean;
  halftoneIntensity: OverlayIntensity;
  lightLeakEnabled: boolean;
  lightLeakIntensity: OverlayIntensity;
  chromaticAberrationEnabled: boolean;
  chromaticAberrationIntensity: OverlayIntensity;
  filmGrainEnabled: boolean;
  filmGrainIntensity: OverlayIntensity;
  audioPulseEnabled: boolean;
  audioPulseIntensity: OverlayIntensity;
  keywordPunchEnabled: boolean;
  keywordPunchIntensity: OverlayIntensity;
  codeBlockEnabled: boolean;
  codeBlockCode: string;
  codeBlockLanguage: CodeLanguage;
  codeBlockPosition: CodeBlockPosition;
  codeBlockLinesPerPage: number;
  numberCounterEnabled: boolean;
  numberCounterStart: number;
  numberCounterEnd: number;
  numberCounterPrefix: string;
  numberCounterSuffix: string;
  tickerEnabled: boolean;
  tickerText: string;
  tickerDirection: TickerDirection;
  tickerPosition: TickerPosition;
};

const generateId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const readPersistedState = (): PersistedState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch {
    return null;
  }
};

// Read once at module load (i.e. once per app load) rather than per-render.
const persisted = readPersistedState();

const readCachedTranscript = (): Caption[] | null => {
  try {
    const raw = localStorage.getItem(TRANSCRIPT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Caption[];
    return ensureWordLevelCaptions(parsed);
  } catch {
    return null;
  }
};

const cachedTranscript = readCachedTranscript();

const readCachedAudioAmplitude = (): number[] | null => {
  try {
    const raw = localStorage.getItem(AUDIO_AMPLITUDE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : null;
  } catch {
    return null;
  }
};

const cachedAudioAmplitude = readCachedAudioAmplitude();

interface ProjectContextType {
  mediaFile: File | null;
  mediaUrl: string | null;
  srtFile: File | null;
  captions: Caption[] | null;
  // Per-frame RMS amplitude (0-1, peak-normalized) computed server-side
  // during transcription - drives Audio-Reactive Pulse. Null until a
  // transcription completes (or a cached one restores it); read-only from
  // the UI's perspective, no setter exposed.
  audioAmplitude: number[] | null;
  transcribeStatus: TranscribeStatus;
  transcribeError: string | null;
  setMedia: (file: File) => void;
  setSrtFile: (file: File | null) => void;
  importSrt: (file: File) => Promise<void>;
  transcribe: (mediaFile?: File) => Promise<void>;
  // TranscriptEditor writes fixed-up word text straight back here (PLAN.md
  // Part H) - no separate edit-buffer state, ProjectContext.captions stays
  // the single source of truth the whole preview/export pipeline reads.
  updateCaptionText: (index: number, text: string) => void;
  reset: () => void;
  // Dev-workflow convenience: clears just the cached-transcript localStorage
  // entry (and the in-memory captions it restored), separate from clearing
  // the rest of the project's Style/Overlay settings.
  clearCachedTranscript: () => void;
  // Project identity - projectId is stable/real (not the old hardcoded
  // "CAP-2023-99X"-style strings), projectName is user-editable in the
  // TopBar and drives export filenames.
  projectId: string;
  projectName: string;
  setProjectName: (name: string) => void;
  saveStatus: SaveStatus;
  saveNow: () => void;
  // Style tab controls, lifted here (rather than kept StylePage-local) so
  // Export can read the same styleVariant/styleOverrides the preview shows.
  presetName: FontPresetName;
  setPresetName: (name: FontPresetName) => void;
  // Animation Style and Keyword Highlight are independent of each other and
  // of the font preset (PLAN.md Part F) - each gets its own state/setter.
  animation: CaptionStyleVariant;
  setAnimation: (animation: CaptionStyleVariant) => void;
  keywordHighlightEnabled: boolean;
  setKeywordHighlightEnabled: (enabled: boolean) => void;
  highlightIntensity: number;
  setHighlightIntensity: (intensity: number) => void;
  highlightColor: string;
  setHighlightColor: (color: string) => void;
  keywords: string[];
  setKeywords: (keywords: string[]) => void;
  position: CaptionPosition;
  setPosition: (position: CaptionPosition) => void;
  captionPositionY: number;
  setCaptionPositionY: (pos: number) => void;
  textAlign: CaptionAlignment;
  setTextAlign: (align: CaptionAlignment) => void;
  fontSizeMultiplier: number;
  setFontSizeMultiplier: (multiplier: number) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  fontWeight: number;
  setFontWeight: (weight: number | null) => void;
  strokeEnabled: boolean;
  setStrokeEnabled: (enabled: boolean) => void;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  shadowEnabled: boolean;
  setShadowEnabled: (enabled: boolean) => void;
  glowEnabled: boolean;
  setGlowEnabled: (enabled: boolean) => void;
  glowColor: string;
  setGlowColor: (color: string) => void;
  glowIntensity: number;
  setGlowIntensity: (intensity: number) => void;
  glowBlur: number;
  setGlowBlur: (blur: number) => void;
  glowOpacity: number;
  setGlowOpacity: (opacity: number) => void;
  gradientEnabled: boolean;
  setGradientEnabled: (enabled: boolean) => void;
  gradientStart: string;
  setGradientStart: (color: string) => void;
  gradientEnd: string;
  setGradientEnd: (color: string) => void;
  gradientAngle: number;
  setGradientAngle: (angle: number) => void;
  letterSpacing: number;
  setLetterSpacing: (val: number) => void;
  lineHeight: number;
  setLineHeight: (val: number) => void;
  textTransform: CaptionTextTransform;
  setTextTransform: (val: CaptionTextTransform) => void;
  wordOverrides: Record<string, WordTypographyOverride>;
  setWordOverride: (wordId: string, override: Partial<WordTypographyOverride>) => void;
  setMultipleWordOverrides: (wordIds: string[], override: Partial<WordTypographyOverride>) => void;
  resetWordOverrides: (wordIds: string[]) => void;
  clearAllWordOverrides: () => void;
  styleVariant: CaptionStyleVariant;
  styleOverrides: CaptionStyleOverrides;
  // Overlay tab controls, lifted the same way as the style controls above -
  // Export (and any other tab) reads the same overlaySettings the preview
  // shows, and it's what gets sent to the export render so watermark/progress
  // bar actually end up baked into the file, not just shown in the UI.
  watermarkEnabled: boolean;
  setWatermarkEnabled: (enabled: boolean) => void;
  watermarkOpacity: number;
  setWatermarkOpacity: (opacity: number) => void;
  watermarkPosition: WatermarkPosition;
  setWatermarkPosition: (position: WatermarkPosition) => void;
  progressBarEnabled: boolean;
  setProgressBarEnabled: (enabled: boolean) => void;
  progressBarColor: string;
  setProgressBarColor: (color: string) => void;
  progressBarPosition: ProgressBarPosition;
  setProgressBarPosition: (position: ProgressBarPosition) => void;
  overlaySettings: OverlaySettings;
  // Frame tab controls, lifted the same way as overlaySettings above - the
  // same frameSettings object drives the live PreviewPlayer on every tab and
  // gets baked into the real export render.
  frameVariant: FrameVariant;
  setFrameVariant: (variant: FrameVariant) => void;
  frameBgColor: string;
  setFrameBgColor: (color: string) => void;
  bezelRadiusMultiplier: number;
  setBezelRadiusMultiplier: (multiplier: number) => void;
  layout: CompositionLayout;
  setLayout: (layout: CompositionLayout) => void;
  cardMode: FrameCardMode;
  setCardMode: (mode: FrameCardMode) => void;
  customScale: number;
  setCustomScale: (scale: number) => void;
  customAspectRatio: CardAspectRatio;
  setCustomAspectRatio: (ratio: CardAspectRatio) => void;
  customPositionY: number;
  setCustomPositionY: (pos: number) => void;
  customBorderRadius: number;
  setCustomBorderRadius: (radius: number) => void;
  customBorderEnabled: boolean;
  setCustomBorderEnabled: (enabled: boolean) => void;
  customBorderWidth: number;
  setCustomBorderWidth: (width: number) => void;
  customBorderColor: string;
  setCustomBorderColor: (color: string) => void;
  customBorderStyle: CardBorderStyle;
  setCustomBorderStyle: (style: CardBorderStyle) => void;
  customShadowEnabled: boolean;
  setCustomShadowEnabled: (enabled: boolean) => void;
  customShadowBlur: number;
  setCustomShadowBlur: (blur: number) => void;
  customShadowOpacity: number;
  setCustomShadowOpacity: (opacity: number) => void;
  customBackdrop: CardBackdrop;
  setCustomBackdrop: (backdrop: CardBackdrop) => void;
  customBackdropColor: string;
  setCustomBackdropColor: (color: string) => void;
  customBackdropGradient: string;
  setCustomBackdropGradient: (gradient: string) => void;
  splitGap: number;
  setSplitGap: (gap: number) => void;
  splitTopFocalX: number;
  setSplitTopFocalX: (val: number) => void;
  splitTopFocalY: number;
  setSplitTopFocalY: (val: number) => void;
  splitBottomFocalX: number;
  setSplitBottomFocalX: (val: number) => void;
  splitBottomFocalY: number;
  setSplitBottomFocalY: (val: number) => void;
  splitLeftFocalX: number;
  setSplitLeftFocalX: (val: number) => void;
  splitLeftFocalY: number;
  setSplitLeftFocalY: (val: number) => void;
  splitRightFocalX: number;
  setSplitRightFocalX: (val: number) => void;
  splitRightFocalY: number;
  setSplitRightFocalY: (val: number) => void;
  frameSettings: FrameSettings;
  // Texture overlay tab controls, lifted the same way as frameSettings above
  // - each texture is independently toggleable (unlike Frame's single-select
  // variant) since reel-craft's textures are designed to combine.
  filmDustEnabled: boolean;
  setFilmDustEnabled: (enabled: boolean) => void;
  halationEnabled: boolean;
  setHalationEnabled: (enabled: boolean) => void;
  halationIntensity: OverlayIntensity;
  setHalationIntensity: (intensity: OverlayIntensity) => void;
  gridEnabled: boolean;
  setGridEnabled: (enabled: boolean) => void;
  gridIntensity: OverlayIntensity;
  setGridIntensity: (intensity: OverlayIntensity) => void;
  crtScanlinesEnabled: boolean;
  setCrtScanlinesEnabled: (enabled: boolean) => void;
  crtScanlinesIntensity: OverlayIntensity;
  setCrtScanlinesIntensity: (intensity: OverlayIntensity) => void;
  halftoneEnabled: boolean;
  setHalftoneEnabled: (enabled: boolean) => void;
  halftoneIntensity: OverlayIntensity;
  setHalftoneIntensity: (intensity: OverlayIntensity) => void;
  lightLeakEnabled: boolean;
  setLightLeakEnabled: (enabled: boolean) => void;
  lightLeakIntensity: OverlayIntensity;
  setLightLeakIntensity: (intensity: OverlayIntensity) => void;
  chromaticAberrationEnabled: boolean;
  setChromaticAberrationEnabled: (enabled: boolean) => void;
  chromaticAberrationIntensity: OverlayIntensity;
  setChromaticAberrationIntensity: (intensity: OverlayIntensity) => void;
  filmGrainEnabled: boolean;
  setFilmGrainEnabled: (enabled: boolean) => void;
  filmGrainIntensity: OverlayIntensity;
  setFilmGrainIntensity: (intensity: OverlayIntensity) => void;
  audioPulseEnabled: boolean;
  setAudioPulseEnabled: (enabled: boolean) => void;
  audioPulseIntensity: OverlayIntensity;
  setAudioPulseIntensity: (intensity: OverlayIntensity) => void;
  keywordPunchEnabled: boolean;
  setKeywordPunchEnabled: (enabled: boolean) => void;
  keywordPunchIntensity: OverlayIntensity;
  setKeywordPunchIntensity: (intensity: OverlayIntensity) => void;
  textureSettings: TextureOverlaySettings;
  // Motion graphics tab controls, lifted the same way as textureSettings
  // above - each graphic is independently toggleable and combines with the
  // others (Ticker/NumberCounter/CodeBlock), matching reel-craft's design.
  codeBlockEnabled: boolean;
  setCodeBlockEnabled: (enabled: boolean) => void;
  codeBlockCode: string;
  setCodeBlockCode: (code: string) => void;
  codeBlockLanguage: CodeLanguage;
  setCodeBlockLanguage: (language: CodeLanguage) => void;
  codeBlockPosition: CodeBlockPosition;
  setCodeBlockPosition: (position: CodeBlockPosition) => void;
  codeBlockLinesPerPage: number;
  setCodeBlockLinesPerPage: (linesPerPage: number) => void;
  numberCounterEnabled: boolean;
  setNumberCounterEnabled: (enabled: boolean) => void;
  numberCounterStart: number;
  setNumberCounterStart: (value: number) => void;
  numberCounterEnd: number;
  setNumberCounterEnd: (value: number) => void;
  numberCounterPrefix: string;
  setNumberCounterPrefix: (value: string) => void;
  numberCounterSuffix: string;
  setNumberCounterSuffix: (value: string) => void;
  tickerEnabled: boolean;
  setTickerEnabled: (enabled: boolean) => void;
  tickerText: string;
  setTickerText: (text: string) => void;
  tickerDirection: TickerDirection;
  setTickerDirection: (direction: TickerDirection) => void;
  tickerPosition: TickerPosition;
  setTickerPosition: (position: TickerPosition) => void;
  motionSettings: MotionGraphicsSettings;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [srtFile, setSrtFile] = useState<File | null>(null);
  const [captions, setCaptions] = useState<Caption[] | null>(cachedTranscript);
  const [audioAmplitude, setAudioAmplitude] = useState<number[] | null>(cachedAudioAmplitude);
  const [transcribeStatus, setTranscribeStatus] = useState<TranscribeStatus>('idle');
  const [transcribeError, setTranscribeError] = useState<string | null>(null);

  const [projectId] = useState(() => persisted?.id ?? generateId());
  const [projectName, setProjectName] = useState(persisted?.name ?? 'Untitled Project');

  const [customFontWeight, setCustomFontWeight] = useState<number | null>(persisted?.fontWeight ?? null);
  const [customLetterSpacing, setCustomLetterSpacing] = useState<number | null>(persisted?.letterSpacing ?? null);
  const [presetName, setPresetNameState] = useState<FontPresetName>(persisted?.presetName ?? 'Viral Hook');
  const setPresetName = useCallback((name: FontPresetName) => {
    setPresetNameState(name);
    setCustomFontWeight(null);
    setCustomLetterSpacing(null);
  }, []);
  // Defaults preserve the pre-refactor look (BOLD preset used to force
  // signature animation + always-on keyword glow) while making both
  // independently changeable from here on.
  const [animation, setAnimation] = useState<CaptionStyleVariant>(persisted?.animation ?? 'signature');
  const [keywordHighlightEnabled, setKeywordHighlightEnabled] = useState(
    persisted?.keywordHighlightEnabled ?? true,
  );
  const [highlightIntensity, setHighlightIntensity] = useState(persisted?.highlightIntensity ?? 0.4);
  const [highlightColor, setHighlightColor] = useState(persisted?.highlightColor ?? '#0066ff');
  const [keywords, setKeywords] = useState<string[]>(persisted?.keywords ?? DEFAULT_KEYWORDS);
  const [position, setPositionState] = useState<CaptionPosition>(persisted?.position ?? 'bottom');
  const [captionPositionY, setCaptionPositionY] = useState<number>(() => {
    if (persisted?.captionPositionY !== undefined) return persisted.captionPositionY;
    if (persisted?.position === 'top') return 0.15;
    if (persisted?.position === 'center' || persisted?.position === 'split-center') return 0.50;
    return 0.85;
  });
  const [textAlign, setTextAlign] = useState<CaptionAlignment>(persisted?.textAlign ?? 'center');

  const setPosition = useCallback((newPos: CaptionPosition) => {
    setPositionState(newPos);
    if (newPos === 'bottom') {
      setCaptionPositionY(0.85);
    } else if (newPos === 'center' || newPos === 'split-center') {
      setCaptionPositionY(0.50);
    } else if (newPos === 'top') {
      setCaptionPositionY(0.15);
    }
  }, []);

  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(persisted?.fontSizeMultiplier ?? 1);

  const [textColor, setTextColor] = useState<string>(persisted?.textColor ?? '#ffffff');
  const [strokeEnabled, setStrokeEnabled] = useState<boolean>(persisted?.strokeEnabled ?? false);
  const [strokeColor, setStrokeColor] = useState<string>(persisted?.strokeColor ?? '#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(persisted?.strokeWidth ?? 2);
  const [shadowEnabled, setShadowEnabled] = useState<boolean>(persisted?.shadowEnabled ?? true);
  const [glowEnabled, setGlowEnabled] = useState<boolean>(persisted?.glowEnabled ?? false);
  const [glowColor, setGlowColor] = useState<string>(persisted?.glowColor ?? '#0066ff');
  const [glowIntensity, setGlowIntensity] = useState<number>(persisted?.glowIntensity ?? 0.6);
  const [glowBlur, setGlowBlur] = useState<number>(persisted?.glowBlur ?? 12);
  const [glowOpacity, setGlowOpacity] = useState<number>(persisted?.glowOpacity ?? 0.8);
  const [gradientEnabled, setGradientEnabled] = useState<boolean>(persisted?.gradientEnabled ?? false);
  const [gradientStart, setGradientStart] = useState<string>(persisted?.gradientStart ?? '#FFFFFF');
  const [gradientEnd, setGradientEnd] = useState<string>(persisted?.gradientEnd ?? '#10B981');
  const [gradientAngle, setGradientAngle] = useState<number>(persisted?.gradientAngle ?? 90);
  const setLetterSpacing = useCallback((val: number) => {
    setCustomLetterSpacing(val);
  }, []);
  const [lineHeight, setLineHeight] = useState<number>(persisted?.lineHeight ?? 1.15);
  const [textTransform, setTextTransform] = useState<CaptionTextTransform>(persisted?.textTransform ?? 'none');
  const [wordOverrides, setWordOverrides] = useState<Record<string, WordTypographyOverride>>(
    persisted?.wordOverrides ?? {},
  );

  const setWordOverride = useCallback((wordId: string, override: Partial<WordTypographyOverride>) => {
    setWordOverrides((prev) => {
      const current = prev[wordId] ?? {};
      const updated = { ...current, ...override };
      const cleaned: WordTypographyOverride = {};
      if (updated.fontFamily) cleaned.fontFamily = updated.fontFamily;
      if (updated.fontStyle) cleaned.fontStyle = updated.fontStyle;
      if (updated.color) cleaned.color = updated.color;
      if (updated.fontSize !== undefined && updated.fontSize !== 1) cleaned.fontSize = updated.fontSize;
      if (updated.fontWeight) cleaned.fontWeight = updated.fontWeight;

      if (Object.keys(cleaned).length === 0) {
        const next = { ...prev };
        delete next[wordId];
        return next;
      }
      return { ...prev, [wordId]: cleaned };
    });
  }, []);

  const setMultipleWordOverrides = useCallback(
    (wordIds: string[], override: Partial<WordTypographyOverride>) => {
      setWordOverrides((prev) => {
        const next = { ...prev };
        for (const wordId of wordIds) {
          const current = next[wordId] ?? {};
          const updated = { ...current, ...override };
          const cleaned: WordTypographyOverride = {};
          if (updated.fontFamily) cleaned.fontFamily = updated.fontFamily;
          if (updated.fontStyle) cleaned.fontStyle = updated.fontStyle;
          if (updated.color) cleaned.color = updated.color;
          if (updated.fontSize !== undefined && updated.fontSize !== 1) cleaned.fontSize = updated.fontSize;
          if (updated.fontWeight) cleaned.fontWeight = updated.fontWeight;

          if (Object.keys(cleaned).length === 0) {
            delete next[wordId];
          } else {
            next[wordId] = cleaned;
          }
        }
        return next;
      });
    },
    [],
  );

  const resetWordOverrides = useCallback((wordIds: string[]) => {
    setWordOverrides((prev) => {
      const next = { ...prev };
      for (const wordId of wordIds) {
        delete next[wordId];
      }
      return next;
    });
  }, []);

  const clearAllWordOverrides = useCallback(() => {
    setWordOverrides({});
  }, []);

  const preset = FONT_PRESETS.find((p) => p.name === presetName) ?? FONT_PRESETS[0];

  const effectiveFontWeight = useMemo(() => {
    if (customFontWeight !== null && (preset.availableWeights as readonly number[]).includes(customFontWeight)) {
      return customFontWeight;
    }
    return preset.fontWeight;
  }, [customFontWeight, preset]);

  const effectiveLetterSpacing = useMemo(() => {
    if (customLetterSpacing !== null) {
      return customLetterSpacing;
    }
    return ('letterSpacing' in preset && typeof preset.letterSpacing === 'number') ? preset.letterSpacing : 0;
  }, [customLetterSpacing, preset]);

  const styleVariant = animation;
  const styleOverrides: CaptionStyleOverrides = useMemo(
    () => ({
      fontFamily: preset.fontFamily,
      fontWeight: effectiveFontWeight,
      fontStyle: preset.fontStyle,
      textColor,
      strokeEnabled,
      strokeColor,
      strokeWidth,
      shadowEnabled,
      glowEnabled,
      glowColor,
      glowIntensity,
      glowBlur,
      glowOpacity,
      gradientEnabled,
      gradientStart,
      gradientEnd,
      gradientAngle,
      letterSpacing: effectiveLetterSpacing,
      lineHeight,
      textTransform,
      highlightColor,
      position,
      customPositionY: captionPositionY,
      textAlign,
      keywordHighlightEnabled,
      highlightIntensity,
      keywords,
      fontSizeMultiplier,
      wordOverrides,
    }),
    [
      preset,
      effectiveFontWeight,
      textColor,
      strokeEnabled,
      strokeColor,
      strokeWidth,
      shadowEnabled,
      glowEnabled,
      glowColor,
      glowIntensity,
      glowBlur,
      glowOpacity,
      gradientEnabled,
      gradientStart,
      gradientEnd,
      gradientAngle,
      effectiveLetterSpacing,
      lineHeight,
      textTransform,
      highlightColor,
      position,
      captionPositionY,
      textAlign,
      keywordHighlightEnabled,
      highlightIntensity,
      keywords,
      fontSizeMultiplier,
      wordOverrides,
    ],
  );

  const [watermarkEnabled, setWatermarkEnabled] = useState(persisted?.watermarkEnabled ?? true);
  const [watermarkOpacity, setWatermarkOpacity] = useState(persisted?.watermarkOpacity ?? 40);
  const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>(persisted?.watermarkPosition ?? 'tr');
  const [progressBarEnabled, setProgressBarEnabled] = useState(persisted?.progressBarEnabled ?? true);
  const [progressBarColor, setProgressBarColor] = useState(persisted?.progressBarColor ?? '#0066ff');
  const [progressBarPosition, setProgressBarPosition] = useState<ProgressBarPosition>(
    persisted?.progressBarPosition ?? 'bottom',
  );

  const [frameVariant, setFrameVariant] = useState<FrameVariant>(persisted?.frameVariant ?? 'none');
  const [frameBgColor, setFrameBgColor] = useState(persisted?.frameBgColor ?? '#000000');
  const [bezelRadiusMultiplier, setBezelRadiusMultiplier] = useState(
    persisted?.bezelRadiusMultiplier ?? 1,
  );
  const [layout, setLayout] = useState<CompositionLayout>(persisted?.layout ?? 'floating-card');
  const [cardMode, setCardMode] = useState<FrameCardMode>(persisted?.cardMode ?? 'preset');
  const [customScale, setCustomScale] = useState<number>(persisted?.customScale ?? 0.85);
  const [customAspectRatio, setCustomAspectRatio] = useState<CardAspectRatio>(
    persisted?.customAspectRatio ?? '9:16',
  );
  const [customPositionY, setCustomPositionY] = useState<number>(persisted?.customPositionY ?? 0.5);
  const [customBorderRadius, setCustomBorderRadius] = useState<number>(persisted?.customBorderRadius ?? 24);
  const [customBorderEnabled, setCustomBorderEnabled] = useState<boolean>(
    persisted?.customBorderEnabled ?? false,
  );
  const [customBorderWidth, setCustomBorderWidth] = useState<number>(persisted?.customBorderWidth ?? 2);
  const [customBorderColor, setCustomBorderColor] = useState<string>(
    persisted?.customBorderColor ?? '#ffffff',
  );
  const [customBorderStyle, setCustomBorderStyle] = useState<CardBorderStyle>(
    persisted?.customBorderStyle ?? 'solid',
  );
  const [customShadowEnabled, setCustomShadowEnabled] = useState<boolean>(
    persisted?.customShadowEnabled ?? false,
  );
  const [customShadowBlur, setCustomShadowBlur] = useState<number>(persisted?.customShadowBlur ?? 24);
  const [customShadowOpacity, setCustomShadowOpacity] = useState<number>(
    persisted?.customShadowOpacity ?? 40,
  );
  const [customBackdrop, setCustomBackdrop] = useState<CardBackdrop>(persisted?.customBackdrop ?? 'none');
  const [customBackdropColor, setCustomBackdropColor] = useState<string>(
    persisted?.customBackdropColor ?? '#121214',
  );
  const [customBackdropGradient, setCustomBackdropGradient] = useState<string>(
    persisted?.customBackdropGradient ?? 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)',
  );
  const [splitGap, setSplitGap] = useState<number>(persisted?.splitGap ?? 0);
  const [splitTopFocalX, setSplitTopFocalX] = useState<number>(persisted?.splitTopFocalX ?? 0.5);
  const [splitTopFocalY, setSplitTopFocalY] = useState<number>(persisted?.splitTopFocalY ?? 0.25);
  const [splitBottomFocalX, setSplitBottomFocalX] = useState<number>(persisted?.splitBottomFocalX ?? 0.5);
  const [splitBottomFocalY, setSplitBottomFocalY] = useState<number>(persisted?.splitBottomFocalY ?? 0.75);
  const [splitLeftFocalX, setSplitLeftFocalX] = useState<number>(persisted?.splitLeftFocalX ?? 0.25);
  const [splitLeftFocalY, setSplitLeftFocalY] = useState<number>(persisted?.splitLeftFocalY ?? 0.5);
  const [splitRightFocalX, setSplitRightFocalX] = useState<number>(persisted?.splitRightFocalX ?? 0.75);
  const [splitRightFocalY, setSplitRightFocalY] = useState<number>(persisted?.splitRightFocalY ?? 0.5);

  const [filmDustEnabled, setFilmDustEnabled] = useState(persisted?.filmDustEnabled ?? false);
  const [halationEnabled, setHalationEnabled] = useState(persisted?.halationEnabled ?? false);
  const [halationIntensity, setHalationIntensity] = useState<OverlayIntensity>(
    persisted?.halationIntensity ?? 'medium',
  );
  const [gridEnabled, setGridEnabled] = useState(persisted?.gridEnabled ?? false);
  const [gridIntensity, setGridIntensity] = useState<OverlayIntensity>(persisted?.gridIntensity ?? 'medium');

  const [crtScanlinesEnabled, setCrtScanlinesEnabled] = useState(persisted?.crtScanlinesEnabled ?? false);
  const [crtScanlinesIntensity, setCrtScanlinesIntensity] = useState<OverlayIntensity>(
    persisted?.crtScanlinesIntensity ?? 'medium',
  );
  const [halftoneEnabled, setHalftoneEnabled] = useState(persisted?.halftoneEnabled ?? false);
  const [halftoneIntensity, setHalftoneIntensity] = useState<OverlayIntensity>(
    persisted?.halftoneIntensity ?? 'medium',
  );
  const [lightLeakEnabled, setLightLeakEnabled] = useState(persisted?.lightLeakEnabled ?? false);
  const [lightLeakIntensity, setLightLeakIntensity] = useState<OverlayIntensity>(
    persisted?.lightLeakIntensity ?? 'medium',
  );
  const [chromaticAberrationEnabled, setChromaticAberrationEnabled] = useState(
    persisted?.chromaticAberrationEnabled ?? false,
  );
  const [chromaticAberrationIntensity, setChromaticAberrationIntensity] = useState<OverlayIntensity>(
    persisted?.chromaticAberrationIntensity ?? 'medium',
  );
  const [filmGrainEnabled, setFilmGrainEnabled] = useState(persisted?.filmGrainEnabled ?? false);
  const [filmGrainIntensity, setFilmGrainIntensity] = useState<OverlayIntensity>(
    persisted?.filmGrainIntensity ?? 'medium',
  );
  const [audioPulseEnabled, setAudioPulseEnabled] = useState(persisted?.audioPulseEnabled ?? false);
  const [audioPulseIntensity, setAudioPulseIntensity] = useState<OverlayIntensity>(
    persisted?.audioPulseIntensity ?? 'medium',
  );
  const [keywordPunchEnabled, setKeywordPunchEnabled] = useState(persisted?.keywordPunchEnabled ?? false);
  const [keywordPunchIntensity, setKeywordPunchIntensity] = useState<OverlayIntensity>(
    persisted?.keywordPunchIntensity ?? 'medium',
  );

  const [codeBlockEnabled, setCodeBlockEnabled] = useState(persisted?.codeBlockEnabled ?? false);
  const [codeBlockCode, setCodeBlockCode] = useState(
    persisted?.codeBlockCode ?? 'def hello_world():\n    print("Hello, World!")',
  );
  const [codeBlockLanguage, setCodeBlockLanguage] = useState<CodeLanguage>(persisted?.codeBlockLanguage ?? 'python');
  const [codeBlockPosition, setCodeBlockPosition] = useState<CodeBlockPosition>(
    persisted?.codeBlockPosition ?? 'center',
  );
  const [codeBlockLinesPerPage, setCodeBlockLinesPerPage] = useState(persisted?.codeBlockLinesPerPage ?? 8);

  const [numberCounterEnabled, setNumberCounterEnabled] = useState(persisted?.numberCounterEnabled ?? false);
  const [numberCounterStart, setNumberCounterStart] = useState(persisted?.numberCounterStart ?? 0);
  const [numberCounterEnd, setNumberCounterEnd] = useState(persisted?.numberCounterEnd ?? 100);
  const [numberCounterPrefix, setNumberCounterPrefix] = useState(persisted?.numberCounterPrefix ?? '');
  const [numberCounterSuffix, setNumberCounterSuffix] = useState(persisted?.numberCounterSuffix ?? '');

  const [tickerEnabled, setTickerEnabled] = useState(persisted?.tickerEnabled ?? false);
  const [tickerText, setTickerText] = useState(persisted?.tickerText ?? 'Breaking News');
  const [tickerDirection, setTickerDirection] = useState<TickerDirection>(persisted?.tickerDirection ?? 'left');
  const [tickerPosition, setTickerPosition] = useState<TickerPosition>(persisted?.tickerPosition ?? 'bottom');

  const overlaySettings: OverlaySettings = useMemo(
    () => ({
      watermarkEnabled,
      watermarkOpacity,
      watermarkPosition,
      progressBarEnabled,
      progressBarColor,
      progressBarPosition,
    }),
    [watermarkEnabled, watermarkOpacity, watermarkPosition, progressBarEnabled, progressBarColor, progressBarPosition],
  );

  const frameSettings: FrameSettings = useMemo(
    () => ({
      layout,
      variant: frameVariant,
      bgColor: frameBgColor,
      bezelRadiusMultiplier,
      cardMode,
      customScale,
      customAspectRatio,
      customPositionY,
      customBorderRadius,
      customBorderEnabled,
      customBorderWidth,
      customBorderColor,
      customBorderStyle,
      customShadowEnabled,
      customShadowBlur,
      customShadowOpacity,
      customBackdrop,
      customBackdropColor,
      customBackdropGradient,
      splitGap,
      splitTopFocalX,
      splitTopFocalY,
      splitBottomFocalX,
      splitBottomFocalY,
      splitLeftFocalX,
      splitLeftFocalY,
      splitRightFocalX,
      splitRightFocalY,
    }),
    [
      layout,
      frameVariant,
      frameBgColor,
      bezelRadiusMultiplier,
      cardMode,
      customScale,
      customAspectRatio,
      customPositionY,
      customBorderRadius,
      customBorderEnabled,
      customBorderWidth,
      customBorderColor,
      customBorderStyle,
      customShadowEnabled,
      customShadowBlur,
      customShadowOpacity,
      customBackdrop,
      customBackdropColor,
      customBackdropGradient,
      splitGap,
      splitTopFocalX,
      splitTopFocalY,
      splitBottomFocalX,
      splitBottomFocalY,
      splitLeftFocalX,
      splitLeftFocalY,
      splitRightFocalX,
      splitRightFocalY,
    ],
  );

  const textureSettings: TextureOverlaySettings = useMemo(
    () => ({
      filmDustEnabled,
      halationEnabled,
      halationIntensity,
      gridEnabled,
      gridIntensity,
      crtScanlinesEnabled,
      crtScanlinesIntensity,
      halftoneEnabled,
      halftoneIntensity,
      lightLeakEnabled,
      lightLeakIntensity,
      chromaticAberrationEnabled,
      chromaticAberrationIntensity,
      filmGrainEnabled,
      filmGrainIntensity,
      audioPulseEnabled,
      audioPulseIntensity,
      keywordPunchEnabled,
      keywordPunchIntensity,
    }),
    [
      filmDustEnabled,
      halationEnabled,
      halationIntensity,
      gridEnabled,
      gridIntensity,
      crtScanlinesEnabled,
      crtScanlinesIntensity,
      halftoneEnabled,
      halftoneIntensity,
      lightLeakEnabled,
      lightLeakIntensity,
      chromaticAberrationEnabled,
      chromaticAberrationIntensity,
      filmGrainEnabled,
      filmGrainIntensity,
      audioPulseEnabled,
      audioPulseIntensity,
      keywordPunchEnabled,
      keywordPunchIntensity,
    ],
  );

  const motionSettings: MotionGraphicsSettings = useMemo(
    () => ({
      codeBlockEnabled,
      codeBlockCode,
      codeBlockLanguage,
      codeBlockPosition,
      codeBlockLinesPerPage,
      numberCounterEnabled,
      numberCounterStart,
      numberCounterEnd,
      numberCounterPrefix,
      numberCounterSuffix,
      tickerEnabled,
      tickerText,
      tickerDirection,
      tickerPosition,
    }),
    [
      codeBlockEnabled,
      codeBlockCode,
      codeBlockLanguage,
      codeBlockPosition,
      codeBlockLinesPerPage,
      numberCounterEnabled,
      numberCounterStart,
      numberCounterEnd,
      numberCounterPrefix,
      numberCounterSuffix,
      tickerEnabled,
      tickerText,
      tickerDirection,
      tickerPosition,
    ],
  );

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const writeToStorage = useCallback(() => {
    const state: PersistedState = {
      id: projectId,
      name: projectName,
      presetName,
      animation,
      keywordHighlightEnabled,
      highlightIntensity,
      highlightColor,
      keywords,
      position,
      captionPositionY,
      textAlign,
      fontSizeMultiplier,
      textColor,
      fontWeight: customFontWeight,
      strokeEnabled,
      strokeColor,
      strokeWidth,
      shadowEnabled,
      glowEnabled,
      glowColor,
      glowIntensity,
      glowBlur,
      glowOpacity,
      gradientEnabled,
      gradientStart,
      gradientEnd,
      gradientAngle,
      letterSpacing: effectiveLetterSpacing,
      lineHeight,
      textTransform,
      wordOverrides,
      watermarkEnabled,
      watermarkOpacity,
      watermarkPosition,
      progressBarEnabled,
      progressBarColor,
      progressBarPosition,
      frameVariant,
      frameBgColor,
      bezelRadiusMultiplier,
      layout,
      cardMode,
      customScale,
      customAspectRatio,
      customPositionY,
      customBorderRadius,
      customBorderEnabled,
      customBorderWidth,
      customBorderColor,
      customBorderStyle,
      customShadowEnabled,
      customShadowBlur,
      customShadowOpacity,
      customBackdrop,
      customBackdropColor,
      customBackdropGradient,
      splitGap,
      splitTopFocalX,
      splitTopFocalY,
      splitBottomFocalX,
      splitBottomFocalY,
      splitLeftFocalX,
      splitLeftFocalY,
      splitRightFocalX,
      splitRightFocalY,
      filmDustEnabled,
      halationEnabled,
      halationIntensity,
      gridEnabled,
      gridIntensity,
      crtScanlinesEnabled,
      crtScanlinesIntensity,
      halftoneEnabled,
      halftoneIntensity,
      lightLeakEnabled,
      lightLeakIntensity,
      chromaticAberrationEnabled,
      chromaticAberrationIntensity,
      filmGrainEnabled,
      filmGrainIntensity,
      audioPulseEnabled,
      audioPulseIntensity,
      keywordPunchEnabled,
      keywordPunchIntensity,
      codeBlockEnabled,
      codeBlockCode,
      codeBlockLanguage,
      codeBlockPosition,
      codeBlockLinesPerPage,
      numberCounterEnabled,
      numberCounterStart,
      numberCounterEnd,
      numberCounterPrefix,
      numberCounterSuffix,
      tickerEnabled,
      tickerText,
      tickerDirection,
      tickerPosition,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setSaveStatus('saved');
  }, [
    projectId,
    projectName,
    presetName,
    animation,
    keywordHighlightEnabled,
    highlightIntensity,
    highlightColor,
    keywords,
    position,
    captionPositionY,
    textAlign,
    fontSizeMultiplier,
    textColor,
    customFontWeight,
    strokeEnabled,
    strokeColor,
    strokeWidth,
    shadowEnabled,
    glowEnabled,
    glowColor,
    glowIntensity,
    glowBlur,
    glowOpacity,
    gradientEnabled,
    gradientStart,
    gradientEnd,
    gradientAngle,
    effectiveLetterSpacing,
    lineHeight,
    textTransform,
    wordOverrides,
    watermarkEnabled,
    watermarkOpacity,
    watermarkPosition,
    progressBarEnabled,
    progressBarColor,
    progressBarPosition,
    frameVariant,
    frameBgColor,
    bezelRadiusMultiplier,
    cardMode,
    customScale,
    customAspectRatio,
    customPositionY,
    customBorderRadius,
    customBorderEnabled,
    customBorderWidth,
    customBorderColor,
    customBorderStyle,
    customShadowEnabled,
    customShadowBlur,
    customShadowOpacity,
    customBackdrop,
    customBackdropColor,
    customBackdropGradient,
    filmDustEnabled,
    halationEnabled,
    halationIntensity,
    gridEnabled,
    gridIntensity,
    crtScanlinesEnabled,
    crtScanlinesIntensity,
    halftoneEnabled,
    halftoneIntensity,
    lightLeakEnabled,
    lightLeakIntensity,
    chromaticAberrationEnabled,
    chromaticAberrationIntensity,
    filmGrainEnabled,
    filmGrainIntensity,
    audioPulseEnabled,
    audioPulseIntensity,
    keywordPunchEnabled,
    keywordPunchIntensity,
    codeBlockEnabled,
    codeBlockCode,
    codeBlockLanguage,
    codeBlockPosition,
    codeBlockLinesPerPage,
    numberCounterEnabled,
    numberCounterStart,
    numberCounterEnd,
    numberCounterPrefix,
    numberCounterSuffix,
    tickerEnabled,
    tickerText,
    tickerDirection,
    tickerPosition,
  ]);

  // Debounced autosave: "Saving..." is shown for real while a write is
  // pending, not simulated - it reflects genuinely unsaved changes.
  useEffect(() => {
    setSaveStatus('saving');
    saveTimeoutRef.current = setTimeout(writeToStorage, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [writeToStorage]);

  const saveNow = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    writeToStorage();
  }, [writeToStorage]);

  const setMedia = useCallback((file: File) => {
    setMediaFile(file);
    setMediaUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  const importSrt = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const { captions: parsedCaptions } = parseSrt({ input: text });
      const wordLevelCaptions = ensureWordLevelCaptions(parsedCaptions);
      setSrtFile(file);
      setCaptions(wordLevelCaptions);
      localStorage.setItem(TRANSCRIPT_STORAGE_KEY, JSON.stringify(wordLevelCaptions));
    } catch (error) {
      console.error('Failed to parse SRT:', error);
      throw error instanceof Error ? error : new Error('Failed to parse SRT file');
    }
  }, []);

  const transcribe = useCallback(
    async (file?: File) => {
      const targetFile = file ?? mediaFile;
      if (!targetFile) {
        throw new Error('No media file selected for transcription');
      }

      setTranscribeStatus('uploading');
      setTranscribeError(null);
      if (file) {
        setMediaFile(file);
        setMediaUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(file);
        });
      }

      const formData = new FormData();
      formData.append('audio', targetFile);
      if (srtFile) {
        formData.append('srt', srtFile);
      }

      try {
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? `Transcription failed (${response.status})`);
        }

        const data: { captions: Caption[]; audioAmplitude?: number[] } = await response.json();
        setCaptions(data.captions);
        localStorage.setItem(TRANSCRIPT_STORAGE_KEY, JSON.stringify(data.captions));
        setAudioAmplitude(data.audioAmplitude ?? null);
        if (data.audioAmplitude) {
          localStorage.setItem(AUDIO_AMPLITUDE_STORAGE_KEY, JSON.stringify(data.audioAmplitude));
        } else {
          localStorage.removeItem(AUDIO_AMPLITUDE_STORAGE_KEY);
        }
        setTranscribeStatus('idle');
      } catch (error) {
        setTranscribeStatus('error');
        setTranscribeError(error instanceof Error ? error.message : 'Transcription failed');
        throw error;
      }
    },
    [mediaFile, srtFile],
  );

  // Preserves each token's existing leading-space convention (every word but
  // the first, plus non-punctuation tokens, carries a leading space - see
  // server/index.ts's alignWordingWithScript) rather than re-deriving it, so
  // an edited word still concatenates correctly in processCaptions/
  // createTikTokStyleCaptions without needing punctuation-position logic here.
  const updateCaptionText = useCallback((index: number, rawText: string) => {
    setCaptions((prev) => {
      if (!prev || !prev[index]) return prev;
      const hadLeadingSpace = prev[index].text.startsWith(' ');
      const trimmed = rawText.trim();
      const nextText = hadLeadingSpace ? ` ${trimmed}` : trimmed;
      const next = [...prev];
      next[index] = { ...next[index], text: nextText };
      localStorage.setItem(TRANSCRIPT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setMediaFile(null);
    setMediaUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setSrtFile(null);
    setCaptions(null);
    setAudioAmplitude(null);
    setTranscribeStatus('idle');
    setTranscribeError(null);
  }, []);

  const clearCachedTranscript = useCallback(() => {
    localStorage.removeItem(TRANSCRIPT_STORAGE_KEY);
    localStorage.removeItem(AUDIO_AMPLITUDE_STORAGE_KEY);
    setCaptions(null);
    setAudioAmplitude(null);
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        mediaFile,
        mediaUrl,
        srtFile,
        captions,
        audioAmplitude,
        transcribeStatus,
        transcribeError,
        setMedia,
        setSrtFile,
        importSrt,
        transcribe,
        updateCaptionText,
        reset,
        clearCachedTranscript,
        projectId,
        projectName,
        setProjectName,
        saveStatus,
        saveNow,
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
        captionPositionY,
        setCaptionPositionY,
        textAlign,
        setTextAlign,
        fontSizeMultiplier,
        setFontSizeMultiplier,
        textColor,
        setTextColor,
        fontWeight: effectiveFontWeight,
        setFontWeight: setCustomFontWeight,
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
        letterSpacing: effectiveLetterSpacing,
        setLetterSpacing,
        lineHeight,
        setLineHeight,
        textTransform,
        setTextTransform,
        wordOverrides,
        setWordOverride,
        setMultipleWordOverrides,
        resetWordOverrides,
        clearAllWordOverrides,
        styleVariant,
        styleOverrides,
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
        overlaySettings,
        frameVariant,
        setFrameVariant,
        frameBgColor,
        setFrameBgColor,
        bezelRadiusMultiplier,
        setBezelRadiusMultiplier,
        layout,
        setLayout,
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
        frameSettings,
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
        chromaticAberrationEnabled,
        setChromaticAberrationEnabled,
        chromaticAberrationIntensity,
        setChromaticAberrationIntensity,
        filmGrainEnabled,
        setFilmGrainEnabled,
        filmGrainIntensity,
        setFilmGrainIntensity,
        audioPulseEnabled,
        setAudioPulseEnabled,
        audioPulseIntensity,
        setAudioPulseIntensity,
        keywordPunchEnabled,
        setKeywordPunchEnabled,
        keywordPunchIntensity,
        setKeywordPunchIntensity,
        textureSettings,
        codeBlockEnabled,
        setCodeBlockEnabled,
        codeBlockCode,
        setCodeBlockCode,
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
        motionSettings,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
