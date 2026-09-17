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

const hexToRgba = (hex: string, alpha: number): string => {
  const value = hex.replace('#', '');
  const expanded = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
  const bigint = parseInt(expanded, 16);
  if (isNaN(bigint)) return `rgba(0, 102, 255, ${alpha})`;
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getCaptionGlowShadow = (overrides?: {
  glowEnabled?: boolean;
  glowColor?: string;
  glowIntensity?: number;
  glowBlur?: number;
  glowOpacity?: number;
}): string => {
  if (!overrides?.glowEnabled) return 'none';
  const color = overrides.glowColor ?? '#0066ff';
  const intensity = Math.max(0, Math.min(1, overrides.glowIntensity ?? 0.6));
  const blur = Math.max(1, overrides.glowBlur ?? 12);
  const opacity = Math.max(0, Math.min(1, overrides.glowOpacity ?? 0.8));

  const effectiveAlpha = opacity * (0.35 + intensity * 0.65);
  const coreBlur = Math.max(1, Math.round(blur * 0.4));
  const outerBlur = Math.round(blur);

  const coreRgba = hexToRgba(color, Math.min(1, effectiveAlpha * 1.25));
  const outerRgba = hexToRgba(color, effectiveAlpha);

  return `0 0 ${coreBlur}px ${coreRgba}, 0 0 ${outerBlur}px ${outerRgba}`;
};

export const getCaptionFillStyle = (
  fallbackColor: string,
  hasExplicitColor: boolean,
  overrides?: {
    gradientEnabled?: boolean;
    gradientStart?: string;
    gradientEnd?: string;
    gradientAngle?: number;
  },
): {
  color?: string;
  WebkitTextFillColor?: string;
  backgroundImage?: string;
  WebkitBackgroundClip?: string;
  backgroundClip?: string;
  display?: string;
} => {
  if (hasExplicitColor || !overrides?.gradientEnabled) {
    return {
      color: fallbackColor,
      WebkitTextFillColor: fallbackColor,
    };
  }

  const start = overrides.gradientStart ?? '#FFFFFF';
  const end = overrides.gradientEnd ?? '#10B981';
  const angle = overrides.gradientAngle ?? 90;

  return {
    backgroundImage: `linear-gradient(${angle}deg, ${start}, ${end})`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
  };
};

export const getCaptionEffectStyle = (
  fontSize: number,
  isGradient: boolean,
  overrides?: {
    shadowEnabled?: boolean;
    glowEnabled?: boolean;
    glowColor?: string;
    glowIntensity?: number;
    glowBlur?: number;
    glowOpacity?: number;
  },
  emphasisTextShadow?: string,
): {
  textShadow?: string;
  filter?: string;
} => {
  const legibilityShadow = getLegibilityShadow(fontSize, overrides?.shadowEnabled !== false);
  const glowShadow = getCaptionGlowShadow(overrides);

  if (isGradient) {
    // When using background-clip: text with transparent text fill, text-shadow paints on top
    // of the transparent glyphs in Blink/WebKit, masking the gradient.
    // filter: drop-shadow(...) applies shadows around the clipped text boundary without masking it.
    const filterParts: string[] = [];
    if (overrides?.shadowEnabled !== false) {
      filterParts.push(`drop-shadow(0px 0px ${(fontSize * SHADOW_BLUR_RATIO).toFixed(2)}px rgba(0, 0, 0, ${SHADOW_OPACITY}))`);
    }
    if (overrides?.glowEnabled) {
      const color = overrides.glowColor ?? '#0066ff';
      const intensity = Math.max(0, Math.min(1, overrides.glowIntensity ?? 0.6));
      const blur = Math.max(1, overrides.glowBlur ?? 12);
      const opacity = Math.max(0, Math.min(1, overrides.glowOpacity ?? 0.8));
      const effectiveAlpha = opacity * (0.35 + intensity * 0.65);
      const coreBlur = Math.max(1, Math.round(blur * 0.4));
      const outerBlur = Math.round(blur);
      const coreRgba = hexToRgba(color, Math.min(1, effectiveAlpha * 1.25));
      const outerRgba = hexToRgba(color, effectiveAlpha);
      filterParts.push(`drop-shadow(0px 0px ${coreBlur}px ${coreRgba})`);
      filterParts.push(`drop-shadow(0px 0px ${outerBlur}px ${outerRgba})`);
    }
    if (emphasisTextShadow && emphasisTextShadow !== 'none') {
      filterParts.push(`drop-shadow(0px 0px 8px rgba(0, 102, 255, 0.7))`);
    }
    return {
      textShadow: 'none',
      filter: filterParts.length > 0 ? filterParts.join(' ') : undefined,
    };
  }

  return {
    textShadow: combineTextShadow(legibilityShadow, glowShadow, emphasisTextShadow),
  };
};

// Per-token textShadow needs both the always-on legibility shadow and
// whichever keyword-emphasis glow applyKeywordEmphasis produced (or "none")
// and caption glow effect - CSS text-shadow accepts a comma-separated list,
// so this just combines whichever of them are actually present.
export const combineTextShadow = (...shadows: (string | undefined)[]): string => {
  const active = shadows.filter((shadow) => shadow && shadow !== 'none');
  return active.length > 0 ? active.join(', ') : 'none';
};
