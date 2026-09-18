import type React from "react";
import type { FrameContentInset } from "../../frames/types";
import { getCaptionBackdropStyle } from "./legibility";
import type { CaptionAlignment, CaptionPosition, CaptionStyleOverrides } from "./types";

export const CAPTION_SAFE_WIDTH_PERCENT = 84;
const SAFE_MARGIN_RATIO = 0.09;

/**
 * Returns outer position container styling (full-bleed flex overlay that centers and vertically positions).
 */
export const getPositionStyle = (
  position: CaptionPosition | undefined,
  compositionHeight: number,
  contentInset?: FrameContentInset,
  customPositionY?: number,
  textAlign: CaptionAlignment = "center",
): React.CSSProperties => {
  const horizontalJustify =
    textAlign === "left"
      ? "flex-start"
      : textAlign === "right"
      ? "flex-end"
      : "center";

  const alignStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: horizontalJustify,
    paddingLeft: textAlign === "left" ? "8%" : undefined,
    paddingRight: textAlign === "right" ? "8%" : undefined,
  };

  // If continuous customPositionY is provided, compute smooth deterministic Y translation
  if (customPositionY !== undefined) {
    const topPx = compositionHeight * customPositionY;
    const insetOffset = ((contentInset?.top ?? 0) - (contentInset?.bottom ?? 0)) * 0.5;
    return {
      ...alignStyle,
      justifyContent: "center",
      transform: `translateY(${Math.round(topPx - compositionHeight * 0.5 + insetOffset)}px)`,
    };
  }

  // Legacy semantic positioning fallback
  const margin = compositionHeight * SAFE_MARGIN_RATIO;
  switch (position) {
    case "top":
      return {
        ...alignStyle,
        justifyContent: "flex-start",
        paddingTop: margin + (contentInset?.top ?? 0),
      };
    case "bottom":
      return {
        ...alignStyle,
        justifyContent: "flex-end",
        paddingBottom: margin + (contentInset?.bottom ?? 0),
      };
    case "split-center":
    case "center":
    default:
      return {
        ...alignStyle,
        justifyContent: "center",
      };
  }
};

/**
 * Standard Caption Safe-Area container styling shared across ALL caption animation styles.
 * Ensures strict 84% bounded width, centered placement, and normal word wrapping.
 */
export const getCaptionContainerStyle = (
  overrides?: CaptionStyleOverrides,
  fontSize?: number,
): React.CSSProperties => ({
  width: "84%",
  maxWidth: "84%",
  boxSizing: "border-box",
  fontSize,
  fontWeight: overrides?.fontWeight ?? 700,
  fontStyle: overrides?.fontStyle ?? "normal",
  fontFamily: overrides?.fontFamily ?? "Arial, sans-serif",
  textAlign: overrides?.textAlign ?? "center",
  whiteSpace: "normal",
  overflowWrap: "normal",
  wordBreak: "normal",
  lineHeight: overrides?.lineHeight ?? 1.15,
  letterSpacing: overrides?.letterSpacing !== undefined ? `${overrides.letterSpacing}px` : undefined,
  textTransform: overrides?.textTransform ?? "none",
  margin: "0 auto",
  ...getCaptionBackdropStyle(overrides),
});

/**
 * Clean token text formatting and whitespace determination to prevent adjacent token concatenation.
 */
export function formatCaptionToken(
  tokenText: string,
  index: number,
): { cleanText: string; needsSpace: boolean } {
  const cleanText = tokenText.trim();
  const hasLeadingSpace = tokenText.startsWith(" ");
  const isPunctuationOnly = /^[,.!?:;)}\]]/.test(cleanText);
  const needsSpace = index > 0 && (hasLeadingSpace || !isPunctuationOnly);
  return { cleanText, needsSpace };
}
