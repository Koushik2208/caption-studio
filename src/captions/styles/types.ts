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

export type CaptionStyleOverrides = {
  fontFamily?: string;
  fontWeight?: number | string;
  fontStyle?: "normal" | "italic";
  highlightColor?: string;
  justifyContent?: "flex-start" | "center" | "flex-end" | "start" | "end";
  alignItems?: "flex-start" | "center" | "flex-end" | "start" | "end";
  // Keyword emphasis - independent of `styleVariant`, applied on top of
  // whichever base animation is active.
  keywordHighlightEnabled?: boolean;
  keywords?: string[];
  keywordColor?: string;
  highlightIntensity?: number; // 0-1, controls glow strength
};
