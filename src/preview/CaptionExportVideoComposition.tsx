import { AbsoluteFill, OffthreadVideo, useVideoConfig } from 'remotion';
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

export type CaptionExportVideoProps = {
  captions: Caption[];
  // Absolute local filesystem path to the uploaded source video - server.ts
  // saves the upload to disk and passes its path straight through, since
  // OffthreadVideo extracts frames via its own ffmpeg-backed pipeline rather
  // than a browser <video> element, so it doesn't need an HTTP-servable URL.
  mediaUrl: string;
  styleVariant?: CaptionStyleVariant;
  styleOverrides?: CaptionStyleOverrides;
  overlaySettings?: OverlaySettings;
  frameSettings?: FrameSettings;
  textureSettings?: TextureOverlaySettings;
  motionSettings?: MotionGraphicsSettings;
  videoMotion?: VideoMotionSettings;
  assetSettings?: AssetSettings;
  audioAmplitude?: number[] | null;
  // Read by Root.tsx's calculateMetadata, not by this component.
  durationInFrames?: number;
  orientation?: 'vertical' | 'horizontal';
};

// Real-footage export composition: same layer stack as
// CaptionPreviewComposition (video + captions + frame/texture/motion
// overlays), swapping <Video> for <OffthreadVideo> since this renders
// server-side via renderMedia() instead of in the browser <Player>.
export const CaptionExportVideoComposition: React.FC<CaptionExportVideoProps> = ({
  captions,
  mediaUrl,
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
  // that chrome actually occupies space on any edge.
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
      <OffthreadVideo src={mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
      assetOverlays={assetOverlaysElement}
    >
      <AbsoluteFill style={{ backgroundColor: 'black' }}>
        {mediaElement}
        {textureElement}
        {assetOverlaysElement}
        {sfxElement}
        <AbsoluteFill style={hasFrameInset ? { zIndex: 1 } : undefined}>
          {captionElement}
          {overlayElement}
        </AbsoluteFill>
      </AbsoluteFill>
    </FrameRenderer>
  );
};
