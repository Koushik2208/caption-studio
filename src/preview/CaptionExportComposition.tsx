import { AbsoluteFill, useVideoConfig } from 'remotion';
import type { Caption } from '@remotion/captions';
import { CaptionRenderer } from '../captions/CaptionRenderer';
import type { CaptionStyleOverrides, CaptionStyleVariant } from '../captions/styles/types';
import type { OverlaySettings } from '../overlay/types';
import { WatermarkOverlay } from '../overlay/WatermarkOverlay';
import { ProgressBarOverlay } from '../overlay/ProgressBarOverlay';
import type { FrameSettings } from '../frames/types';
import { FrameRenderer } from '../frames/FrameRenderer';
import { getFrameContentInset } from '../frames/contentInset';
import type { TextureOverlaySettings } from '../textures/types';
import { TextureOverlayRenderer } from '../textures/TextureOverlayRenderer';

// DaVinci Resolve Ultra Key-compatible chroma green (see PLAN.md Part E).
const CHROMA_GREEN = '#00B140';

export type CaptionExportProps = {
  captions: Caption[];
  styleVariant?: CaptionStyleVariant;
  styleOverrides?: CaptionStyleOverrides;
  overlaySettings?: OverlaySettings;
  frameSettings?: FrameSettings;
  textureSettings?: TextureOverlaySettings;
  // Read by Root.tsx's calculateMetadata, not by this component - kept on
  // the same props type so the server can pass one inputProps object through
  // both selectComposition and renderMedia.
  durationInFrames?: number;
  // Also read only by calculateMetadata, to size the composition itself
  // (1080x1920 vs 1920x1080) rather than always rendering vertical.
  orientation?: 'vertical' | 'horizontal';
};

// Minimal export-only composition: captions over a solid chroma-key
// background, no scenes/media/audio. Mirrors CaptionPreviewComposition's use
// of CaptionRenderer/overlays so Style and Overlay tab choices render
// byte-identical on export to what the live preview showed.
export const CaptionExportComposition: React.FC<CaptionExportProps> = ({
  captions,
  styleVariant,
  styleOverrides,
  overlaySettings,
  frameSettings,
  textureSettings,
}) => {
  const { height } = useVideoConfig();
  const frameContentInset = getFrameContentInset(frameSettings, height);
  // See CaptionPreviewComposition - only elevate above frame chrome when
  // that chrome actually occupies space (e.g. Cinematic Scope's letterbox
  // bars); other frames keep their existing z-index:auto stacking.
  const hasFrameInset = frameContentInset.top > 0 || frameContentInset.bottom > 0;

  return (
    <FrameRenderer frameSettings={frameSettings}>
      <AbsoluteFill style={{ backgroundColor: CHROMA_GREEN }}>
        <TextureOverlayRenderer textureSettings={textureSettings} />
        <AbsoluteFill style={hasFrameInset ? { zIndex: 1 } : undefined}>
          <CaptionRenderer
            captions={captions}
            styleVariant={styleVariant}
            styleOverrides={styleOverrides}
            frameContentInset={frameContentInset}
          />
          {overlaySettings?.watermarkEnabled && (
            <WatermarkOverlay opacity={overlaySettings.watermarkOpacity} position={overlaySettings.watermarkPosition} />
          )}
          {overlaySettings?.progressBarEnabled && (
            <ProgressBarOverlay color={overlaySettings.progressBarColor} position={overlaySettings.progressBarPosition} />
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    </FrameRenderer>
  );
};
