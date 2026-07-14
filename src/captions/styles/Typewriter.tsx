import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { FrameContentInset } from "../../frames/types";
import type { CaptionPage } from "../processCaptions";
import type { CaptionStyleOverrides } from "./types";
import { applyKeywordEmphasis, DEFAULT_KEYWORDS, isKeywordToken } from "./applyKeywordEmphasis";
import { getResponsiveFontSize } from "./fontSize";
import { combineTextShadow, getLegibilityShadow, getLegibilityStroke } from "./legibility";
import { getPositionStyle } from "./position";

const HIGHLIGHT_COLOR = "#ffd23f";
const CURSOR_BLINK_FRAMES = 10;

// Typewriter style: characters reveal left to right as each word is spoken,
// no spring/bounce - highest contrast against Signature's pop-in (PLAN.md
// Part F, Phase 3a). Words already spoken render in full; the active word
// reveals character-by-character between its own fromMs and the next
// token's fromMs; unspoken words aren't rendered yet.
export const Typewriter: React.FC<{
  page: CaptionPage;
  overrides?: CaptionStyleOverrides;
  contentInset?: FrameContentInset;
}> = ({ page, overrides, contentInset }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const fontSize = getResponsiveFontSize(height, overrides?.fontSizeMultiplier);
  const currentTimeMs = page.startMs + (frame / fps) * 1000;
  const pageEndMs = page.startMs + (page.durationInFrames / fps) * 1000;

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
  const isTyping = frame % (CURSOR_BLINK_FRAMES * 2) < CURSOR_BLINK_FRAMES;

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
          WebkitTextStroke: getLegibilityStroke(fontSize),
          paintOrder: "stroke fill",
        }}
      >
        {page.tokens.map((token, i) => {
          if (i > activeIndex) return null;

          const spoken = i < activeIndex;
          let charsToShow = token.text.length;
          if (!spoken) {
            const nextFromMs = page.tokens[i + 1]?.fromMs ?? pageEndMs;
            charsToShow = Math.round(
              interpolate(currentTimeMs, [token.fromMs, Math.max(token.fromMs + 1, nextFromMs)], [0, token.text.length], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            );
          }
          if (charsToShow === 0) return null;

          const stillTyping = !spoken && charsToShow < token.text.length;
          const isKeyword = keywordHighlightEnabled && isKeywordToken(token.text, keywords);
          const emphasis = applyKeywordEmphasis(1, isKeyword, overrides?.highlightIntensity, overrides?.keywordColor);

          return (
            <span
              key={`${token.fromMs}-${i}`}
              style={{
                display: "inline-block",
                color: emphasis.color ?? highlightColor,
                textShadow: combineTextShadow(getLegibilityShadow(fontSize), emphasis.textShadow),
                transform: `scale(${emphasis.scale})`,
              }}
            >
              {token.text.slice(0, charsToShow)}
              {stillTyping && (
                <span style={{ opacity: isTyping ? 1 : 0, color: "white" }}>{"▌"}</span>
              )}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
