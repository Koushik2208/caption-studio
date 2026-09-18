import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { GradientOverlayDirection } from './types.js';
import { getGradientDirectionCss, getGradientOverlayBackground } from './gradientUtils';

export { getGradientDirectionCss, getGradientOverlayBackground };

export type GradientOverlayProps = {
  enabled?: boolean;
  color?: string;
  opacity?: number;
  strength?: number;
  direction?: GradientOverlayDirection;
};

export const GradientOverlay: React.FC<GradientOverlayProps> = ({
  enabled = true,
  color = '#000000',
  opacity = 0.65,
  strength = 0.6,
  direction = 'bottom',
}) => {
  if (!enabled) return null;

  const clampedOpacity = Math.max(0, Math.min(1, typeof opacity === 'number' && Number.isFinite(opacity) ? opacity : 0.65));
  const background = getGradientOverlayBackground(color, strength, direction);

  return (
    <AbsoluteFill
      style={{
        background,
        opacity: clampedOpacity,
        pointerEvents: 'none',
      }}
    />
  );
};
