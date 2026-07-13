export type FrameVariant = 'none' | 'minimalBezel' | 'gradientBorder' | 'neonGlow' | 'cinematicScope';

// Lives alongside OverlaySettings (src/overlay/types.ts) - same pattern: one
// settings object in ProjectContext drives the live PreviewPlayer and gets
// baked into the real export render.
export type FrameSettings = {
  variant: FrameVariant;
  // Shell color for bezel-style frames (MinimalBezel) - other frames ignore it.
  bgColor: string;
};
