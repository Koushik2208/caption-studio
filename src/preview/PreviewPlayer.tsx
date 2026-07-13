import { Player } from '@remotion/player';
import { useLayout } from '../context/LayoutContext';
import { useProject } from '../context/ProjectContext';
import { CaptionPreviewComposition } from './CaptionPreviewComposition';
import { CaptionExportComposition } from './CaptionExportComposition';
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
  } = useProject();
  const mediaDurationFrames = useMediaDurationFrames(mediaUrl, FPS);
  const mediaKind = mediaFile ? (mediaFile.type.startsWith('audio/') ? 'audio' : 'video') : null;
  const { width, height } = layoutMode === 'horizontal' ? HORIZONTAL_DIMENSIONS : VERTICAL_DIMENSIONS;

  // Dev-workflow convenience: a cached transcript can restore captions
  // without a re-uploaded media file (see ProjectContext). With no media to
  // play, render the same chroma-key background CaptionExportComposition
  // uses on export instead of a blank/black player.
  const hasCaptions = !!captions && captions.length > 0;
  if (!mediaUrl && hasCaptions) {
    const durationInFrames = Math.max(1, Math.round((captions[captions.length - 1].endMs / 1000) * FPS));
    return (
      <Player
        component={CaptionExportComposition}
        inputProps={{ captions, styleVariant, styleOverrides, overlaySettings, frameSettings, textureSettings }}
        durationInFrames={durationInFrames}
        compositionWidth={width}
        compositionHeight={height}
        fps={FPS}
        controls
        style={{ width: '100%', height: '100%' }}
        className={className}
      />
    );
  }

  return (
    <Player
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
      }}
      durationInFrames={mediaUrl ? mediaDurationFrames : FALLBACK_DURATION_FRAMES}
      compositionWidth={width}
      compositionHeight={height}
      fps={FPS}
      controls
      style={{ width: '100%', height: '100%' }}
      className={className}
    />
  );
};
