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
  crtScanlinesEnabled: boolean;
  crtScanlinesIntensity: OverlayIntensity;
  halftoneEnabled: boolean;
  halftoneIntensity: OverlayIntensity;
  lightLeakEnabled: boolean;
  lightLeakIntensity: OverlayIntensity;
  chromaticAberrationEnabled: boolean;
  chromaticAberrationIntensity: OverlayIntensity;
  // Fine continuous per-frame noise (feTurbulence seeded by frame number) -
  // distinct from Film Dust's discrete moving specks.
  filmGrainEnabled: boolean;
  filmGrainIntensity: OverlayIntensity;
  // Wraps the video/background layer (like Chromatic Aberration) rather than
  // painting an additive layer - see src/textures/AudioPulse.tsx.
  audioPulseEnabled: boolean;
  audioPulseIntensity: OverlayIntensity;
  // Also wraps the video/background layer - see src/textures/KeywordPunch.tsx.
  keywordPunchEnabled: boolean;
  keywordPunchIntensity: OverlayIntensity;
};
