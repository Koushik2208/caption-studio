import { CINEMATIC_SCOPE_BAR_RATIO } from './CinematicScope';
import type { FrameContentInset, FrameSettings } from './types';

const ZERO_INSET: FrameContentInset = { top: 0, bottom: 0, left: 0, right: 0 };

// Only Cinematic Scope's letterbox bars currently reduce usable content
// area - Minimal Bezel/Gradient Border/Neon Glow layer their chrome over the
// full frame without covering it, so they report zero inset.
export const getFrameContentInset = (
  frameSettings: FrameSettings | undefined,
  compositionHeight: number,
): FrameContentInset => {
  if (frameSettings?.variant === 'cinematicScope') {
    const barHeight = compositionHeight * CINEMATIC_SCOPE_BAR_RATIO;
    return { top: barHeight, bottom: barHeight, left: 0, right: 0 };
  }
  return ZERO_INSET;
};
