import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { CardBackdrop } from './types';

export type CanvasBackgroundProps = {
  backdrop?: CardBackdrop;
  color?: string;
  gradient?: string;
  children?: React.ReactNode;
};

/**
 * CanvasBackground renders the full-bleed canvas layer behind composition cards/frames.
 * Supports None (dark base), Solid color, CSS Linear Gradient, and Blurred Video.
 */
export const CanvasBackground: React.FC<CanvasBackgroundProps> = ({
  backdrop = 'none',
  color = '#121214',
  gradient = 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)',
  children,
}) => {
  if (backdrop === 'none') {
    return <AbsoluteFill style={{ backgroundColor: '#000000' }} />;
  }

  if (backdrop === 'solid') {
    return <AbsoluteFill style={{ backgroundColor: color }} />;
  }

  if (backdrop === 'gradient') {
    return <AbsoluteFill style={{ background: gradient }} />;
  }

  if (backdrop === 'blurred-video' && children) {
    return (
      <AbsoluteFill
        style={{
          overflow: 'hidden',
          filter: 'blur(50px) brightness(0.55) saturate(1.25)',
          transform: 'scale(1.2)',
          pointerEvents: 'none',
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }

  return <AbsoluteFill style={{ backgroundColor: '#000000' }} />;
};
