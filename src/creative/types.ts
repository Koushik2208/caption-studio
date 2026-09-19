import type { Caption } from '@remotion/captions';
import type {
  CaptionAlignment,
  CaptionPosition,
  CaptionStyleOverrides,
  CaptionStyleVariant,
  CaptionTextTransform,
  WordTypographyOverride,
} from '../captions/styles/types.js';
import type { FontPresetName } from '../captions/styles/presets.js';
import type {
  CardAspectRatio,
  CardBackdrop,
  CardBorderStyle,
  CompositionLayout,
  FrameCardMode,
  FrameSettings,
  FrameVariant,
} from '../frames/types.js';
import type { GradientOverlayDirection, OverlayIntensity, TextureOverlaySettings } from '../textures/types.js';
import type { OverlaySettings, ProgressBarPosition, WatermarkPosition } from '../overlay/types.js';
import type { CodeBlockPosition, CodeLanguage, MotionGraphicsSettings, TickerDirection, TickerPosition } from '../motion/types.js';
import type {
  VideoMotionSettings,
} from '../videoMotion/types.js';
import type { AssetSettings, SoundEffectPlacement, TransitionOverlayPlacement } from '../assets/types.js';

// ============================================================================
// 1. INPUT MODES
// ============================================================================

export type CreativeInputMode = 'idea' | 'srt' | 'transcript' | 'text';

export type CreativeInputIdea = {
  mode: 'idea';
  text: string;
  sourceLanguage?: string;
  outputLanguage?: string;
  [key: string]: unknown;
};

export type CreativeInputSrt = {
  mode: 'srt';
  rawSrt?: string;
  text?: string;
  fileName?: string;
  sourceLanguage?: string;
  outputLanguage?: string;
  [key: string]: unknown;
};

export type CreativeInputTranscriptEntry = {
  text: string;
  startMs: number;
  endMs: number;
  confidence?: number | null;
  [key: string]: unknown;
};

export type CreativeInputTranscript = {
  mode: 'transcript';
  entries?: CreativeInputTranscriptEntry[];
  text?: string;
  sourceLanguage?: string;
  outputLanguage?: string;
  [key: string]: unknown;
};

export type CreativeInputText = {
  mode: 'text';
  rawText?: string;
  text?: string;
  sourceLanguage?: string;
  outputLanguage?: string;
  [key: string]: unknown;
};

export type CreativeInput =
  | CreativeInputIdea
  | CreativeInputSrt
  | CreativeInputTranscript
  | CreativeInputText;

// ============================================================================
// 2. CONTENT & CREATIVE INTENT
// ============================================================================

export type CreativeContent = {
  text?: string;
  transcript?: Caption[];
  language?: string;
  summary?: string;
  keywords?: string[];
  [key: string]: unknown;
};

export type CreativeIntent = {
  contentType?: string; // e.g. 'educational' | 'storytelling' | 'commentary' | 'marketing' | 'entertainment'
  tone?: string;        // e.g. 'punchy' | 'authoritative' | 'casual' | 'humorous' | 'dramatic' | 'minimal'
  energy?: string;      // e.g. 'high' | 'medium' | 'calm' | 'explosive'
  pacing?: string;      // e.g. 'fast' | 'moderate' | 'deliberate'
  visualStyle?: string; // e.g. 'modern_bold' | 'minimal_clean' | 'cinematic_dark' | 'retro_tech'
  [key: string]: unknown;
};

// ============================================================================
// 3. ASSET & PLACEMENT REFERENCES
// ============================================================================

export type CreativeTransitionPlacement = {
  id?: string;
  assetId: string; // Registered transition asset ID: 'film_burn' | 'flash'
  startFrame: number;
  durationInFrames: number;
  opacity?: number; // 0.0 to 1.0 (default: 1.0)
  [key: string]: unknown;
};

export type CreativeSfxPlacement = {
  id?: string;
  assetId: string; // Registered SFX asset ID (e.g. 'impact', 'vine_boom', etc.)
  startFrame: number;
  volume?: number; // 0.0 to 1.0 (default: 0.8)
  [key: string]: unknown;
};

export type CreativeMediaRef = {
  assetId: string; // Stable media asset ID (e.g. 'video_main')
  zone?: 'main' | 'top' | 'bottom' | 'left' | 'right' | string;
  [key: string]: unknown;
};

export type CreativeMediaAsset = {
  id: string;
  type: 'video' | 'audio' | 'image';
  name?: string;
  src?: string;
  durationInFrames?: number;
  [key: string]: unknown;
};

export type CreativeAssetReferences = {
  media?: CreativeMediaAsset[];
  transitions?: string[]; // Referenced transition asset IDs
  sfx?: string[];         // Referenced sound effect asset IDs
  [key: string]: unknown;
};

// ============================================================================
// 4. BEAT SPECIFICATION
// ============================================================================

export type SemanticBeatRole =
  | 'hook'
  | 'question'
  | 'setup'
  | 'explanation'
  | 'statistic'
  | 'reveal'
  | 'core_point'
  | 'example'
  | 'twist'
  | 'payoff'
  | 'call_to_action'
  | 'outro'
  | 'conclusion'
  | string;

export type CreativeBeatWord = {
  text: string;
  startMs: number;
  endMs: number;
  confidence?: number | null;
  [key: string]: unknown;
};

export type CreativeBeatContent = {
  text: string;
  captions?: Caption[];
  words?: CreativeBeatWord[];
  srtIndices?: number[];
  [key: string]: unknown;
};

export type CreativeTypographySettings = {
  presetName?: FontPresetName;
  fontFamily?: string;
  fontWeight?: number | null;
  fontStyle?: 'normal' | 'italic';
  fontSizeMultiplier?: number;
  textColor?: string;
  position?: CaptionPosition;
  captionPositionY?: number;
  textAlign?: CaptionAlignment;
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
  backdropEnabled?: boolean;
  backdropColor?: string;
  backdropOpacity?: number;
  backdropRadius?: number;
  backdropPaddingX?: number;
  backdropPaddingY?: number;
  keywordHighlightEnabled?: boolean;
  highlightIntensity?: number;
  highlightColor?: string;
  keywords?: string[];
  wordOverrides?: Record<string, WordTypographyOverride>;
};

export type CreativeBeatVisual = {
  typography?: Partial<CreativeTypographySettings>;
  animation?: CaptionStyleVariant;
  effects?: Partial<TextureOverlaySettings>;
  composition?: Partial<FrameSettings>;
  videoMotion?: Partial<VideoMotionSettings>;
  overlay?: Partial<OverlaySettings>;
  [key: string]: unknown;
};

export type CreativeBeat = {
  id: string;
  type: SemanticBeatRole;
  startFrame: number;
  endFrame: number;
  content: CreativeBeatContent;
  visual?: CreativeBeatVisual;
  transition?: CreativeTransitionPlacement;
  sfx?: CreativeSfxPlacement | CreativeSfxPlacement[];
  media?: CreativeMediaRef;
  [key: string]: unknown;
};

// ============================================================================
// 5. GLOBAL SETTINGS
// ============================================================================

export type CreativeGlobalSettings = {
  typography: CreativeTypographySettings;
  animation: CaptionStyleVariant;
  effects: TextureOverlaySettings;
  composition: FrameSettings;
  overlay: OverlaySettings;
  motion: MotionGraphicsSettings;
  videoMotion: VideoMotionSettings;
  [key: string]: unknown;
};

// ============================================================================
// 6. CREATIVE PROJECT ROOT (CREATIVE JSON)
// ============================================================================

export type CreativeProject = {
  version: number;
  id: string;
  name: string;
  fps: number;
  durationInFrames: number;
  input: CreativeInput;
  content?: CreativeContent;
  creativeIntent?: CreativeIntent;
  beats: CreativeBeat[];
  globalSettings: CreativeGlobalSettings;
  assets?: CreativeAssetReferences;
  [key: string]: unknown;
};

export type MediaResolutionResult =
  | { action: 'preserve'; reason: string; matchedAsset?: CreativeMediaAsset }
  | { action: 'clear'; reason: string; requiredAssetName?: string }
  | { action: 'none'; reason: string };

// ============================================================================
// 7. CONVERTED STATE INTERFACE FOR PROJECTCONTEXT INTEGRATION
// ============================================================================

export type ProjectStateExportInput = {
  projectId: string;
  projectName: string;
  mediaFileName?: string | null;
  durationInFrames?: number;
  captions: Caption[] | null;
  audioAmplitude?: number[] | null;
  presetName: FontPresetName;
  animation: CaptionStyleVariant;
  keywordHighlightEnabled: boolean;
  highlightIntensity: number;
  highlightColor: string;
  keywords: string[];
  position: CaptionPosition;
  captionPositionY: number;
  textAlign: CaptionAlignment;
  fontSizeMultiplier: number;
  textColor: string;
  fontWeight: number | null;
  strokeEnabled: boolean;
  strokeColor: string;
  strokeWidth: number;
  shadowEnabled: boolean;
  glowEnabled: boolean;
  glowColor: string;
  glowIntensity: number;
  glowBlur: number;
  glowOpacity: number;
  gradientEnabled: boolean;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  letterSpacing: number;
  lineHeight: number;
  textTransform: CaptionTextTransform;
  backdropEnabled: boolean;
  backdropColor: string;
  backdropOpacity: number;
  backdropRadius: number;
  backdropPaddingX: number;
  backdropPaddingY: number;
  wordOverrides: Record<string, WordTypographyOverride>;
  watermarkEnabled: boolean;
  watermarkOpacity: number;
  watermarkPosition: WatermarkPosition;
  watermarkSize?: number;
  watermarkAssetId?: string;
  watermarkFilename?: string;
  watermarkUrl?: string;
  progressBarEnabled: boolean;
  progressBarColor: string;
  progressBarPosition: ProgressBarPosition;
  frameVariant: FrameVariant;
  frameBgColor: string;
  bezelRadiusMultiplier: number;
  layout: CompositionLayout;
  cardMode: FrameCardMode;
  customScale: number;
  customAspectRatio: CardAspectRatio;
  customPositionY: number;
  customBorderRadius: number;
  customBorderEnabled: boolean;
  customBorderWidth: number;
  customBorderColor: string;
  customBorderStyle: CardBorderStyle;
  customShadowEnabled: boolean;
  customShadowBlur: number;
  customShadowOpacity: number;
  customBackdrop: CardBackdrop;
  customBackdropColor: string;
  customBackdropGradient: string;
  splitGap: number;
  splitTopFocalX: number;
  splitTopFocalY: number;
  splitBottomFocalX: number;
  splitBottomFocalY: number;
  splitLeftFocalX: number;
  splitLeftFocalY: number;
  splitRightFocalX: number;
  splitRightFocalY: number;
  gradientOverlayEnabled?: boolean;
  gradientOverlayColor?: string;
  gradientOverlayOpacity?: number;
  gradientOverlayStrength?: number;
  gradientOverlayDirection?: GradientOverlayDirection;
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
  videoMotion: VideoMotionSettings;
  transitionOverlays: TransitionOverlayPlacement[];
  soundEffects: SoundEffectPlacement[];
};

export type ConvertedProjectState = {
  projectId: string;
  projectName: string;
  captions: Caption[];
  styleVariant: CaptionStyleVariant;
  styleOverrides: CaptionStyleOverrides;
  overlaySettings: OverlaySettings;
  frameSettings: FrameSettings;
  textureSettings: TextureOverlaySettings;
  motionSettings: MotionGraphicsSettings;
  videoMotion: VideoMotionSettings;
  assetSettings: AssetSettings;
  durationInFrames: number;
  // Raw fields suitable for setting in ProjectContext
  rawSettings: Partial<ProjectStateExportInput>;
};
