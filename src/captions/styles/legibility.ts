// PLAN.md Part I2: global legibility layer ("High-Contrast Safe Zone Rule").
// A dark stroke + soft ambient drop shadow keep caption text readable
// against any background/frame/texture, regardless of which font or
// highlight color is picked - this is legibility infrastructure applied in
// the shared rendering path, not a per-preset style choice.
//
// Both ratios scale off the same responsive fontSize (getResponsiveFontSize)
// rather than a fixed px value, so they hold correctly at both orientations
// - same reasoning as fontSize.ts itself (a value tuned as a fixed px for
// one orientation comes out wrong at the other, see LEARNINGS.md).
const STROKE_RATIO = 0.05; // 4-6% of font size
const SHADOW_BLUR_RATIO = 0.1; // 10% of font size
const SHADOW_OPACITY = 0.8;

export const getLegibilityStroke = (
  fontSize: number,
  overrides?: { strokeEnabled?: boolean; strokeColor?: string; strokeWidth?: number },
): string => {
  if (overrides?.strokeEnabled === false || overrides?.strokeWidth === 0) return 'none';
  const color = overrides?.strokeColor ?? 'black';
  const width =
    overrides?.strokeWidth !== undefined
      ? `${overrides.strokeWidth}px`
      : `${(fontSize * STROKE_RATIO).toFixed(2)}px`;
  return `${width} ${color}`;
};

// No offset (pure all-around blur): the shadow needs to hold up regardless
// of which direction the background is lighter/busier in, so it can't lean
// on a directional drop like a typical UI shadow would.
export const getLegibilityShadow = (fontSize: number, shadowEnabled: boolean = true): string => {
  if (!shadowEnabled) return 'none';
  return `0 0 ${(fontSize * SHADOW_BLUR_RATIO).toFixed(2)}px rgba(0, 0, 0, ${SHADOW_OPACITY})`;
};

// Per-token textShadow needs both the always-on legibility shadow and
// whichever keyword-emphasis glow applyKeywordEmphasis produced (or "none")
// - CSS text-shadow accepts a comma-separated list, so this just combines
// whichever of the two are actually present instead of one clobbering the
// other.
export const combineTextShadow = (...shadows: (string | undefined)[]): string => {
  const active = shadows.filter((shadow) => shadow && shadow !== 'none');
  return active.length > 0 ? active.join(', ') : 'none';
};
