// Shared shape for Caption Studio's live style controls (Style tab) - kept
// separate from CaptionRenderer.tsx to avoid a circular import between it and
// the style components. All fields are optional and fall back to each style
// component's existing hardcoded defaults, so faceless-app's unmodified calls
// (no overrides passed) render byte-identical to before.
//
// `keywordHighlight` used to be its own variant (PLAN.md Part F). Keyword
// emphasis is now an independent overlay any animation can apply on top of
// itself via applyKeywordEmphasis() - see applyKeywordEmphasis.ts - so the
// variant union only names base animations.
export type CaptionStyleVariant = "signature" | "calmPhrase" | "typewriter" | "slideUp" | "outlineDraw";

// Caption text is always horizontally centered - only vertical placement is
// configurable, since left/right/corner placement never makes sense for
// caption text in a vertical or horizontal video. See position.ts.
export type CaptionPosition = "top" | "center" | "bottom";

export type WordTypographyOverride = {
  fontFamily?: string;
  fontStyle?: "normal" | "italic";
  color?: string;
  fontSize?: number; // relative size multiplier, e.g. 1.25, 0.8
  fontWeight?: number;
};

export type CaptionTextTransform = "none" | "uppercase" | "lowercase";

export type CaptionStyleOverrides = {
  fontFamily?: string;
  fontWeight?: number | string;
  fontStyle?: "normal" | "italic";
  textColor?: string;
  highlightColor?: string;
  position?: CaptionPosition;
  strokeEnabled?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  shadowEnabled?: boolean;
  glowEnabled?: boolean;
  glowColor?: string;
  glowIntensity?: number; // 0-1
  glowBlur?: number; // px, e.g. 2-30
  glowOpacity?: number; // 0-1
  gradientEnabled?: boolean;
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number; // degrees, e.g. 0-360
  letterSpacing?: number; // px, e.g. -2 to 8
  lineHeight?: number; // unitless line-height multiplier, e.g. 0.9 to 1.8
  textTransform?: CaptionTextTransform;
  // Keyword emphasis - independent of `styleVariant`, applied on top of
  // whichever base animation is active.
  keywordHighlightEnabled?: boolean;
  keywords?: string[];
  keywordColor?: string;
  highlightIntensity?: number; // 0-1, controls glow strength
  // Multiplies the computed responsive font size (getResponsiveFontSize) -
  // default 1.0 leaves the computed default as-is; a per-video nudge for
  // when that default still feels off, not a replacement for it.
  fontSizeMultiplier?: number;
  // Word-level typography overrides keyed by word/token ID
  wordOverrides?: Record<string, WordTypographyOverride>;
};

