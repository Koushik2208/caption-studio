import type { CaptionStyleOverrides, WordTypographyOverride } from "./types";

export type WordTokenLike = {
  startMs?: number;
  fromMs?: number;
  endMs?: number;
  toMs?: number;
  id?: string;
  text?: string;
};

/**
 * Derives a stable token identifier from a caption token or TikTok token.
 */
export const getWordTokenId = (token: WordTokenLike): string => {
  if (token.id) return token.id;
  const start = token.startMs ?? token.fromMs ?? 0;
  const end = token.endMs ?? token.toMs ?? 0;
  return `${start}_${end}`;
};

/**
 * Resolves effective typography for an individual word token, taking into account
 * any word-level sparse override, fallback to global styleOverrides, and default values.
 */
export const resolveWordTypography = (
  token: WordTokenLike,
  baseFontSize: number,
  overrides?: CaptionStyleOverrides,
) => {
  const wordId = getWordTokenId(token);
  const wordOverride: WordTypographyOverride | undefined = overrides?.wordOverrides?.[wordId];

  const fontFamily = wordOverride?.fontFamily ?? overrides?.fontFamily;
  const fontStyle = wordOverride?.fontStyle ?? overrides?.fontStyle ?? "normal";
  const fontWeight = wordOverride?.fontWeight ?? (overrides?.fontWeight ? Number(overrides.fontWeight) : 700);
  const sizeMultiplier = wordOverride?.fontSize ?? 1;
  const fontSize = sizeMultiplier !== 1 ? baseFontSize * sizeMultiplier : baseFontSize;
  const customColor = wordOverride?.color;

  return {
    wordId,
    wordOverride,
    fontFamily,
    fontStyle,
    fontWeight,
    fontSize,
    sizeMultiplier,
    customColor,
  };
};
