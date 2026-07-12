import { Player } from '@remotion/player';
import { useProject } from '../context/ProjectContext';
import { CaptionPreviewComposition } from './CaptionPreviewComposition';
import { useMediaDurationFrames } from './useMediaDurationFrames';

// Non-negotiable per CLAUDE.md: vertical 1080x1920, 30fps. Horizontal is a
// later pass - this Player is vertical-only for now.
const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

type PreviewPlayerProps = {
  className?: string;
};

// Reads captions/style/overlay directly from ProjectContext rather than
// taking them as props - this is the one preview component every tab
// (Import/Style/Overlay/Export) renders, so a change on any tab shows up
// identically everywhere instead of each page needing to thread its own
// copy of the same state through.
export const PreviewPlayer: React.FC<PreviewPlayerProps> = ({ className }) => {
  const { mediaFile, mediaUrl, captions, styleVariant, styleOverrides, overlaySettings } = useProject();
  const durationInFrames = useMediaDurationFrames(mediaUrl, FPS);
  const mediaKind = mediaFile ? (mediaFile.type.startsWith('audio/') ? 'audio' : 'video') : null;

  return (
    <Player
      component={CaptionPreviewComposition}
      inputProps={{ captions, mediaUrl, mediaKind, styleVariant, styleOverrides, overlaySettings }}
      durationInFrames={durationInFrames}
      compositionWidth={WIDTH}
      compositionHeight={HEIGHT}
      fps={FPS}
      controls
      style={{ width: '100%', height: '100%' }}
      className={className}
    />
  );
};
