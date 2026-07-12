import { Composition } from 'remotion';
import { CaptionExportComposition, type CaptionExportProps } from '../preview/CaptionExportComposition';

// Matches PreviewPlayer/CaptionPreviewComposition (vertical-only, per
// CLAUDE.md): 1080x1920 @ 30fps.
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
          durationInFrames: FALLBACK_DURATION_IN_FRAMES,
        } satisfies CaptionExportProps
      }
      calculateMetadata={async ({ props }) => ({
        durationInFrames: props.durationInFrames ?? FALLBACK_DURATION_IN_FRAMES,
      })}
    />
  );
};
