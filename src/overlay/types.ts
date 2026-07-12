export type WatermarkPosition = 'tl' | 'tr' | 'bl' | 'br';
export type ProgressBarPosition = 'top' | 'bottom';

// Shared shape for Overlay tab controls - lives in ProjectContext (like
// CaptionStyleVariant/Overrides) so the same settings drive the live
// PreviewPlayer on every tab and get baked into the real export render.
export type OverlaySettings = {
  watermarkEnabled: boolean;
  watermarkOpacity: number; // 0-100
  watermarkPosition: WatermarkPosition;
  progressBarEnabled: boolean;
  progressBarColor: string;
  progressBarPosition: ProgressBarPosition;
};
