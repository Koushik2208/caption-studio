import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import type { OverlayIntensity } from './types';

const SETTINGS: Record<OverlayIntensity, { opacity: number; baseFrequency: number }> = {
  low: { opacity: 0.05, baseFrequency: 0.85 },
  medium: { opacity: 0.09, baseFrequency: 0.9 },
  high: { opacity: 0.16, baseFrequency: 0.95 },
};

// True film grain: fine continuous noise across the whole frame, distinct
// from FilmDust's discrete moving specks. feTurbulence's `seed` is keyed off
// the current frame number (not Math.random()), so the noise pattern is a
// pure function of frame - deterministic and reproducible across preview and
// export renders of the same frame, per CLAUDE.md's frame-determinism rule.
export const FilmGrain: React.FC<{ intensity?: OverlayIntensity }> = ({ intensity = 'medium' }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const safeIntensity: OverlayIntensity = (intensity && SETTINGS[intensity]) ? intensity : 'medium';
  const { opacity, baseFrequency } = SETTINGS[safeIntensity];
  const filterId = `film-grain-${safeIntensity}`;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity, mixBlendMode: 'overlay' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={baseFrequency}
            numOctaves={2}
            seed={frame}
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix in="noise" type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
    </AbsoluteFill>
  );
};
