import type { Caption } from '@remotion/captions';
import type { CaptionStyleOverrides } from '../captions/styles/types';
import type { VideoMotionSettings } from '../videoMotion/types';
import { VideoMotionWrapper } from '../videoMotion/VideoMotionWrapper';
import { AudioPulse } from './AudioPulse';
import { ChromaticAberration } from './ChromaticAberration';
import { KeywordPunch } from './KeywordPunch';
import type { TextureOverlaySettings } from './types';

type BackgroundEffectsRendererProps = {
  textureSettings?: TextureOverlaySettings;
  videoMotion?: VideoMotionSettings;
  focalX?: number;
  focalY?: number;
  audioAmplitude?: number[] | null;
  captions?: Caption[] | null;
  styleOverrides?: CaptionStyleOverrides;
  children: React.ReactNode;
};

// Composes every effect that wraps (rather than paints on top of) the video/
// background layer - Audio-Reactive Pulse, Keyword-Synced Punch, Video Motion, Chromatic
// Aberration - so the three composition files (Preview/Export/ExportVideo)
// each wrap their video/background element once instead of nesting all wrappers by hand.
export const BackgroundEffectsRenderer: React.FC<BackgroundEffectsRendererProps> = ({
  textureSettings,
  videoMotion,
  focalX,
  focalY,
  audioAmplitude,
  captions,
  styleOverrides,
  children,
}) => (
  <AudioPulse textureSettings={textureSettings} audioAmplitude={audioAmplitude}>
    <KeywordPunch
      textureSettings={textureSettings}
      captions={captions}
      keywordHighlightEnabled={styleOverrides?.keywordHighlightEnabled}
      keywords={styleOverrides?.keywords}
    >
      <VideoMotionWrapper videoMotion={videoMotion} focalX={focalX} focalY={focalY}>
        <ChromaticAberration textureSettings={textureSettings}>{children}</ChromaticAberration>
      </VideoMotionWrapper>
    </KeywordPunch>
  </AudioPulse>
);

