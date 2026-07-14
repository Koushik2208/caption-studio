import type { FrameContentInset } from "../../frames/types";
import type { CaptionPosition } from "./types";

// Corner/side placement never makes sense for caption text - it's always
// horizontally centered, only vertical placement (top/center/bottom) varies.
// Top/bottom inset by a safe margin so captions never sit flush against the
// edge (clears phone status bars, platform UI, home indicators). Computed in
// JS as a fraction of the actual composition height rather than a CSS %
// padding value - percentage padding-top/bottom resolves against the
// containing block's *width* per the CSS spec, not its height, so a plain
// "9%" padding would look right at 1080x1920 but wrong at 1920x1080.
const SAFE_MARGIN_RATIO = 0.09;

export const getPositionStyle = (
  position: CaptionPosition | undefined,
  compositionHeight: number,
  // How much space the active frame's own chrome already occupies (e.g.
  // Cinematic Scope's letterbox bars) - added on top of the safe margin so
  // Top/Bottom captions clear the frame, not just the raw composition edge.
  // Zero for 'none' or frames that don't reduce usable content area.
  contentInset?: FrameContentInset,
): {
  justifyContent: "flex-start" | "center" | "flex-end";
  alignItems: "center";
  paddingTop?: number;
  paddingBottom?: number;
} => {
  const margin = compositionHeight * SAFE_MARGIN_RATIO;
  switch (position) {
    case "top":
      return {
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: margin + (contentInset?.top ?? 0),
      };
    case "bottom":
      return {
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: margin + (contentInset?.bottom ?? 0),
      };
    case "center":
    default:
      return { justifyContent: "center", alignItems: "center" };
  }
};
