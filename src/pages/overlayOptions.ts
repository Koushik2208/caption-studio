import type { FrameVariant } from '../frames/types';

// Shared between the condensed OverlayPage panel and the full
// OverlayFramesPage/OverlayTextureOverlaysPage lists so the views can't
// drift out of sync.
export const FRAME_OPTIONS: { value: FrameVariant; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'minimalBezel', label: 'Minimal Bezel' },
  { value: 'gradientBorder', label: 'Gradient Border' },
  { value: 'neonGlow', label: 'Neon Glow' },
  { value: 'cinematicScope', label: 'Cinematic Scope' },
];

export const FRAME_SHELL_COLORS = [
  { name: 'Black', hex: '#000000', bgClass: 'bg-black' },
  { name: 'Primary Blue', hex: '#0066ff', bgClass: 'bg-primary-container' },
  { name: 'Error Red', hex: '#ba1a1a', bgClass: 'bg-error' },
  { name: 'Accent Pink', hex: '#ffdbd0', bgClass: 'bg-tertiary-fixed' },
  { name: 'White', hex: '#ffffff', bgClass: 'bg-white border border-outline-variant' },
];

export const INTENSITY_OPTIONS: { value: 'low' | 'medium' | 'high'; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

// How many options the condensed OverlayPage Frame card shows before linking
// out to the full list - tune per category without touching the full pages.
export const CONDENSED_FRAME_COUNT = 3;
