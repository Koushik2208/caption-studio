export type FrameVariant =
  | 'none'
  | 'minimalBezel'
  | 'gradientBorder'
  | 'neonGlow'
  | 'cinematicScope'
  | 'filmStrip'
  | 'squareBezel'
  | 'vintageProjector';

// Lives alongside OverlaySettings (src/overlay/types.ts) - same pattern: one
// settings object in ProjectContext drives the live PreviewPlayer and gets
// baked into the real export render.
export type FrameSettings = {
  variant: FrameVariant;
  // Shell color for bezel-style frames (MinimalBezel, SquareBezel) - other frames ignore it.
  bgColor: string;
};

// How much of the composition's edges an active frame's own chrome already
// occupies (e.g. Cinematic Scope's letterbox bars) - see
// src/frames/contentInset.ts. Caption positioning adds this on top of its
// own safe-margin inset so Top/Bottom captions clear the frame, not just the
// raw composition edge. Defaults to all-zero for frames that don't reduce
// usable content area (Minimal Bezel, Gradient Border, Neon Glow).
export type FrameContentInset = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};
