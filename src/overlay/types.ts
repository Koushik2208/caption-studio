export type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'tl'
  | 'tr'
  | 'bl'
  | 'br'
  | 'tc'
  | 'cl'
  | 'c'
  | 'cr'
  | 'bc';

export type CanonicalWatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type ProgressBarPosition = 'top' | 'bottom';

export type WatermarkConfig = {
  enabled: boolean;
  assetId?: string;
  position: WatermarkPosition;
  size: number; // relative size percentage (e.g. 15 for 15% or 0.15)
  opacity: number; // 0-100 or 0-1
};

// Shared shape for Overlay tab controls - lives in ProjectContext (like
// CaptionStyleVariant/Overrides) so the same settings drive the live
// PreviewPlayer on every tab and get baked into the real export render.
export type OverlaySettings = {
  watermarkEnabled: boolean;
  watermarkOpacity: number; // 0-100 (or 0-1)
  watermarkPosition: WatermarkPosition;
  watermarkSize?: number; // relative size (e.g. 15 for 15% or 0.15)
  watermarkAssetId?: string;
  watermarkUrl?: string;
  watermarkFilename?: string;
  watermark?: WatermarkConfig;
  progressBarEnabled: boolean;
  progressBarColor: string;
  progressBarPosition: ProgressBarPosition;
};

