import { DEFAULT_KEYWORDS } from '../captions/styles/applyKeywordEmphasis.js';
import type { FontPresetName } from '../captions/styles/presets';
import { DEFAULT_VIDEO_MOTION, type VideoMotionSettings } from '../videoMotion/types.js';
import type {
  CreativeBeatVisual,
  CreativeGlobalSettings,
  CreativeProject,
  CreativeTypographySettings,
} from './types.js';
import type { CaptionStyleVariant } from '../captions/styles/types.js';
import type { TextureOverlaySettings } from '../textures/types.js';
import type { FrameSettings } from '../frames/types.js';
import type { OverlaySettings } from '../overlay/types.js';
import type { MotionGraphicsSettings } from '../motion/types.js';

export const CREATIVE_DOCUMENT_VERSION = 1;
export const MAX_PROJECT_DURATION_SECONDS = 300; // 5 minutes max per specification
export const DEFAULT_FPS = 30;
export const MAX_PROJECT_DURATION_FRAMES = MAX_PROJECT_DURATION_SECONDS * DEFAULT_FPS; // 9,000 frames @ 30fps

export function getMaxProjectFrames(fps: number = DEFAULT_FPS): number {
  const safeFps = typeof fps === 'number' && fps > 0 ? fps : DEFAULT_FPS;
  return MAX_PROJECT_DURATION_SECONDS * safeFps;
}

export const DEFAULT_CREATIVE_TYPOGRAPHY: CreativeTypographySettings = {
  presetName: 'Viral Hook' as FontPresetName,
  fontWeight: 400,
  fontStyle: 'normal',
  fontSizeMultiplier: 1.0,
  textColor: '#FFFFFF',
  position: 'center',
  captionPositionY: 0.5,
  textAlign: 'center',
  strokeEnabled: false,
  strokeColor: '#000000',
  strokeWidth: 2,
  shadowEnabled: true,
  glowEnabled: false,
  glowColor: '#00e5ff',
  glowIntensity: 0.5,
  glowBlur: 12,
  glowOpacity: 0.8,
  gradientEnabled: false,
  gradientStart: '#ff007a',
  gradientEnd: '#7928ca',
  gradientAngle: 90,
  letterSpacing: 0,
  lineHeight: 1.2,
  textTransform: 'none',
  backdropEnabled: false,
  backdropColor: '#000000',
  backdropOpacity: 60,
  backdropRadius: 8,
  backdropPaddingX: 16,
  backdropPaddingY: 8,
  keywordHighlightEnabled: true,
  highlightIntensity: 0.5,
  highlightColor: '#0066ff',
  keywords: [...DEFAULT_KEYWORDS],
  wordOverrides: {},
};

export const DEFAULT_CREATIVE_TEXTURES: TextureOverlaySettings = {
  gradientOverlayEnabled: false,
  gradientOverlayColor: '#000000',
  gradientOverlayOpacity: 0.65,
  gradientOverlayStrength: 0.6,
  gradientOverlayDirection: 'bottom',
  filmDustEnabled: false,
  halationEnabled: false,
  halationIntensity: 'medium',
  gridEnabled: false,
  gridIntensity: 'medium',
  crtScanlinesEnabled: false,
  crtScanlinesIntensity: 'medium',
  halftoneEnabled: false,
  halftoneIntensity: 'medium',
  lightLeakEnabled: false,
  lightLeakIntensity: 'medium',
  chromaticAberrationEnabled: false,
  chromaticAberrationIntensity: 'medium',
  filmGrainEnabled: false,
  filmGrainIntensity: 'medium',
  audioPulseEnabled: false,
  audioPulseIntensity: 'medium',
  keywordPunchEnabled: false,
  keywordPunchIntensity: 'medium',
};

export const DEFAULT_CREATIVE_FRAME: FrameSettings = {
  variant: 'none',
  bgColor: '#000000',
  bezelRadiusMultiplier: 1.0,
  layout: 'full-bleed',
  cardMode: 'preset',
  customScale: 0.85,
  customAspectRatio: '9:16',
  customPositionY: 0.5,
  customBorderRadius: 24,
  customBorderEnabled: false,
  customBorderWidth: 2,
  customBorderColor: '#ffffff',
  customBorderStyle: 'solid',
  customShadowEnabled: true,
  customShadowBlur: 24,
  customShadowOpacity: 40,
  customBackdrop: 'none',
  customBackdropColor: '#121214',
  customBackdropGradient: '',
  splitGap: 0,
  splitTopFocalX: 0.5,
  splitTopFocalY: 0.25,
  splitBottomFocalX: 0.5,
  splitBottomFocalY: 0.75,
  splitLeftFocalX: 0.25,
  splitLeftFocalY: 0.5,
  splitRightFocalX: 0.75,
  splitRightFocalY: 0.5,
};

export const DEFAULT_CREATIVE_OVERLAY: OverlaySettings = {
  watermarkEnabled: false,
  watermarkOpacity: 70,
  watermarkPosition: 'bottom-right',
  watermarkSize: 15,
  watermarkAssetId: undefined,
  watermarkUrl: undefined,
  watermarkFilename: undefined,
  watermark: {
    enabled: false,
    position: 'bottom-right',
    size: 0.15,
    opacity: 0.7,
  },
  progressBarEnabled: false,
  progressBarColor: '#3b82f6',
  progressBarPosition: 'bottom',
};

export const DEFAULT_CREATIVE_MOTION: MotionGraphicsSettings = {
  codeBlockEnabled: false,
  codeBlockCode: 'const x = 42;',
  codeBlockLanguage: 'js',
  codeBlockPosition: 'center',
  codeBlockLinesPerPage: 10,
  numberCounterEnabled: false,
  numberCounterStart: 0,
  numberCounterEnd: 100,
  numberCounterPrefix: '',
  numberCounterSuffix: '%',
  tickerEnabled: false,
  tickerText: 'BREAKING NEWS',
  tickerDirection: 'left',
  tickerPosition: 'bottom',
};

export const DEFAULT_GLOBAL_SETTINGS: CreativeGlobalSettings = {
  typography: DEFAULT_CREATIVE_TYPOGRAPHY,
  animation: 'signature',
  effects: DEFAULT_CREATIVE_TEXTURES,
  composition: DEFAULT_CREATIVE_FRAME,
  overlay: DEFAULT_CREATIVE_OVERLAY,
  motion: DEFAULT_CREATIVE_MOTION,
  videoMotion: DEFAULT_VIDEO_MOTION,
};

/**
 * Deterministically resolves a beat's visual settings by merging beat-level overrides on top of global defaults.
 */
export function resolveBeatVisualSettings(
  global: CreativeGlobalSettings,
  beatVisual?: CreativeBeatVisual,
): {
  typography: CreativeTypographySettings;
  animation: CaptionStyleVariant;
  effects: TextureOverlaySettings;
  composition: FrameSettings;
  videoMotion: VideoMotionSettings;
  overlay: OverlaySettings;
} {
  if (!beatVisual) {
    return {
      typography: { ...global.typography },
      animation: global.animation,
      effects: { ...global.effects },
      composition: { ...global.composition },
      videoMotion: { ...global.videoMotion },
      overlay: { ...global.overlay },
    };
  }

  return {
    typography: {
      ...global.typography,
      ...(beatVisual.typography || {}),
      wordOverrides: {
        ...(global.typography.wordOverrides || {}),
        ...(beatVisual.typography?.wordOverrides || {}),
      },
    },
    animation: beatVisual.animation ?? global.animation,
    effects: {
      ...global.effects,
      ...(beatVisual.effects || {}),
    },
    composition: {
      ...global.composition,
      ...(beatVisual.composition || {}),
    },
    videoMotion: {
      ...global.videoMotion,
      ...(beatVisual.videoMotion || {}),
    },
    overlay: {
      ...global.overlay,
      ...(beatVisual.overlay || {}),
    },
  };
}

export function createDefaultCreativeProject(overrides?: Partial<CreativeProject>): CreativeProject {
  const fps = overrides?.fps ?? DEFAULT_FPS;
  const durationInFrames = overrides?.durationInFrames ?? 150;
  return {
    version: CREATIVE_DOCUMENT_VERSION,
    id: overrides?.id ?? `proj_${Date.now()}`,
    name: overrides?.name ?? 'Untitled Creative Project',
    fps,
    durationInFrames,
    input: overrides?.input ?? {
      mode: 'idea',
      text: '',
    },
    creativeIntent: overrides?.creativeIntent ?? {
      contentType: 'educational',
      tone: 'punchy',
      energy: 'medium',
      pacing: 'moderate',
      visualStyle: 'modern_bold',
    },
    beats: overrides?.beats ?? [
      {
        id: 'beat_01',
        type: 'hook',
        startFrame: 0,
        endFrame: durationInFrames,
        content: {
          text: '',
        },
      },
    ],
    globalSettings: overrides?.globalSettings ?? {
      typography: { ...DEFAULT_CREATIVE_TYPOGRAPHY },
      animation: DEFAULT_GLOBAL_SETTINGS.animation,
      effects: { ...DEFAULT_CREATIVE_TEXTURES },
      composition: { ...DEFAULT_CREATIVE_FRAME },
      overlay: { ...DEFAULT_CREATIVE_OVERLAY },
      motion: { ...DEFAULT_CREATIVE_MOTION },
      videoMotion: { ...DEFAULT_VIDEO_MOTION },
    },
    assets: overrides?.assets ?? {
      media: [
        {
          id: 'video_main',
          type: 'video',
          name: 'Main Video',
          durationInFrames,
        },
      ],
      transitions: [],
      sfx: [],
    },
    ...overrides,
  };
}
