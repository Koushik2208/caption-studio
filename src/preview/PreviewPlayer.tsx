import { Player } from '@remotion/player';
import { useLayout } from '../context/LayoutContext';
import { useProject } from '../context/ProjectContext';
import { CaptionPreviewComposition } from './CaptionPreviewComposition';
import { useMediaDurationFrames } from './useMediaDurationFrames';

// Base resolution is 1080x1920 vertical per CLAUDE.md; horizontal swaps to
// 1920x1080 (see LayoutContext) rather than letterboxing a fixed vertical
// canvas inside a wider container.
const FPS = 30;
const VERTICAL_DIMENSIONS = { width: 1080, height: 1920 };
const HORIZONTAL_DIMENSIONS = { width: 1920, height: 1080 };
const FALLBACK_DURATION_FRAMES = 150;

type PreviewPlayerProps = {
  className?: string;
};

// Reads captions/style/overlay directly from ProjectContext rather than
// taking them as props - this is the one preview component every tab
// (Import/Style/Overlay/Export) renders, so a change on any tab shows up
// identically everywhere instead of each page needing to thread its own
// copy of the same state through.
export const PreviewPlayer: React.FC<PreviewPlayerProps> = ({ className }) => {
  const { layoutMode } = useLayout();
  const {
    mediaFile,
    mediaUrl,
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
    currentCreativeProject,
  } = useProject();
  const mediaDurationFrames = useMediaDurationFrames(mediaUrl, FPS);
  const mediaKind = mediaFile ? (mediaFile.type.startsWith('audio/') ? 'audio' : 'video') : null;
  const { width, height } = layoutMode === 'horizontal' ? HORIZONTAL_DIMENSIONS : VERTICAL_DIMENSIONS;

  // Derive duration: use uploaded media duration if available, otherwise read
  // durationInFrames from loaded Creative JSON or the last caption's endMs.
  const hasCaptions = !!captions && captions.length > 0;
  const projectDurationFrames =
    currentCreativeProject?.durationInFrames ??
    (hasCaptions
      ? Math.max(1, Math.round((captions[captions.length - 1].endMs / 1000) * FPS))
      : FALLBACK_DURATION_FRAMES);
  const durationInFrames = mediaUrl ? mediaDurationFrames : projectDurationFrames;

  return (
    <Player
      acknowledgeRemotionLicense
      numberOfSharedAudioTags={12}
      component={CaptionPreviewComposition}
      inputProps={{
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
      }}
      durationInFrames={durationInFrames}
      compositionWidth={width}
      compositionHeight={height}
      fps={FPS}
      controls
      style={{ width: '100%', height: '100%' }}
      className={className}
    />
  );
};
