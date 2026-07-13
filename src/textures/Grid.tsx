import { AbsoluteFill, useVideoConfig } from 'remotion';
import type { OverlayIntensity } from './types';

const SETTINGS: Record<OverlayIntensity, { spacing: number; strokeOpacity: number }> = {
  low: { spacing: 80, strokeOpacity: 0.04 },
  medium: { spacing: 60, strokeOpacity: 0.07 },
  high: { spacing: 40, strokeOpacity: 0.11 },
};

// Ported from reel-craft (github.com/Koushik2208/reel-craft). Dimensions
// read from useVideoConfig() rather than reel-craft's fixed WIDTH/HEIGHT
// constants, so this also renders correctly in the horizontal 1920x1080
// composition.
export const Grid: React.FC<{ intensity: OverlayIntensity }> = ({ intensity }) => {
  const { width, height } = useVideoConfig();
  const { spacing, strokeOpacity } = SETTINGS[intensity];

  const verticals: number[] = [];
  for (let x = 0; x <= width; x += spacing) verticals.push(x);
  const horizontals: number[] = [];
  for (let y = 0; y <= height; y += spacing) horizontals.push(y);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        style={{ filter: 'blur(0.5px)' }}
      >
        {verticals.map((x) => (
          <line key={`v-${x}`} x1={x} y1={0} x2={x} y2={height} stroke="white" strokeOpacity={strokeOpacity} />
        ))}
        {horizontals.map((y) => (
          <line key={`h-${y}`} x1={0} y1={y} x2={width} y2={y} stroke="white" strokeOpacity={strokeOpacity} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
