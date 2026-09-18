export type BuiltInAssetType = 'overlay' | 'sfx';

export type BuiltInAsset = {
  id: string;
  type: BuiltInAssetType;
  category: string;
  name: string;
  label: string;
  src: string;
  path: string;
  tags: string[];
};

export type TransitionOverlayPlacement = {
  id: string;
  assetId: string;
  startFrame: number;
  durationInFrames: number;
  opacity?: number; // 0 to 1, default 1.0
};

export type SoundEffectPlacement = {
  id: string;
  assetId: string;
  startFrame: number;
  volume?: number; // 0 to 1, default 0.8
};

export type AssetSettings = {
  transitionOverlays: TransitionOverlayPlacement[];
  soundEffects: SoundEffectPlacement[];
};

export const DEFAULT_ASSET_SETTINGS: AssetSettings = {
  transitionOverlays: [],
  soundEffects: [],
};
