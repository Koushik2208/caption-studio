// Shared keyword-emphasis logic, usable on top of any base animation
// (PLAN.md Part F). Previously duplicated inside a standalone
// `keywordHighlight` variant component; now a single helper any animation
// calls per-token instead of reimplementing matching/glow itself.
const DEFAULT_KEYWORD_COLOR = "#ff3366";
const DEFAULT_HIGHLIGHT_INTENSITY = 0.4; // 0-1; a deliberately restrained default (was an opaque, fixed glow before)
const KEYWORD_SCALE_BOOST = 1.15;

// Small curated keyword list for this script (PLAN.md B1 #2 - "maintain a
// small keyword list" rather than parsing **bold** marks, since captions.json
// comes from Whisper/plain text with no markdown). Editable keyword list UI
// is Phase 4.
export const DEFAULT_KEYWORDS = [
  "3000",
  "egyptian",
  "edible",
  "bacteria",
  "hydrogen",
  "peroxide",
  "outlive",
  "chemistry",
];

const normalize = (text: string) => text.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

export const isKeywordToken = (text: string, keywords: string[]): boolean => {
  const keywordSet = new Set(keywords.map((k) => k.toLowerCase()));
  return keywordSet.has(normalize(text));
};

const hexToRgba = (hex: string, alpha: number): string => {
  const value = hex.replace("#", "");
  const expanded = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const bigint = parseInt(expanded, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export type KeywordEmphasisStyle = {
  color?: string;
  textShadow: string;
  scale: number;
};

// baseScale: the scale this token would already have from its own animation
// (e.g. Signature's spring pop-in) - emphasis multiplies on top of it rather
// than replacing it, so keyword tokens stay in sync with the base animation.
export const applyKeywordEmphasis = (
  baseScale: number,
  isKeyword: boolean,
  intensity: number = DEFAULT_HIGHLIGHT_INTENSITY,
  color: string = DEFAULT_KEYWORD_COLOR,
): KeywordEmphasisStyle => {
  if (!isKeyword) {
    return { textShadow: "none", scale: baseScale };
  }

  const clampedIntensity = Math.max(0, Math.min(1, intensity));
  const blurPx = 4 + clampedIntensity * 12; // 4-16px, down from a flat 18px
  const glowAlpha = 0.25 + clampedIntensity * 0.55; // 0.25-0.8, down from opaque

  return {
    color,
    textShadow: `0 0 ${blurPx}px ${hexToRgba(color, glowAlpha)}`,
    scale: baseScale * KEYWORD_SCALE_BOOST,
  };
};
