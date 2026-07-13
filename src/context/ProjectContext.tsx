import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Caption } from '@remotion/captions';
import { FONT_PRESETS, type FontPresetName } from '../captions/styles/presets';
import type { CaptionStyleOverrides, CaptionStyleVariant } from '../captions/styles/types';
import { DEFAULT_KEYWORDS } from '../captions/styles/applyKeywordEmphasis';
import type { OverlaySettings, ProgressBarPosition, WatermarkPosition } from '../overlay/types';

export type TranscribeStatus = 'idle' | 'uploading' | 'error';
export type VerticalAlign = 'flex-start' | 'center' | 'end';
export type HorizontalAlign = 'start' | 'center' | 'end';
export type SaveStatus = 'saved' | 'saving';

// Project identity + Style/Overlay tab settings persist to localStorage (not
// media/captions - those are Files/large arrays that don't belong in
// localStorage, so a reload still requires re-uploading). This is what makes
// the TopBar's "Saving..."/"Saved" indicator real instead of static text.
const STORAGE_KEY = 'caption-studio:project';
const SAVE_DEBOUNCE_MS = 600;

type PersistedState = {
  id: string;
  name: string;
  presetName: FontPresetName;
  animation: CaptionStyleVariant;
  keywordHighlightEnabled: boolean;
  highlightIntensity: number;
  highlightColor: string;
  keywords: string[];
  verticalAlign: VerticalAlign;
  horizontalAlign: HorizontalAlign;
  watermarkEnabled: boolean;
  watermarkOpacity: number;
  watermarkPosition: WatermarkPosition;
  progressBarEnabled: boolean;
  progressBarColor: string;
  progressBarPosition: ProgressBarPosition;
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

interface ProjectContextType {
  mediaFile: File | null;
  mediaUrl: string | null;
  srtFile: File | null;
  captions: Caption[] | null;
  transcribeStatus: TranscribeStatus;
  transcribeError: string | null;
  setSrtFile: (file: File | null) => void;
  transcribe: (mediaFile: File) => Promise<void>;
  reset: () => void;
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
  verticalAlign: VerticalAlign;
  setVerticalAlign: (align: VerticalAlign) => void;
  horizontalAlign: HorizontalAlign;
  setHorizontalAlign: (align: HorizontalAlign) => void;
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
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [srtFile, setSrtFile] = useState<File | null>(null);
  const [captions, setCaptions] = useState<Caption[] | null>(null);
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
  const [verticalAlign, setVerticalAlign] = useState<VerticalAlign>(persisted?.verticalAlign ?? 'center');
  const [horizontalAlign, setHorizontalAlign] = useState<HorizontalAlign>(persisted?.horizontalAlign ?? 'center');

  const preset = FONT_PRESETS.find((p) => p.name === presetName) ?? FONT_PRESETS[0];
  const styleVariant = animation;
  const styleOverrides: CaptionStyleOverrides = useMemo(
    () => ({
      fontFamily: preset.fontFamily,
      fontWeight: preset.fontWeight,
      fontStyle: preset.fontStyle,
      highlightColor,
      justifyContent: verticalAlign,
      alignItems: horizontalAlign,
      keywordHighlightEnabled,
      highlightIntensity,
      keywords,
    }),
    [preset, highlightColor, verticalAlign, horizontalAlign, keywordHighlightEnabled, highlightIntensity, keywords],
  );

  const [watermarkEnabled, setWatermarkEnabled] = useState(persisted?.watermarkEnabled ?? true);
  const [watermarkOpacity, setWatermarkOpacity] = useState(persisted?.watermarkOpacity ?? 40);
  const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>(persisted?.watermarkPosition ?? 'tr');
  const [progressBarEnabled, setProgressBarEnabled] = useState(persisted?.progressBarEnabled ?? true);
  const [progressBarColor, setProgressBarColor] = useState(persisted?.progressBarColor ?? '#0066ff');
  const [progressBarPosition, setProgressBarPosition] = useState<ProgressBarPosition>(
    persisted?.progressBarPosition ?? 'bottom',
  );

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
      verticalAlign,
      horizontalAlign,
      watermarkEnabled,
      watermarkOpacity,
      watermarkPosition,
      progressBarEnabled,
      progressBarColor,
      progressBarPosition,
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
    verticalAlign,
    horizontalAlign,
    watermarkEnabled,
    watermarkOpacity,
    watermarkPosition,
    progressBarEnabled,
    progressBarColor,
    progressBarPosition,
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

        const data: { captions: Caption[] } = await response.json();
        setCaptions(data.captions);
        setTranscribeStatus('idle');
      } catch (error) {
        setTranscribeStatus('error');
        setTranscribeError(error instanceof Error ? error.message : 'Transcription failed');
        throw error;
      }
    },
    [srtFile],
  );

  const reset = useCallback(() => {
    setMediaFile(null);
    setMediaUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setSrtFile(null);
    setCaptions(null);
    setTranscribeStatus('idle');
    setTranscribeError(null);
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        mediaFile,
        mediaUrl,
        srtFile,
        captions,
        transcribeStatus,
        transcribeError,
        setSrtFile,
        transcribe,
        reset,
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
        verticalAlign,
        setVerticalAlign,
        horizontalAlign,
        setHorizontalAlign,
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
