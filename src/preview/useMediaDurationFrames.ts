import { useEffect, useState } from 'react';

// Shown until the real media duration loads (or if there's no media yet).
const FALLBACK_DURATION_FRAMES = 150;

// Player requires a fixed durationInFrames; reading it off a detached <video>
// element works for audio-only files too (duration metadata loads the same
// way), so one element covers both media kinds.
export const useMediaDurationFrames = (mediaUrl: string | null, fps: number): number => {
  const [durationFrames, setDurationFrames] = useState(FALLBACK_DURATION_FRAMES);

  useEffect(() => {
    if (!mediaUrl) {
      setDurationFrames(FALLBACK_DURATION_FRAMES);
      return;
    }

    const el = document.createElement('video');
    el.preload = 'metadata';
    el.src = mediaUrl;

    const onLoadedMetadata = () => {
      if (Number.isFinite(el.duration) && el.duration > 0) {
        setDurationFrames(Math.max(1, Math.round(el.duration * fps)));
      }
    };
    el.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      el.removeEventListener('loadedmetadata', onLoadedMetadata);
      el.src = '';
    };
  }, [mediaUrl, fps]);

  return durationFrames;
};
