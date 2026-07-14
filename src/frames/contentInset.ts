import { CINEMATIC_SCOPE_BAR_RATIO } from './CinematicScope';
import { FILM_STRIP_WIDTH_RATIO } from './FilmStrip';
import type { FrameContentInset, FrameSettings } from './types';

const ZERO_INSET: FrameContentInset = { top: 0, bottom: 0, left: 0, right: 0 };

// Cinematic Scope's letterbox bars and Film Strip's sprocket rails paint
// opaque chrome on top of a full-canvas children render, so caption
// positioning must reserve that space explicitly. Minimal Bezel/Square
// Bezel instead shrink the children viewport itself (captions render inside
// the smaller window already), and Gradient Border/Neon Glow/Vintage
// Projector layer soft glow/vignette over the full frame without opaquely
// covering it - all of those report zero inset.
export const getFrameContentInset = (
  frameSettings: FrameSettings | undefined,
  compositionHeight: number,
  compositionWidth: number,
): FrameContentInset => {
  if (frameSettings?.variant === 'cinematicScope') {
    const barHeight = compositionHeight * CINEMATIC_SCOPE_BAR_RATIO;
    return { top: barHeight, bottom: barHeight, left: 0, right: 0 };
  }
  if (frameSettings?.variant === 'filmStrip') {
    const stripWidth = compositionWidth * FILM_STRIP_WIDTH_RATIO;
    return { top: 0, bottom: 0, left: stripWidth, right: stripWidth };
  }
  return ZERO_INSET;
};
