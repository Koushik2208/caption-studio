import { useCurrentFrame, useVideoConfig } from 'remotion';
import type { Caption } from '@remotion/captions';
import { processCaptions } from '../captions/processCaptions';
import { DEFAULT_KEYWORDS, isKeywordToken } from '../captions/styles/applyKeywordEmphasis';
import type { OverlayIntensity, TextureOverlaySettings } from './types';

// Short (~6-10 frame) window, matching the spec - long enough to read as a
// punch, short enough to stay emphasis rather than chaos.
const PUNCH_DURATION_FRAMES = 8;
const ZOOM_RANGE: Record<OverlayIntensity, number> = { low: 0.02, medium: 0.04, high: 0.07 };
const BLUR_RANGE: Record<OverlayIntensity, number> = { low: 1, medium: 2, high: 4 };
const BRIGHTNESS_RANGE: Record<OverlayIntensity, number> = { low: 0.05, medium: 0.1, high: 0.18 };

type KeywordPunchProps = {
  textureSettings?: TextureOverlaySettings;
  captions?: Caption[] | null;
  keywordHighlightEnabled?: boolean;
  keywords?: string[];
  children: React.ReactNode;
};

// Wraps the video/background layer in a brief zoom + blur + brightness punch
// timed exactly to each keyword token's fromMs (reusing the same
// isKeywordToken check the caption styles use), so the emphasis lands in
// sync with the highlighted word rather than approximating it.
export const KeywordPunch: React.FC<KeywordPunchProps> = ({
  textureSettings,
  captions,
  keywordHighlightEnabled,
  keywords,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (
    !textureSettings?.keywordPunchEnabled ||
    !keywordHighlightEnabled ||
    !captions ||
    captions.length === 0
  ) {
    return <>{children}</>;
  }

  const rawIntensity = textureSettings.keywordPunchIntensity;
  const intensity: OverlayIntensity = (rawIntensity && ZOOM_RANGE[rawIntensity]) ? rawIntensity : 'medium';
  const activeKeywords = keywords ?? DEFAULT_KEYWORDS;

  const pages = processCaptions(captions, fps);
  let envelope = 0;
  for (const page of pages) {
    for (const token of page.tokens) {
      if (!isKeywordToken(token.text, activeKeywords)) continue;
      const startFrame = Math.round((token.fromMs / 1000) * fps);
      const delta = frame - startFrame;
      if (delta < 0 || delta >= PUNCH_DURATION_FRAMES) continue;
      // Sine envelope: 0 at both edges of the window, peak at the middle -
      // a clean short pulse instead of a hard cut in/out.
      const t = delta / PUNCH_DURATION_FRAMES;
      envelope = Math.max(envelope, Math.sin(Math.PI * t));
    }
  }

  if (envelope === 0) {
    return <>{children}</>;
  }

  const scale = 1 + envelope * ZOOM_RANGE[intensity];
  const blurPx = envelope * BLUR_RANGE[intensity];
  const brightness = 1 + envelope * BRIGHTNESS_RANGE[intensity];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        transform: `scale(${scale})`,
        filter: `blur(${blurPx}px) brightness(${brightness})`,
      }}
    >
      {children}
    </div>
  );
};
