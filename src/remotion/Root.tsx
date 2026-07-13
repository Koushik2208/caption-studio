import { Composition } from 'remotion';
import { CaptionExportComposition, type CaptionExportProps } from '../preview/CaptionExportComposition';

// Base resolution per CLAUDE.md: 1080x1920 vertical @ 30fps. These are just
// the fallback/thumbnail dimensions - calculateMetadata below computes the
// real render dimensions per-request from inputProps.orientation, so
// horizontal exports actually render at 1920x1080 instead of a vertical
// canvas letterboxed inside a wider frame.
const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;
const FALLBACK_DURATION_IN_FRAMES = 150;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CaptionExport"
      component={CaptionExportComposition}
      durationInFrames={FALLBACK_DURATION_IN_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={
        {
          captions: [],
          styleVariant: undefined,
          styleOverrides: undefined,
          overlaySettings: undefined,
          frameSettings: undefined,
          textureSettings: undefined,
          durationInFrames: FALLBACK_DURATION_IN_FRAMES,
          orientation: 'vertical',
        } satisfies CaptionExportProps
      }
      calculateMetadata={async ({ props }) => ({
        durationInFrames: props.durationInFrames ?? FALLBACK_DURATION_IN_FRAMES,
        width: props.orientation === 'horizontal' ? 1920 : 1080,
        height: props.orientation === 'horizontal' ? 1080 : 1920,
      })}
    />
  );
};
