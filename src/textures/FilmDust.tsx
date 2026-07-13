import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

const PARTICLE_COUNT = 60;

function makeLcg(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// Ported from reel-craft (github.com/Koushik2208/reel-craft) - on/off only,
// no intensity control. Dimensions read from useVideoConfig() rather than
// reel-craft's fixed WIDTH/HEIGHT constants, so this also renders correctly
// in the horizontal 1920x1080 composition.
export const FilmDust: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const seed = (frame % 3) + 1;
  const rand = makeLcg(seed);

  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    cx: rand() * width,
    cy: rand() * height,
    r: 1 + rand() * 2,
    opacity: 0.6 + rand() * 0.3,
  }));

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        {particles.map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="white" opacity={p.opacity} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
