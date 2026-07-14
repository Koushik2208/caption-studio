import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import type { TickerDirection, TickerPosition } from './types';

const SPEED_PX_PER_FRAME = 4;
const SEPARATOR = '    •    ';

type TickerProps = {
  text: string;
  direction: TickerDirection;
  position: TickerPosition;
};

// Ported from reel-craft's src/motion/components/Ticker.tsx. The source
// looped the scroll math off a fixed vertical-only WIDTH constant
// (src/templates/shared/timing.ts) - rebased onto useVideoConfig().width so
// the loop seam lands correctly at both orientations (see Session 8's
// texture-overlay ports for the same class of fix).
export const Ticker: React.FC<TickerProps> = ({ text, direction, position }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const loopWidth = width * 2;
  const offset = (frame * SPEED_PX_PER_FRAME) % loopWidth;
  const translateX = direction === 'left' ? -offset : offset - loopWidth;

  const block = `${text}${SEPARATOR}`;
  const repeated = block.repeat(6);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          [position]: 0,
          height: 56,
          background: 'rgba(0,0,0,0.6)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            whiteSpace: 'nowrap',
            fontSize: 22,
            fontWeight: 600,
            color: 'white',
            fontFamily: 'sans-serif',
            transform: `translateX(${translateX}px)`,
          }}
        >
          {repeated}
        </div>
      </div>
    </AbsoluteFill>
  );
};
