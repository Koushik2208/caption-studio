import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { FrameContentInset } from "../../frames/types";
import type { CaptionPage } from "../processCaptions";
import type { CaptionStyleOverrides } from "./types";
import { applyKeywordEmphasis, DEFAULT_KEYWORDS, isKeywordToken } from "./applyKeywordEmphasis";
import { getResponsiveFontSize } from "./fontSize";
import { combineTextShadow, getLegibilityShadow } from "./legibility";
import { getPositionStyle } from "./position";

const HIGHLIGHT_COLOR = "#ffd23f";
const OUTLINE_COLOR = "white";

// Outline Draw-on style: every token renders as hollow (transparent fill,
// white stroke) outline text from the start - like SlideUp/Typewriter, all
// tokens are always laid out so line wrapping never reflows. As each token
// becomes active, the fill sweeps from 0% to 100% between that token's
// fromMs and the next token's fromMs (same per-token window Typewriter uses
// for its char reveal) - the distinctive, more stylish option called for in
// PLAN.md Part F Phase 3c. Already-spoken tokens sit fully filled;
// not-yet-reached tokens sit at 0% fill (pure outline).
//
// Single element per token, not two overlaid text nodes: a prior version
// stacked an outline span + an absolutely-positioned fill span and tried to
// keep them pixel-synced by matching stroke widths, but each span is an
// independent glyph render/antialiasing pass and they drift apart token by
// token regardless. Here the fill sweep is a background-clip: text gradient
// with a hard color stop at fillProgress, and WebkitTextStroke draws the
// white outline on the same element - see LEARNINGS.md.
export const OutlineDraw: React.FC<{
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
        }}
      >
        {page.tokens.map((token, i) => {
          let fillProgress = 0;
          if (i < activeIndex) {
            fillProgress = 1;
          } else if (i === activeIndex) {
            const nextFromMs = page.tokens[i + 1]?.fromMs ?? pageEndMs;
            fillProgress = interpolate(
              currentTimeMs,
              [token.fromMs, Math.max(token.fromMs + 1, nextFromMs)],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
          }

          const isKeyword = keywordHighlightEnabled && isKeywordToken(token.text, keywords);
          const emphasis = applyKeywordEmphasis(
            1,
            isKeyword,
            overrides?.highlightIntensity,
            overrides?.keywordColor,
          );

          const fillColor = emphasis.color ?? highlightColor;
          const stopPct = fillProgress * 100;

          return (
            <span
              key={`${token.fromMs}-${i}`}
              style={{
                display: "inline-block",
                fontFamily: overrides?.fontFamily,
                fontWeight: overrides?.fontWeight ?? 700,
                fontStyle: overrides?.fontStyle ?? "normal",
                color: "transparent",
                WebkitTextFillColor: "transparent",
                WebkitTextStroke:
                  overrides?.strokeEnabled === false
                    ? "none"
                    : overrides?.strokeWidth !== undefined || overrides?.strokeColor
                      ? `${overrides?.strokeWidth ?? 2}px ${overrides?.strokeColor ?? (overrides?.textColor ?? OUTLINE_COLOR)}`
                      : `2px ${overrides?.textColor ?? OUTLINE_COLOR}`,
                // backgroundImage (longhand), never the `background` shorthand:
                // this value changes every frame as fillProgress sweeps, and
                // re-assigning the `background` shorthand silently resets
                // background-clip back to border-box every time it's
                // rewritten. React only re-writes DOM style properties whose
                // value changed since the last render - backgroundClip's
                // value ("text") never changes frame to frame, so React
                // stops re-applying it after frame 1, while `background`
                // (if used) keeps getting reapplied every frame and keeps
                // clobbering the clip back to border-box. backgroundImage
                // has no such sub-properties to reset, so this is safe. See
                // LEARNINGS.md.
                backgroundImage: `linear-gradient(to right, ${fillColor} 0%, ${fillColor} ${stopPct}%, transparent ${stopPct}%, transparent 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                // Keyword emphasis is applied as a real fontSize bump, not a
                // CSS transform: scale() - transform doesn't reflow, so a
                // scaled-up word would visually spill into its neighbor's
                // box instead of the browser reserving extra space for it.
                fontSize: fontSize * emphasis.scale,
                textShadow: combineTextShadow(getLegibilityShadow(fontSize, overrides?.shadowEnabled !== false), emphasis.textShadow),
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
