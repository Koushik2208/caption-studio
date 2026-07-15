import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Caption } from '@remotion/captions';
import { FONT_PRESETS, type FontPresetName } from '../captions/styles/presets';
import type { CaptionPosition, CaptionStyleOverrides, CaptionStyleVariant } from '../captions/styles/types';
import { DEFAULT_KEYWORDS } from '../captions/styles/applyKeywordEmphasis';
import type { OverlaySettings, ProgressBarPosition, WatermarkPosition } from '../overlay/types';
import type { FrameSettings, FrameVariant } from '../frames/types';
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
  fontSizeMultiplier: number;
  watermarkEnabled: boolean;
  watermarkOpacity: number;
  watermarkPosition: WatermarkPosition;
  progressBarEnabled: boolean;
  progressBarColor: string;
  progressBarPosition: ProgressBarPosition;
  frameVariant: FrameVariant;
  frameBgColor: string;
  bezelRadiusMultiplier: number;
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
    return raw ? (JSON.parse(raw) as Caption[]) : null;
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
  setSrtFile: (file: File | null) => void;
  transcribe: (mediaFile: File) => Promise<void>;
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
  // Multiplies the computed responsive font size (getResponsiveFontSize) -
  // default 1.0, user-adjustable slider for when the computed default still
  // feels off for a particular video.
  fontSizeMultiplier: number;
  setFontSizeMultiplier: (multiplier: number) => void;
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

  const [presetName, setPresetName] = useState<FontPresetName>(persisted?.presetName ?? 'Viral Hook');
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
  const [position, setPosition] = useState<CaptionPosition>(persisted?.position ?? 'center');
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(persisted?.fontSizeMultiplier ?? 1);

  const preset = FONT_PRESETS.find((p) => p.name === presetName) ?? FONT_PRESETS[0];
  const styleVariant = animation;
  const styleOverrides: CaptionStyleOverrides = useMemo(
    () => ({
      fontFamily: preset.fontFamily,
      fontWeight: preset.fontWeight,
      fontStyle: preset.fontStyle,
      highlightColor,
      position,
      keywordHighlightEnabled,
      highlightIntensity,
      keywords,
      fontSizeMultiplier,
    }),
    [preset, highlightColor, position, keywordHighlightEnabled, highlightIntensity, keywords, fontSizeMultiplier],
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
    () => ({ variant: frameVariant, bgColor: frameBgColor, bezelRadiusMultiplier }),
    [frameVariant, frameBgColor, bezelRadiusMultiplier],
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
      fontSizeMultiplier,
      watermarkEnabled,
      watermarkOpacity,
      watermarkPosition,
      progressBarEnabled,
      progressBarColor,
      progressBarPosition,
      frameVariant,
      frameBgColor,
      bezelRadiusMultiplier,
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
    fontSizeMultiplier,
    watermarkEnabled,
    watermarkOpacity,
    watermarkPosition,
    progressBarEnabled,
    progressBarColor,
    progressBarPosition,
    frameVariant,
    frameBgColor,
    bezelRadiusMultiplier,
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

  const transcribe = useCallback(
    async (file: File) => {
      setTranscribeStatus('uploading');
      setTranscribeError(null);
      setMediaFile(file);
      setMediaUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });

      const formData = new FormData();
      formData.append('audio', file);
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
    [srtFile],
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
        setSrtFile,
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
        fontSizeMultiplier,
        setFontSizeMultiplier,
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
