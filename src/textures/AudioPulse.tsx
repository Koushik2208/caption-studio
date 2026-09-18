import { useCurrentFrame } from 'remotion';
import type { OverlayIntensity, TextureOverlaySettings } from './types';

// Max additional scale/brightness at full smoothed amplitude. Bumped up from
// the original "subtle 1.0-1.03" spec at the user's request, after debug
// instrumentation confirmed the underlying amplitude data was real and
// varying but the effect itself was too subtle to see - High now reaches a
// clearly visible ~12% zoom / ~30% brightness lift on loud passages.
const SCALE_RANGE: Record<OverlayIntensity, number> = { low: 0.03, medium: 0.07, high: 0.12 };
const BRIGHTNESS_RANGE: Record<OverlayIntensity, number> = { low: 0.08, medium: 0.18, high: 0.3 };
// Rolling-average half-window (frames each side) - smooths frame-to-frame
// jitter in the per-frame RMS amplitude array without a random/stateful
// filter, so the same frame always produces the same smoothed value.
const SMOOTHING_HALF_WINDOW = 4;

type AudioPulseProps = {
  textureSettings?: TextureOverlaySettings;
  // Per-frame RMS amplitude, 0-1 (peak-normalized against the source audio),
  // computed server-side during transcription - see server/index.ts's
  // computeAudioAmplitude and ProjectContext's audioAmplitude state.
  audioAmplitude?: number[] | null;
  children: React.ReactNode;
};

// Wraps the video/background layer (like ChromaticAberration) in a scale +
// brightness transform driven by the audio's amplitude at the current frame,
// smoothed with a short rolling average so it pulses rather than jitters.
export const AudioPulse: React.FC<AudioPulseProps> = ({ textureSettings, audioAmplitude, children }) => {
  const frame = useCurrentFrame();

  if (!textureSettings?.audioPulseEnabled || !audioAmplitude || audioAmplitude.length === 0) {
    return <>{children}</>;
  }

  const rawIntensity = textureSettings.audioPulseIntensity;
  const intensity: OverlayIntensity = (rawIntensity && SCALE_RANGE[rawIntensity]) ? rawIntensity : 'medium';

  let sum = 0;
  let count = 0;
  for (let i = frame - SMOOTHING_HALF_WINDOW; i <= frame + SMOOTHING_HALF_WINDOW; i++) {
    if (i < 0 || i >= audioAmplitude.length) continue;
    sum += audioAmplitude[i];
    count++;
  }
  const smoothed = count > 0 ? sum / count : 0;

  const scale = 1 + smoothed * SCALE_RANGE[intensity];
  const brightness = 1 + smoothed * BRIGHTNESS_RANGE[intensity];

  return (
    <div style={{ width: '100%', height: '100%', transform: `scale(${scale})`, filter: `brightness(${brightness})` }}>
      {children}
    </div>
  );
};
