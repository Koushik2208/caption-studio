export type VideoMotionType =
  | 'static'
  | 'ken-burns'
  | 'zoom-in'
  | 'zoom-out'
  | 'pan'
  | 'sway';

export type VideoMotionIntensity = 'subtle' | 'medium' | 'heavy';
export type VideoMotionSpeed = 'slow' | 'medium' | 'fast';

export type KenBurnsDirection =
  | 'zoom-in-center'
  | 'zoom-in-left'
  | 'zoom-in-right'
  | 'zoom-out-center'
  | 'zoom-out-left'
  | 'zoom-out-right';

export type PanDirection =
  | 'left-to-right'
  | 'right-to-left'
  | 'top-to-bottom'
  | 'bottom-to-top';

export type VideoMotionSettings = {
  type: VideoMotionType;
  intensity?: VideoMotionIntensity;
  speed?: VideoMotionSpeed;
  direction?: KenBurnsDirection | PanDirection;
};

export const DEFAULT_VIDEO_MOTION: VideoMotionSettings = {
  type: 'static',
  intensity: 'subtle',
  speed: 'medium',
  direction: 'zoom-in-center',
};
