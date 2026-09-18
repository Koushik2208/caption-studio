import type React from "react";
import type { FrameContentInset } from "../../frames/types";
import type { CaptionAlignment, CaptionPosition } from "./types";

// Corner/side placement is configured via textAlign & safe horizontal insets.
// Vertical placement is controlled via continuous vertical position (customPositionY)
// or semantic position presets ('bottom', 'center', 'split-center', 'top').
const SAFE_MARGIN_RATIO = 0.09;

export const getPositionStyle = (
  position: CaptionPosition | undefined,
  compositionHeight: number,
  contentInset?: FrameContentInset,
  customPositionY?: number,
  textAlign: CaptionAlignment = "center",
): React.CSSProperties => {
  const alignStyle: React.CSSProperties = {
    display: "flex",
    alignItems:
      textAlign === "left"
        ? "flex-start"
        : textAlign === "right"
        ? "flex-end"
        : "center",
    paddingLeft: textAlign === "left" ? "7.5%" : undefined,
    paddingRight: textAlign === "right" ? "7.5%" : undefined,
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
