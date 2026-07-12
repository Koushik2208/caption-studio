import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import type { ProgressBarPosition } from './types';

type ProgressBarOverlayProps = {
  color: string;
  position: ProgressBarPosition;
};

// Driven by Remotion's own frame/duration, not DOM video currentTime - the
// same math runs identically in the live Player preview and in the
// server-side export render.
export const ProgressBarOverlay: React.FC<ProgressBarOverlayProps> = ({ color, position }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = durationInFrames > 1 ? frame / (durationInFrames - 1) : 0;
  const clampedProgress = Math.min(1, Math.max(0, progress));

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: 'rgba(255,255,255,0.15)',
          ...(position === 'top' ? { top: 0 } : { bottom: 0 }),
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clampedProgress * 100}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
