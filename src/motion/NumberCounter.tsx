import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

type NumberCounterProps = {
  startNumber: number;
  endNumber: number;
  prefix: string;
  suffix: string;
};

// Ported from reel-craft's src/motion/components/NumberCounter.tsx as-is -
// fixed bottom-center placement (no position control) matches the source,
// same as Film Dust having no intensity knob (see src/textures/types.ts).
export const NumberCounter: React.FC<NumberCounterProps> = ({ startNumber, endNumber, prefix, suffix }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const value = Math.round(
    interpolate(frame, [0, durationInFrames], [startNumber, endNumber], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );

  return (
    <AbsoluteFill
      style={{ pointerEvents: 'none', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 140 }}
    >
      <div
        style={{
          fontSize: 76,
          fontWeight: 800,
          color: 'white',
          fontFamily: 'sans-serif',
          textShadow: '0 4px 24px rgba(0,0,0,0.5)',
        }}
      >
        {`${prefix}${value}${suffix}`}
      </div>
    </AbsoluteFill>
  );
};
