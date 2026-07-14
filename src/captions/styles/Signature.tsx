import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { FrameContentInset } from "../../frames/types";
import type { CaptionPage } from "../processCaptions";
import type { CaptionStyleOverrides } from "./types";
import { applyKeywordEmphasis, DEFAULT_KEYWORDS, isKeywordToken } from "./applyKeywordEmphasis";
import { getResponsiveFontSize } from "./fontSize";
import { getPositionStyle } from "./position";

const HIGHLIGHT_COLOR = "#ffd23f";

// Signature style: word pop (spring scale-in on the active word) + karaoke
// fill (already-spoken words stay in the highlight color).
export const Signature: React.FC<{
  page: CaptionPage;
  overrides?: CaptionStyleOverrides;
  contentInset?: FrameContentInset;
}> = ({ page, overrides, contentInset }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const fontSize = getResponsiveFontSize(height, overrides?.fontSizeMultiplier);
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
    <AbsoluteFill style={getPositionStyle(overrides?.position, height, contentInset)}>
      <div
        style={{
          fontSize,
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
          const isActive = i === activeIndex;

          const activeStartFrame = Math.round(
            ((token.fromMs - page.startMs) / 1000) * fps,
          );
          const pop = isActive
            ? spring({
                fps,
                frame: Math.max(0, frame - activeStartFrame),
                durationInFrames: 10,
                config: { damping: 12, mass: 0.5, stiffness: 200 },
              })
            : 0;
          const scale = isActive ? interpolate(pop, [0, 1], [0.7, 1]) : 1;

          const isKeyword = keywordHighlightEnabled && isKeywordToken(token.text, keywords);
          const emphasis = applyKeywordEmphasis(
            scale,
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
