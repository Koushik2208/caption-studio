import { AbsoluteFill, Audio, Video } from 'remotion';
import type { Caption } from '@remotion/captions';
import { CaptionRenderer } from '../captions/CaptionRenderer';
import type { CaptionStyleOverrides, CaptionStyleVariant } from '../captions/styles/types';
import type { OverlaySettings } from '../overlay/types';
import { WatermarkOverlay } from '../overlay/WatermarkOverlay';
import { ProgressBarOverlay } from '../overlay/ProgressBarOverlay';
import type { FrameSettings } from '../frames/types';
import { FrameRenderer } from '../frames/FrameRenderer';
import type { TextureOverlaySettings } from '../textures/types';
import { TextureOverlayRenderer } from '../textures/TextureOverlayRenderer';

export type CaptionPreviewProps = {
  captions: Caption[] | null;
  mediaUrl: string | null;
  mediaKind: 'video' | 'audio' | null;
  styleVariant?: CaptionStyleVariant;
  styleOverrides?: CaptionStyleOverrides;
  overlaySettings?: OverlaySettings;
  frameSettings?: FrameSettings;
  textureSettings?: TextureOverlaySettings;
};

// Minimal vertical-only preview: uploaded media as the background, real
// captions overlaid via the shared CaptionRenderer/processCaptions pipeline,
// watermark/progress bar on top - the same stack CaptionExportComposition
// renders server-side, so what's shown here is what ends up in the file.
export const CaptionPreviewComposition: React.FC<CaptionPreviewProps> = ({
  captions,
  mediaUrl,
  mediaKind,
  styleVariant,
  styleOverrides,
  overlaySettings,
  frameSettings,
  textureSettings,
}) => {
  return (
    <FrameRenderer frameSettings={frameSettings}>
      <AbsoluteFill style={{ backgroundColor: 'black' }}>
        {mediaUrl && mediaKind === 'video' && (
          <Video src={mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        {mediaUrl && mediaKind === 'audio' && <Audio src={mediaUrl} />}
        <TextureOverlayRenderer textureSettings={textureSettings} />
        {captions && captions.length > 0 && (
          <CaptionRenderer captions={captions} styleVariant={styleVariant} styleOverrides={styleOverrides} />
        )}
        {overlaySettings?.watermarkEnabled && (
          <WatermarkOverlay opacity={overlaySettings.watermarkOpacity} position={overlaySettings.watermarkPosition} />
        )}
        {overlaySettings?.progressBarEnabled && (
          <ProgressBarOverlay color={overlaySettings.progressBarColor} position={overlaySettings.progressBarPosition} />
        )}
      </AbsoluteFill>
    </FrameRenderer>
  );
};
