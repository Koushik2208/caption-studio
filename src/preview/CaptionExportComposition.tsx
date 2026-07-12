import { AbsoluteFill } from 'remotion';
import type { Caption } from '@remotion/captions';
import { CaptionRenderer } from '../captions/CaptionRenderer';
import type { CaptionStyleOverrides, CaptionStyleVariant } from '../captions/styles/types';
import type { OverlaySettings } from '../overlay/types';
import { WatermarkOverlay } from '../overlay/WatermarkOverlay';
import { ProgressBarOverlay } from '../overlay/ProgressBarOverlay';

// DaVinci Resolve Ultra Key-compatible chroma green (see PLAN.md Part E).
const CHROMA_GREEN = '#00B140';

export type CaptionExportProps = {
  captions: Caption[];
  styleVariant?: CaptionStyleVariant;
  styleOverrides?: CaptionStyleOverrides;
  overlaySettings?: OverlaySettings;
  // Read by Root.tsx's calculateMetadata, not by this component - kept on
  // the same props type so the server can pass one inputProps object through
  // both selectComposition and renderMedia.
  durationInFrames?: number;
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
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: CHROMA_GREEN }}>
      <CaptionRenderer captions={captions} styleVariant={styleVariant} styleOverrides={styleOverrides} />
      {overlaySettings?.watermarkEnabled && (
        <WatermarkOverlay opacity={overlaySettings.watermarkOpacity} position={overlaySettings.watermarkPosition} />
      )}
      {overlaySettings?.progressBarEnabled && (
        <ProgressBarOverlay color={overlaySettings.progressBarColor} position={overlaySettings.progressBarPosition} />
      )}
    </AbsoluteFill>
  );
};
