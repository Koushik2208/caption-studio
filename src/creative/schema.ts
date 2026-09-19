import type { CaptionStyleVariant } from '../captions/styles/types.js';
import { FONT_PRESETS, type FontPresetName } from '../captions/styles/presets';
import type { CompositionLayout, FrameCardMode, FrameVariant } from '../frames/types.js';
import type { VideoMotionType } from '../videoMotion/types.js';
import type { GradientOverlayDirection } from '../textures/types.js';
import { TRANSITION_OVERLAYS, SOUND_EFFECTS } from '../assets/registry.js';

export const SUPPORTED_ANIMATION_VARIANTS: readonly CaptionStyleVariant[] = [
  'signature',
  'splitReveal',
  'wordStamp',
  'blurResolve',
  'sentenceBlock',
  'calmPhrase',
  'typewriter',
  'slideUp',
  'outlineDraw',
] as const;

export const SUPPORTED_FRAME_VARIANTS: readonly FrameVariant[] = [
  'none',
  'minimalBezel',
  'gradientBorder',
  'neonGlow',
  'cinematicScope',
  'filmStrip',
  'squareBezel',
  'vintageProjector',
  'terminal',
] as const;

export const SUPPORTED_COMPOSITION_LAYOUTS: readonly CompositionLayout[] = [
  'full-bleed',
  'floating-card',
  'top-bottom-split',
  'left-right-split',
] as const;

export const SUPPORTED_FRAME_CARD_MODES: readonly FrameCardMode[] = [
  'preset',
  'custom',
] as const;

export const SUPPORTED_VIDEO_MOTION_TYPES: readonly VideoMotionType[] = [
  'static',
  'ken-burns',
  'zoom-in',
  'zoom-out',
  'pan',
  'sway',
] as const;

export const SUPPORTED_FONT_PRESETS: readonly FontPresetName[] = FONT_PRESETS.map((p) => p.name);

export const VALID_TRANSITION_ASSET_IDS = new Set<string>(
  TRANSITION_OVERLAYS.map((asset) => asset.id),
);

export const VALID_SFX_ASSET_IDS = new Set<string>(
  SOUND_EFFECTS.map((asset) => asset.id),
);

export const VALID_INPUT_MODES = new Set<string>([
  'idea',
  'srt',
  'transcript',
  'text',
]);

export const SUPPORTED_GRADIENT_OVERLAY_DIRECTIONS: readonly GradientOverlayDirection[] = [
  'bottom',
  'top',
  'left',
  'right',
  'bottom-left',
  'bottom-right',
  'top-left',
  'top-right',
] as const;

export const VALID_GRADIENT_OVERLAY_DIRECTIONS = new Set<string>(
  SUPPORTED_GRADIENT_OVERLAY_DIRECTIONS,
);

import type { CanonicalWatermarkPosition } from '../overlay/types.js';


export const SUPPORTED_WATERMARK_POSITIONS: readonly CanonicalWatermarkPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center',
  'center-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const;

export const VALID_WATERMARK_POSITIONS = new Set<string>([
  ...SUPPORTED_WATERMARK_POSITIONS,
  'tl',
  'tr',
  'bl',
  'br',
  'tc',
  'cl',
  'c',
  'cr',
  'bc',
  'top',
  'bottom',
  'left',
  'right',
]);

const WATERMARK_POSITION_MAP: Record<string, CanonicalWatermarkPosition> = {
  'top-left': 'top-left',
  top_left: 'top-left',
  topleft: 'top-left',
  tl: 'top-left',
  'top-center': 'top-center',
  top_center: 'top-center',
  topcenter: 'top-center',
  tc: 'top-center',
  top: 'top-center',
  'top-right': 'top-right',
  top_right: 'top-right',
  topright: 'top-right',
  tr: 'top-right',
  'center-left': 'center-left',
  center_left: 'center-left',
  centerleft: 'center-left',
  cl: 'center-left',
  left: 'center-left',
  center: 'center',
  middle: 'center',
  c: 'center',
  'center-right': 'center-right',
  center_right: 'center-right',
  centerright: 'center-right',
  cr: 'center-right',
  right: 'center-right',
  'bottom-left': 'bottom-left',
  bottom_left: 'bottom-left',
  bottomleft: 'bottom-left',
  bl: 'bottom-left',
  'bottom-center': 'bottom-center',
  bottom_center: 'bottom-center',
  bottomcenter: 'bottom-center',
  bc: 'bottom-center',
  bottom: 'bottom-center',
  'bottom-right': 'bottom-right',
  bottom_right: 'bottom-right',
  bottomright: 'bottom-right',
  br: 'bottom-right',
};

export function normalizeWatermarkPosition(raw: string): CanonicalWatermarkPosition | null {
  if (!raw || typeof raw !== 'string') return null;
  const key = raw.trim().toLowerCase();
  return WATERMARK_POSITION_MAP[key] ?? null;
}


// Normalization lookup maps to be lenient with external AI casing (e.g. "word-stamp" -> "wordStamp", "blur_resolve" -> "blurResolve")
const ANIMATION_VARIANT_MAP: Record<string, CaptionStyleVariant> = {
  signature: 'signature',
  splitreveal: 'splitReveal',
  'split-reveal': 'splitReveal',
  split_reveal: 'splitReveal',
  wordstamp: 'wordStamp',
  'word-stamp': 'wordStamp',
  word_stamp: 'wordStamp',
  blurresolve: 'blurResolve',
  'blur-resolve': 'blurResolve',
  blur_resolve: 'blurResolve',
  sentenceblock: 'sentenceBlock',
  'sentence-block': 'sentenceBlock',
  sentence_block: 'sentenceBlock',
  calmphrase: 'calmPhrase',
  'calm-phrase': 'calmPhrase',
  calm_phrase: 'calmPhrase',
  typewriter: 'typewriter',
  slideup: 'slideUp',
  'slide-up': 'slideUp',
  slide_up: 'slideUp',
  outlinedraw: 'outlineDraw',
  'outline-draw': 'outlineDraw',
  outline_draw: 'outlineDraw',
};

const FRAME_VARIANT_MAP: Record<string, FrameVariant> = {
  none: 'none',
  minimalbezel: 'minimalBezel',
  'minimal-bezel': 'minimalBezel',
  minimal_bezel: 'minimalBezel',
  gradientborder: 'gradientBorder',
  'gradient-border': 'gradientBorder',
  gradient_border: 'gradientBorder',
  neonglow: 'neonGlow',
  'neon-glow': 'neonGlow',
  neon_glow: 'neonGlow',
  cinematicscope: 'cinematicScope',
  'cinematic-scope': 'cinematicScope',
  cinematic_scope: 'cinematicScope',
  filmstrip: 'filmStrip',
  'film-strip': 'filmStrip',
  film_strip: 'filmStrip',
  squarebezel: 'squareBezel',
  'square-bezel': 'squareBezel',
  square_bezel: 'squareBezel',
  vintageprojector: 'vintageProjector',
  'vintage-projector': 'vintageProjector',
  vintage_projector: 'vintageProjector',
  terminal: 'terminal',
};

const COMPOSITION_LAYOUT_MAP: Record<string, CompositionLayout> = {
  'full-bleed': 'full-bleed',
  fullbleed: 'full-bleed',
  full_bleed: 'full-bleed',
  'floating-card': 'floating-card',
  floatingcard: 'floating-card',
  floating_card: 'floating-card',
  'top-bottom-split': 'top-bottom-split',
  topbottomsplit: 'top-bottom-split',
  top_bottom_split: 'top-bottom-split',
  'left-right-split': 'left-right-split',
  leftrightsplit: 'left-right-split',
  left_right_split: 'left-right-split',
};

const VIDEO_MOTION_MAP: Record<string, VideoMotionType> = {
  static: 'static',
  'ken-burns': 'ken-burns',
  kenburns: 'ken-burns',
  ken_burns: 'ken-burns',
  'zoom-in': 'zoom-in',
  zoomin: 'zoom-in',
  zoom_in: 'zoom-in',
  'zoom-out': 'zoom-out',
  zoomout: 'zoom-out',
  zoom_out: 'zoom-out',
  pan: 'pan',
  sway: 'sway',
};

export function normalizeAnimationVariant(raw: string): CaptionStyleVariant | null {
  if (!raw || typeof raw !== 'string') return null;
  const key = raw.trim().toLowerCase();
  return ANIMATION_VARIANT_MAP[key] ?? (SUPPORTED_ANIMATION_VARIANTS.includes(raw as any) ? (raw as CaptionStyleVariant) : null);
}

export function normalizeFrameVariant(raw: string): FrameVariant | null {
  if (!raw || typeof raw !== 'string') return null;
  const key = raw.trim().toLowerCase();
  return FRAME_VARIANT_MAP[key] ?? (SUPPORTED_FRAME_VARIANTS.includes(raw as any) ? (raw as FrameVariant) : null);
}

export function normalizeCompositionLayout(raw: string): CompositionLayout | null {
  if (!raw || typeof raw !== 'string') return null;
  const key = raw.trim().toLowerCase();
  return COMPOSITION_LAYOUT_MAP[key] ?? (SUPPORTED_COMPOSITION_LAYOUTS.includes(raw as any) ? (raw as CompositionLayout) : null);
}

export function normalizeVideoMotionType(raw: string): VideoMotionType | null {
  if (!raw || typeof raw !== 'string') return null;
  const key = raw.trim().toLowerCase();
  return VIDEO_MOTION_MAP[key] ?? (SUPPORTED_VIDEO_MOTION_TYPES.includes(raw as any) ? (raw as VideoMotionType) : null);
}

export function normalizeFontPresetName(raw: string): FontPresetName | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  const directMatch = FONT_PRESETS.find((p) => p.name.toLowerCase() === trimmed.toLowerCase());
  if (directMatch) return directMatch.name;
  const cleanKey = trimmed.toLowerCase().replace(/[-_]/g, ' ');
  const fuzzyMatch = FONT_PRESETS.find((p) => p.name.toLowerCase() === cleanKey);
  return fuzzyMatch ? fuzzyMatch.name : null;
}

export function isRegisteredTransitionAsset(assetId: string): boolean {
  return VALID_TRANSITION_ASSET_IDS.has(assetId);
}

export function isRegisteredSfxAsset(assetId: string): boolean {
  return VALID_SFX_ASSET_IDS.has(assetId);
}

/**
 * Creative capability catalog for external AI reference.
 */
export const CAPABILITY_CATALOG = {
  animations: SUPPORTED_ANIMATION_VARIANTS,
  fontPresets: SUPPORTED_FONT_PRESETS,
  frames: SUPPORTED_FRAME_VARIANTS,
  compositionLayouts: SUPPORTED_COMPOSITION_LAYOUTS,
  videoMotion: SUPPORTED_VIDEO_MOTION_TYPES,
  transitionAssets: TRANSITION_OVERLAYS.map((a) => ({ id: a.id, name: a.name, category: a.category })),
  sfxAssets: SOUND_EFFECTS.map((a) => ({ id: a.id, name: a.name, category: a.category })),
} as const;
