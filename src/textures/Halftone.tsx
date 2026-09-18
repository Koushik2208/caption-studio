import { AbsoluteFill, useVideoConfig } from 'remotion';
import type { OverlayIntensity } from './types';

const SETTINGS: Record<OverlayIntensity, { dotRadius: number; spacing: number; opacity: number }> = {
  low: { dotRadius: 1.5, spacing: 18, opacity: 0.08 },
  medium: { dotRadius: 2, spacing: 14, opacity: 0.12 },
  high: { dotRadius: 3, spacing: 12, opacity: 0.18 },
};

// Ported from reel-craft (github.com/Koushik2208/reel-craft). Dimensions
// read from useVideoConfig() rather than reel-craft's fixed WIDTH/HEIGHT
// constants, so this also renders correctly in the horizontal 1920x1080
// composition.
export const Halftone: React.FC<{ intensity?: OverlayIntensity }> = ({ intensity = 'medium' }) => {
  const { width, height } = useVideoConfig();
  const config = (intensity && SETTINGS[intensity]) ? SETTINGS[intensity] : SETTINGS.medium;
  const { dotRadius, spacing, opacity } = config;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <pattern id="halftone-pattern" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
            <circle cx={spacing / 2} cy={spacing / 2} r={dotRadius} fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#halftone-pattern)" opacity={opacity} />
      </svg>
    </AbsoluteFill>
  );
};
