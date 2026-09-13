// Shared keyword-emphasis logic, usable on top of any base animation
// (PLAN.md Part F). Previously duplicated inside a standalone
// `keywordHighlight` variant component; now a single helper any animation
// calls per-token instead of reimplementing matching/glow itself.
const DEFAULT_KEYWORD_COLOR = "#0066ff";
const DEFAULT_HIGHLIGHT_INTENSITY = 0.5;
const KEYWORD_SCALE_BOOST = 1.12;

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
  color?: string,
): KeywordEmphasisStyle => {
  if (!isKeyword) {
    return { textShadow: "none", scale: baseScale };
  }

  const glowColor = color ?? DEFAULT_KEYWORD_COLOR;
  const clampedIntensity = Math.max(0, Math.min(1, intensity));
  const blurPx = 4 + clampedIntensity * 12;
  const glowAlpha = 0.25 + clampedIntensity * 0.55;

  return {
    color, // only overrides text color if explicitly passed; otherwise lets custom textColor show through
    textShadow: `0 0 ${blurPx}px ${hexToRgba(glowColor, glowAlpha)}`,
    scale: baseScale * KEYWORD_SCALE_BOOST,
  };
};
