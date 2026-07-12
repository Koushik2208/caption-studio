import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionPage } from "../processCaptions";
import type { CaptionStyleOverrides } from "./types";
import { applyKeywordEmphasis, DEFAULT_KEYWORDS, isKeywordToken } from "./applyKeywordEmphasis";

const FONT_SIZE = 85;
const HIGHLIGHT_COLOR = "#ffd23f";
const SLIDE_DISTANCE_PX = 30;
const ANIM_DURATION_FRAMES = 12;

// Slide-up style: each word slides up + fades in as it becomes active, then
// settles - medium-energy middle ground between Signature's bouncy scale-pop
// and Typewriter's flat character reveal (PLAN.md Part F, Phase 3b). Every
// token is always rendered (like Signature's karaoke fill) so line wrapping
// never reflows; tokens not yet reached just sit at progress 0 (invisible,
// offset below their resting position) until their own fromMs arrives.
export const SlideUp: React.FC<{ page: CaptionPage; overrides?: CaptionStyleOverrides }> = ({
  page,
  overrides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeMs = page.startMs + (frame / fps) * 1000;

  // Active token = LAST token with fromMs <= currentTimeMs (never a from/to range check).
  let activeIndex = -1;
  for (let i = 0; i < page.tokens.length; i++) {
    if (page.tokens[i].fromMs <= currentTimeMs) {
      activeIndex = i;
    }
  }

  const highlightColor = overrides?.highlightColor ?? HIGHLIGHT_COLOR;
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
        }}
      >
        {page.tokens.map((token, i) => {
          const spoken = activeIndex >= 0 && i <= activeIndex;

          const tokenStartFrame = Math.round(
            ((token.fromMs - page.startMs) / 1000) * fps,
          );
          const progress = spring({
            fps,
            frame: Math.max(0, frame - tokenStartFrame),
            durationInFrames: ANIM_DURATION_FRAMES,
            config: { damping: 15, mass: 0.5, stiffness: 150 },
          });
          const opacity = Math.min(1, Math.max(0, progress));
          const translateY = interpolate(progress, [0, 1], [SLIDE_DISTANCE_PX, 0]);

          const isKeyword = keywordHighlightEnabled && isKeywordToken(token.text, keywords);
          const emphasis = applyKeywordEmphasis(
            1,
            isKeyword,
            overrides?.highlightIntensity,
            overrides?.keywordColor,
          );

          return (
            <span
              key={`${token.fromMs}-${i}`}
              style={{
                display: "inline-block",
                color: emphasis.color ?? (spoken ? highlightColor : "white"),
                textShadow: emphasis.textShadow,
                opacity,
                transform: `translateY(${translateY}px) scale(${emphasis.scale})`,
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
