// Minimal Bezel's corner radius scales off the frame's own content window
// width (not a fixed px) so it stays proportional at both orientations -
// same computed-from-real-dimensions pattern as getResponsiveFontSize. The
// base ratio (0.18) matches the original hardcoded radius from before this
// became adjustable, so multiplier 1.0 is pixel-identical to the old fixed value.
const BEZEL_RADIUS_RATIO = 0.18;

// multiplier: user-facing override (FrameSettings.bezelRadiusMultiplier) so
// the computed default can be nudged per-video - multiplies the computed
// value rather than replacing it. 0 collapses to sharp corners.
export const getResponsiveBezelRadius = (contentWidth: number, multiplier: number = 1): number =>
  contentWidth * BEZEL_RADIUS_RATIO * multiplier;
