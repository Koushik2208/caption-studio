export type FrameVariant =
  | 'none'
  | 'minimalBezel'
  | 'gradientBorder'
  | 'neonGlow'
  | 'cinematicScope'
  | 'filmStrip'
  | 'squareBezel'
  | 'vintageProjector';

export type CompositionLayout =
  | 'full-bleed'
  | 'floating-card'
  | 'top-bottom-split'
  | 'left-right-split';

export type FrameCardMode = 'preset' | 'custom';
export type CardAspectRatio = '9:16' | '4:5' | '1:1' | '16:9';
export type CardBorderStyle = 'solid' | 'dashed' | 'double';
export type CardBackdrop = 'none' | 'solid' | 'gradient' | 'blurred-video';

// Lives alongside OverlaySettings (src/overlay/types.ts) - same pattern: one
// settings object in ProjectContext drives the live PreviewPlayer and gets
// baked into the real export render.
export type FrameSettings = {
  // V4 Phase 3A Layout Mode
  layout?: CompositionLayout;

  // Preset mode variant (minimalBezel, squareBezel, neonGlow, etc.)
  variant: FrameVariant;
  // Shell color for bezel-style frames (MinimalBezel, SquareBezel) - other frames ignore it.
  bgColor: string;
  // Multiplies Minimal Bezel's computed responsive corner radius (see
  // src/frames/bezelRadius.ts) - other frames ignore it. Default 1.0, same
  // multiplier-on-a-computed-default pattern as fontSizeMultiplier.
  bezelRadiusMultiplier: number;

  // V4 Custom Card Mode fields
  cardMode?: FrameCardMode;
  customScale?: number; // 0.5 - 1.0, default 0.85
  customAspectRatio?: CardAspectRatio; // '9:16' | '4:5' | '1:1' | '16:9'
  customPositionY?: number; // 0 - 1 (0 = top, 0.5 = center, 1 = bottom)
  customBorderRadius?: number; // 0 - 80px, default 24
  customBorderEnabled?: boolean;
  customBorderWidth?: number; // 0 - 16px, default 2
  customBorderColor?: string; // hex
  customBorderStyle?: CardBorderStyle;
  customShadowEnabled?: boolean;
  customShadowBlur?: number; // 0 - 60px, default 24
  customShadowOpacity?: number; // 0 - 100%, default 40
  customBackdrop?: CardBackdrop; // 'none' | 'solid' | 'gradient' | 'blurred-video'
  customBackdropColor?: string; // hex, default '#121214'
  customBackdropGradient?: string; // CSS gradient string

  // V4 Phase 3D Split Controls
  splitGap?: number; // 0 - 40px, default 0
  splitTopFocalX?: number; // 0 - 1, default 0.5
  splitTopFocalY?: number; // 0 - 1, default 0.25
  splitBottomFocalX?: number; // 0 - 1, default 0.5
  splitBottomFocalY?: number; // 0 - 1, default 0.75
  splitLeftFocalX?: number; // 0 - 1, default 0.25
  splitLeftFocalY?: number; // 0 - 1, default 0.5
  splitRightFocalX?: number; // 0 - 1, default 0.75
  splitRightFocalY?: number; // 0 - 1, default 0.5
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
