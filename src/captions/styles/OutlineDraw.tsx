import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { FrameContentInset } from "../../frames/types";
import type { CaptionPage } from "../processCaptions";
import type { CaptionStyleOverrides } from "./types";
import { applyKeywordEmphasis, DEFAULT_KEYWORDS, isKeywordToken } from "./applyKeywordEmphasis";
import { getResponsiveFontSize } from "./fontSize";
import { getCaptionEffectStyle } from "./legibility";
import { formatCaptionToken, getCaptionContainerStyle, getPositionStyle } from "./position";
import { resolveWordTypography } from "./wordOverrides";

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
    <AbsoluteFill style={getPositionStyle(overrides?.position, height, contentInset, overrides?.customPositionY, overrides?.textAlign)}>
      <div style={getCaptionContainerStyle(overrides, fontSize)}>
        {page.tokens.map((token, i) => {
          const { cleanText, needsSpace } = formatCaptionToken(token.text, i);
          if (!cleanText) return null;

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

          const wordTypo = resolveWordTypography(token, fontSize, overrides);
          const hasExplicitColor = !!emphasis.color || !!wordTypo.customColor;
          const fillColor = emphasis.color ?? (wordTypo.customColor ?? highlightColor);
          const outlineStrokeColor = wordTypo.customColor ?? (overrides?.textColor ?? OUTLINE_COLOR);
          const stopPct = fillProgress * 100;
          const tokenFontSize = wordTypo.fontSize * emphasis.scale;

          let bgImage: string;
          if (hasExplicitColor || !overrides?.gradientEnabled) {
            bgImage = `linear-gradient(to right, ${fillColor} 0%, ${fillColor} ${stopPct}%, transparent ${stopPct}%, transparent 100%)`;
          } else {
            const start = overrides.gradientStart ?? '#FFFFFF';
            const end = overrides.gradientEnd ?? '#10B981';
            const angle = overrides.gradientAngle ?? 90;
            if (fillProgress >= 1) {
              bgImage = `linear-gradient(${angle}deg, ${start}, ${end})`;
            } else if (fillProgress <= 0) {
              bgImage = 'none';
            } else {
              bgImage = `linear-gradient(to right, ${start} 0%, ${end} ${stopPct}%, transparent ${stopPct}%, transparent 100%)`;
            }
          }

          const effectStyle = getCaptionEffectStyle(tokenFontSize, true, overrides, emphasis.textShadow);

          return (
            <React.Fragment key={`${token.fromMs}-${i}`}>
              {needsSpace && " "}
              <span
                style={{
                  display: "inline-block",
                  fontFamily: wordTypo.fontFamily,
                  fontWeight: wordTypo.fontWeight,
                  fontStyle: wordTypo.fontStyle,
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                  WebkitTextStroke:
                    overrides?.strokeEnabled === false
                      ? "none"
                      : overrides?.strokeWidth !== undefined || overrides?.strokeColor
                        ? `${overrides?.strokeWidth ?? 2}px ${overrides?.strokeColor ?? outlineStrokeColor}`
                        : `2px ${outlineStrokeColor}`,
                  backgroundImage: bgImage,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  fontSize: tokenFontSize,
                  ...effectStyle,
                }}
              >
                {cleanText}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
