import type { Caption } from '@remotion/captions';
import type { CaptionStyleOverrides } from '../captions/styles/types';
import { AudioPulse } from './AudioPulse';
import { ChromaticAberration } from './ChromaticAberration';
import { KeywordPunch } from './KeywordPunch';
import type { TextureOverlaySettings } from './types';

type BackgroundEffectsRendererProps = {
  textureSettings?: TextureOverlaySettings;
  audioAmplitude?: number[] | null;
  captions?: Caption[] | null;
  styleOverrides?: CaptionStyleOverrides;
  children: React.ReactNode;
};

// Composes every effect that wraps (rather than paints on top of) the video/
// background layer - Audio-Reactive Pulse, Keyword-Synced Punch, Chromatic
// Aberration - so the three composition files (Preview/Export/ExportVideo)
// each wrap their video/background element once instead of nesting all three
// wrappers by hand. Order: pulse and punch apply CSS transform/filter to the
// whole wrapped subtree, chromatic aberration applies its SVG filter
// innermost (closest to the actual video/background pixels) - each is a
// no-op passthrough when its own setting is disabled.
export const BackgroundEffectsRenderer: React.FC<BackgroundEffectsRendererProps> = ({
  textureSettings,
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
      <ChromaticAberration textureSettings={textureSettings}>{children}</ChromaticAberration>
    </KeywordPunch>
  </AudioPulse>
);
