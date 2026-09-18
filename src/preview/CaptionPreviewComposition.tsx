import { AbsoluteFill, Audio, Video, useVideoConfig } from 'remotion';
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
import { BackgroundEffectsRenderer } from '../textures/BackgroundEffectsRenderer';
import type { MotionGraphicsSettings } from '../motion/types';
import { MotionGraphicsRenderer } from '../motion/MotionGraphicsRenderer';

export type CaptionPreviewProps = {
  captions: Caption[] | null;
  mediaUrl: string | null;
  mediaKind: 'video' | 'audio' | null;
  styleVariant?: CaptionStyleVariant;
  styleOverrides?: CaptionStyleOverrides;
  overlaySettings?: OverlaySettings;
  frameSettings?: FrameSettings;
  textureSettings?: TextureOverlaySettings;
  motionSettings?: MotionGraphicsSettings;
  // Per-frame RMS amplitude driving Audio-Reactive Pulse - see
  // src/textures/AudioPulse.tsx and ProjectContext's audioAmplitude state.
  audioAmplitude?: number[] | null;
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
  motionSettings,
  audioAmplitude,
}) => {
  const { width, height } = useVideoConfig();
  const frameContentInset = getFrameContentInset(frameSettings, height, width);
  // Frames whose chrome occupies real space (e.g. Cinematic Scope's
  // letterbox bars, Film Strip's sprocket rails) render their chrome as a
  // sibling painted after `children` in FrameRenderer, so without an
  // explicit z-index this layer would paint underneath them. Elevate
  // captions/overlays above that chrome only when there's an inset to clear
  // on any edge - frames with zero inset (Minimal Bezel, Square Bezel,
  // Gradient Border, Neon Glow, Vintage Projector, none) keep their existing
  // z-index:auto stacking, unchanged from before.
  const hasFrameInset =
    frameContentInset.top > 0 ||
    frameContentInset.bottom > 0 ||
    frameContentInset.left > 0 ||
    frameContentInset.right > 0;

  const mediaElement = (
    <>
      {mediaUrl && mediaKind === 'video' && (
        <BackgroundEffectsRenderer
          textureSettings={textureSettings}
          audioAmplitude={audioAmplitude}
          captions={captions}
          styleOverrides={styleOverrides}
        >
          <Video src={mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </BackgroundEffectsRenderer>
      )}
      {mediaUrl && mediaKind === 'audio' && <Audio src={mediaUrl} />}
    </>
  );

  const textureElement = <TextureOverlayRenderer textureSettings={textureSettings} />;

  const captionElement =
    captions && captions.length > 0 ? (
      <CaptionRenderer
        captions={captions}
        styleVariant={styleVariant}
        styleOverrides={styleOverrides}
        frameContentInset={frameContentInset}
      />
    ) : null;

  const overlayElement = (
    <>
      {overlaySettings?.watermarkEnabled && (
        <WatermarkOverlay opacity={overlaySettings.watermarkOpacity} position={overlaySettings.watermarkPosition} />
      )}
      {overlaySettings?.progressBarEnabled && (
        <ProgressBarOverlay color={overlaySettings.progressBarColor} position={overlaySettings.progressBarPosition} />
      )}
      <MotionGraphicsRenderer motionSettings={motionSettings} />
    </>
  );

  return (
    <FrameRenderer
      frameSettings={frameSettings}
      media={mediaElement}
      captions={captionElement}
      overlays={overlayElement}
      textures={textureElement}
    >
      <AbsoluteFill style={{ backgroundColor: 'black' }}>
        {mediaElement}
        {textureElement}
        <AbsoluteFill style={hasFrameInset ? { zIndex: 1 } : undefined}>
          {captionElement}
          {overlayElement}
        </AbsoluteFill>
      </AbsoluteFill>
    </FrameRenderer>
  );
};
