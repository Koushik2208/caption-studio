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
import type { VideoMotionSettings } from '../videoMotion/types';
import type { AssetSettings } from '../assets/types';
import { TransitionOverlayRenderer } from '../assets/TransitionOverlayRenderer';
import { SfxRenderer } from '../assets/SfxRenderer';

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
  videoMotion?: VideoMotionSettings;
  assetSettings?: AssetSettings;
  // Per-frame RMS amplitude driving Audio-Reactive Pulse - see
  // src/textures/AudioPulse.tsx and ProjectContext's audioAmplitude state.
  audioAmplitude?: number[] | null;
};

// DaVinci Resolve Ultra Key-compatible chroma green for no-media creative preview
const CHROMA_GREEN = '#00B140';

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
  videoMotion,
  assetSettings,
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
      {mediaUrl && mediaKind === 'video' ? (
        <BackgroundEffectsRenderer
          textureSettings={textureSettings}
          videoMotion={videoMotion}
          audioAmplitude={audioAmplitude}
          captions={captions}
          styleOverrides={styleOverrides}
        >
          <Video src={mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </BackgroundEffectsRenderer>
      ) : mediaUrl && mediaKind === 'audio' ? (
        <BackgroundEffectsRenderer
          textureSettings={textureSettings}
          videoMotion={videoMotion}
          audioAmplitude={audioAmplitude}
          captions={captions}
          styleOverrides={styleOverrides}
        >
          <AbsoluteFill style={{ backgroundColor: CHROMA_GREEN }} />
          <Audio src={mediaUrl} />
        </BackgroundEffectsRenderer>
      ) : (
        <BackgroundEffectsRenderer
          textureSettings={textureSettings}
          videoMotion={videoMotion}
          audioAmplitude={audioAmplitude}
          captions={captions}
          styleOverrides={styleOverrides}
        >
          <AbsoluteFill style={{ backgroundColor: CHROMA_GREEN }} />
        </BackgroundEffectsRenderer>
      )}
    </>
  );

  const textureElement = <TextureOverlayRenderer textureSettings={textureSettings} />;

  const assetOverlaysElement = (
    <TransitionOverlayRenderer placements={assetSettings?.transitionOverlays} />
  );

  const sfxElement = (
    <SfxRenderer placements={assetSettings?.soundEffects} />
  );

  const captionElement =
    captions && captions.length > 0 ? (
      <CaptionRenderer
        captions={captions}
        styleVariant={styleVariant}
        styleOverrides={styleOverrides}
        frameContentInset={frameContentInset}
      />
    ) : null;

  const watermarkElement = overlaySettings?.watermarkEnabled ? (
    <WatermarkOverlay
      opacity={overlaySettings.watermarkOpacity}
      position={overlaySettings.watermarkPosition}
      size={overlaySettings.watermarkSize}
      imageSrc={overlaySettings.watermarkUrl}
    />
  ) : null;

  const otherOverlaysElement = (
    <>
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
      overlays={
        <>
          {watermarkElement}
          {otherOverlaysElement}
        </>
      }
      textures={textureElement}
      assetOverlays={assetOverlaysElement}
      sfx={sfxElement}
    >
      <AbsoluteFill style={{ backgroundColor: !mediaUrl ? CHROMA_GREEN : 'black' }}>
        {mediaElement}
        {textureElement}
        {assetOverlaysElement}
        {sfxElement}
        {watermarkElement}
        <AbsoluteFill style={hasFrameInset ? { zIndex: 1 } : undefined}>
          {captionElement}
          {otherOverlaysElement}
        </AbsoluteFill>
      </AbsoluteFill>
    </FrameRenderer>
  );
};
