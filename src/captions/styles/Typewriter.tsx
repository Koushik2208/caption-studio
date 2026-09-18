import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { FrameContentInset } from "../../frames/types";
import type { CaptionPage } from "../processCaptions";
import type { CaptionStyleOverrides } from "./types";
import { applyKeywordEmphasis, DEFAULT_KEYWORDS, isKeywordToken } from "./applyKeywordEmphasis";
import { getResponsiveFontSize } from "./fontSize";
import { getCaptionEffectStyle, getCaptionFillStyle, getLegibilityStroke } from "./legibility";
import { formatCaptionToken, getCaptionContainerStyle, getPositionStyle } from "./position";
import { resolveWordTypography } from "./wordOverrides";

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

  const keywordHighlightEnabled = overrides?.keywordHighlightEnabled ?? false;
  const keywords = overrides?.keywords ?? DEFAULT_KEYWORDS;
  const isTyping = frame % (CURSOR_BLINK_FRAMES * 2) < CURSOR_BLINK_FRAMES;

  return (
    <AbsoluteFill style={getPositionStyle(overrides?.position, height, contentInset, overrides?.customPositionY, overrides?.textAlign)}>
      <div style={getCaptionContainerStyle(overrides, fontSize)}>
        {page.tokens.map((token, i) => {
          if (i > activeIndex) return null;

          const { cleanText, needsSpace } = formatCaptionToken(token.text, i);
          if (!cleanText) return null;

          const spoken = i < activeIndex;
          let charsToShow = cleanText.length;
          if (!spoken) {
            const nextFromMs = page.tokens[i + 1]?.fromMs ?? pageEndMs;
            charsToShow = Math.round(
              interpolate(currentTimeMs, [token.fromMs, Math.max(token.fromMs + 1, nextFromMs)], [0, cleanText.length], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            );
          }
          if (charsToShow === 0) return null;

          const stillTyping = !spoken && charsToShow < cleanText.length;
          const isKeyword = keywordHighlightEnabled && isKeywordToken(token.text, keywords);
          const emphasis = applyKeywordEmphasis(1, isKeyword, overrides?.highlightIntensity, overrides?.keywordColor);
          const wordTypo = resolveWordTypography(token, fontSize, overrides);
          const hasExplicitColor = !!emphasis.color || !!wordTypo.customColor;
          const isGradient = !hasExplicitColor && !!overrides?.gradientEnabled;
          const tokenColor = emphasis.color ?? (wordTypo.customColor ?? (overrides?.textColor ?? "white"));
          const fillStyle = getCaptionFillStyle(tokenColor, hasExplicitColor, overrides);
          const effectStyle = getCaptionEffectStyle(wordTypo.fontSize, isGradient, overrides, emphasis.textShadow);

          return (
            <React.Fragment key={`${token.fromMs}-${i}`}>
              {needsSpace && " "}
              <span
                style={{
                  display: "inline-block",
                  fontFamily: wordTypo.fontFamily,
                  fontWeight: wordTypo.fontWeight,
                  fontStyle: wordTypo.fontStyle,
                  fontSize: wordTypo.fontSize,
                  WebkitTextStroke: getLegibilityStroke(wordTypo.fontSize, overrides),
                  paintOrder: "stroke fill",
                  ...fillStyle,
                  ...effectStyle,
                  transform: `scale(${emphasis.scale})`,
                }}
              >
                {cleanText.slice(0, charsToShow)}
                {stillTyping && (
                  <span style={{ opacity: isTyping ? 1 : 0, color: wordTypo.customColor ?? (overrides?.textColor ?? "white") }}>{"▌"}</span>
                )}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
