import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionPage } from "../processCaptions";
import type { CaptionStyleOverrides } from "./types";
import { applyKeywordEmphasis, DEFAULT_KEYWORDS, isKeywordToken } from "./applyKeywordEmphasis";

const FONT_SIZE = 85;
const FADE_MS = 200;

// Calm caption style: the whole phrase fades in/out as one block, no
// per-word pop or karaoke fill - alternated with the energetic style per
// scene (`captionMode`) so word-by-word bounce stays special (PLAN.md B1 #3).
export const CalmPhrase: React.FC<{ page: CaptionPage; overrides?: CaptionStyleOverrides }> = ({
  page,
  overrides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsedMs = (frame / fps) * 1000;
  const durationMs = (page.durationInFrames / fps) * 1000;

  const opacity = interpolate(
    elapsedMs,
    [0, FADE_MS, Math.max(FADE_MS + 1, durationMs - FADE_MS), durationMs],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const baseColor = overrides?.highlightColor ?? "white";
  const keywordHighlightEnabled = overrides?.keywordHighlightEnabled ?? false;
  const keywords = overrides?.keywords ?? DEFAULT_KEYWORDS;

  return (
    <AbsoluteFill
      style={{
        justifyContent: overrides?.justifyContent ?? "center",
        alignItems: overrides?.alignItems ?? "center",
      }}
    >
      <div
        style={{
          fontSize: FONT_SIZE,
          fontWeight: overrides?.fontWeight ?? 700,
          fontStyle: overrides?.fontStyle ?? "normal",
          fontFamily: overrides?.fontFamily ?? "Arial, sans-serif",
          textAlign: "center",
          whiteSpace: "pre-wrap",
          maxWidth: "85%",
          lineHeight: 1.15,
          WebkitTextStroke: "3px black",
          paintOrder: "stroke fill",
          opacity,
        }}
      >
        {page.tokens.map((token, i) => {
          const isKeyword = keywordHighlightEnabled && isKeywordToken(token.text, keywords);
          const emphasis = applyKeywordEmphasis(1, isKeyword, overrides?.highlightIntensity, overrides?.keywordColor);

          return (
            <span
              key={`${token.fromMs}-${i}`}
              style={{
                display: "inline-block",
                color: emphasis.color ?? baseColor,
                textShadow: emphasis.textShadow,
                transform: `scale(${emphasis.scale})`,
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
