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
import { BackgroundEffectsRenderer } from '../textures/BackgroundEffectsRenderer';
import type { MotionGraphicsSettings } from '../motion/types';
import { MotionGraphicsRenderer } from '../motion/MotionGraphicsRenderer';
import type { VideoMotionSettings } from '../videoMotion/types';
import type { AssetSettings } from '../assets/types';
import { TransitionOverlayRenderer } from '../assets/TransitionOverlayRenderer';
import { SfxRenderer } from '../assets/SfxRenderer';

// DaVinci Resolve Ultra Key-compatible chroma green (see PLAN.md Part E).
const CHROMA_GREEN = '#00B140';

export type CaptionExportProps = {
  captions: Caption[];
  styleVariant?: CaptionStyleVariant;
  styleOverrides?: CaptionStyleOverrides;
  overlaySettings?: OverlaySettings;
  frameSettings?: FrameSettings;
  textureSettings?: TextureOverlaySettings;
  motionSettings?: MotionGraphicsSettings;
  videoMotion?: VideoMotionSettings;
  assetSettings?: AssetSettings;
  audioAmplitude?: number[] | null;
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
  motionSettings,
  videoMotion,
  assetSettings,
  audioAmplitude,
}) => {
  const { width, height } = useVideoConfig();
  const frameContentInset = getFrameContentInset(frameSettings, height, width);
  // See CaptionPreviewComposition - only elevate above frame chrome when
  // that chrome actually occupies space on any edge (e.g. Cinematic Scope's
  // letterbox bars, Film Strip's sprocket rails); other frames keep their
  // existing z-index:auto stacking.
  const hasFrameInset =
    frameContentInset.top > 0 ||
    frameContentInset.bottom > 0 ||
    frameContentInset.left > 0 ||
    frameContentInset.right > 0;

  const mediaElement = (
    <BackgroundEffectsRenderer
      textureSettings={textureSettings}
      videoMotion={videoMotion}
      audioAmplitude={audioAmplitude}
      captions={captions}
      styleOverrides={styleOverrides}
    >
      <AbsoluteFill style={{ backgroundColor: CHROMA_GREEN }} />
    </BackgroundEffectsRenderer>
  );

  const textureElement = <TextureOverlayRenderer textureSettings={textureSettings} />;

  const assetOverlaysElement = (
    <TransitionOverlayRenderer placements={assetSettings?.transitionOverlays} />
  );

  const sfxElement = (
    <SfxRenderer placements={assetSettings?.soundEffects} />
  );

  const captionElement = (
    <CaptionRenderer
      captions={captions}
      styleVariant={styleVariant}
      styleOverrides={styleOverrides}
      frameContentInset={frameContentInset}
    />
  );

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
      <AbsoluteFill>
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
