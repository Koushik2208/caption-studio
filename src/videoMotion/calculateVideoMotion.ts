import { interpolate } from 'remotion';
import type { VideoMotionSettings } from './types';

export type VideoMotionTransform = {
  transform: string;
  transformOrigin: string;
};

/**
 * Calculates a pure, deterministic CSS transform for video footage motion
 * across Remotion preview and MP4 export rendering pipelines.
 */
export function calculateVideoMotionTransform(
  settings: VideoMotionSettings | undefined,
  frame: number,
  fps: number,
  durationInFrames: number,
  focalX = 0.5,
  focalY = 0.5,
): VideoMotionTransform {
  const type = settings?.type ?? 'static';
  const intensity = settings?.intensity ?? 'subtle';
  const speed = settings?.speed ?? 'medium';
  const direction = settings?.direction;

  const origin = `${Math.round(focalX * 100)}% ${Math.round(focalY * 100)}%`;

  if (type === 'static' || durationInFrames <= 1) {
    return {
      transform: 'none',
      transformOrigin: origin,
    };
  }

  const effectiveDuration = Math.max(1, durationInFrames - 1);
  const progress = interpolate(frame, [0, effectiveDuration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  switch (type) {
    case 'zoom-in': {
      const maxDelta = intensity === 'heavy' ? 0.16 : intensity === 'medium' ? 0.12 : 0.08;
      const scale = 1.0 + maxDelta * progress;
      return {
        transform: `scale(${scale.toFixed(4)})`,
        transformOrigin: origin,
      };
    }

    case 'zoom-out': {
      const maxDelta = intensity === 'heavy' ? 0.16 : intensity === 'medium' ? 0.12 : 0.08;
      const scale = 1.0 + maxDelta * (1 - progress);
      return {
        transform: `scale(${scale.toFixed(4)})`,
        transformOrigin: origin,
      };
    }

    case 'ken-burns': {
      const maxDelta = intensity === 'heavy' ? 0.14 : intensity === 'medium' ? 0.10 : 0.07;
      const maxShift = intensity === 'heavy' ? 3.5 : intensity === 'medium' ? 2.5 : 1.5;
      const baseOverscan = 1.05;

      const kbDir = direction ?? 'zoom-in-center';
      const isZoomIn = kbDir.startsWith('zoom-in');
      const scaleProg = isZoomIn ? progress : 1 - progress;
      const scale = baseOverscan * (1.0 + maxDelta * scaleProg);

      let shiftX = 0;
      let shiftY = 0;

      if (kbDir.includes('left')) {
        shiftX = interpolate(progress, [0, 1], [maxShift, -maxShift]);
      } else if (kbDir.includes('right')) {
        shiftX = interpolate(progress, [0, 1], [-maxShift, maxShift]);
      } else {
        shiftY = interpolate(progress, [0, 1], [maxShift * 0.5, -maxShift * 0.5]);
      }

      return {
        transform: `scale(${scale.toFixed(4)}) translate3d(${shiftX.toFixed(3)}%, ${shiftY.toFixed(3)}%, 0)`,
        transformOrigin: origin,
      };
    }

    case 'pan': {
      const maxShift = intensity === 'heavy' ? 5.0 : intensity === 'medium' ? 3.5 : 2.0;
      const baseScale = 1.0 + (intensity === 'heavy' ? 0.14 : intensity === 'medium' ? 0.10 : 0.07);

      const panDir = direction ?? 'left-to-right';
      let tx = 0;
      let ty = 0;

      if (panDir === 'left-to-right') {
        tx = interpolate(progress, [0, 1], [-maxShift, maxShift]);
      } else if (panDir === 'right-to-left') {
        tx = interpolate(progress, [0, 1], [maxShift, -maxShift]);
      } else if (panDir === 'top-to-bottom') {
        ty = interpolate(progress, [0, 1], [-maxShift, maxShift]);
      } else if (panDir === 'bottom-to-top') {
        ty = interpolate(progress, [0, 1], [maxShift, -maxShift]);
      }

      return {
        transform: `scale(${baseScale.toFixed(4)}) translate3d(${tx.toFixed(3)}%, ${ty.toFixed(3)}%, 0)`,
        transformOrigin: origin,
      };
    }

    case 'sway': {
      const baseScale = 1.05;
      const freq = speed === 'fast' ? 2.0 : speed === 'slow' ? 0.8 : 1.3;
      const maxTranslate = intensity === 'heavy' ? 1.8 : intensity === 'medium' ? 1.2 : 0.7;
      const maxRotate = intensity === 'heavy' ? 0.75 : intensity === 'medium' ? 0.45 : 0.25;

      const timeSec = (frame / Math.max(1, fps)) * freq;
      const dx = Math.sin(timeSec * 1.5) * maxTranslate;
      const dy = Math.cos(timeSec * 1.1) * (maxTranslate * 0.6);
      const rot = Math.sin(timeSec * 0.9) * maxRotate;

      return {
        transform: `scale(${baseScale.toFixed(4)}) translate3d(${dx.toFixed(3)}%, ${dy.toFixed(3)}%, 0) rotate(${rot.toFixed(3)}deg)`,
        transformOrigin: origin,
      };
    }

    default:
      return {
        transform: 'none',
        transformOrigin: origin,
      };
  }
}
