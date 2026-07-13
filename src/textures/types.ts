export type OverlayIntensity = 'low' | 'medium' | 'high';

// Lives alongside FrameSettings (src/frames/types.ts) - same pattern: one
// settings object in ProjectContext drives the live PreviewPlayer and gets
// baked into the real export render. Film Dust has no intensity control
// (on/off only, per its Reel Craft origin - see src/textures/FilmDust.tsx).
export type TextureOverlaySettings = {
  filmDustEnabled: boolean;
  halationEnabled: boolean;
  halationIntensity: OverlayIntensity;
  gridEnabled: boolean;
  gridIntensity: OverlayIntensity;
};
