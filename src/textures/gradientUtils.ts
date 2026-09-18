import type { GradientOverlayDirection } from './types';

export const getGradientDirectionCss = (direction: GradientOverlayDirection): string => {
  switch (direction) {
    case 'bottom':
      return 'to bottom';
    case 'top':
      return 'to top';
    case 'left':
      return 'to left';
    case 'right':
      return 'to right';
    case 'bottom-left':
      return 'to bottom left';
    case 'bottom-right':
      return 'to bottom right';
    case 'top-left':
      return 'to top left';
    case 'top-right':
      return 'to top right';
    default:
      return 'to bottom';
  }
};

export const getGradientOverlayBackground = (
  color: string = '#000000',
  strength: number = 0.6,
  direction: GradientOverlayDirection = 'bottom',
): string => {
  const dirCss = getGradientDirectionCss(direction);
  const clampedStrength = Math.max(0, Math.min(1, typeof strength === 'number' && Number.isFinite(strength) ? strength : 0.6));
  const transparentStop = Math.max(0, Math.round((1 - clampedStrength) * 100));
  return `linear-gradient(${dirCss}, transparent 0%, transparent ${transparentStop}%, ${color || '#000000'} 100%)`;
};
