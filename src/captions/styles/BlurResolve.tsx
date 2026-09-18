import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { FrameContentInset } from "../../frames/types";
import type { CaptionPage } from "../processCaptions";
import type { CaptionStyleOverrides } from "./types";
import { applyKeywordEmphasis, DEFAULT_KEYWORDS, isKeywordToken } from "./applyKeywordEmphasis";
import { getResponsiveFontSize } from "./fontSize";
import {
  getCaptionEffectStyle,
  getCaptionFillStyle,
  getLegibilityStroke,
} from "./legibility";
import { formatCaptionToken, getCaptionContainerStyle, getPositionStyle } from "./position";
import { resolveWordTypography } from "./wordOverrides";

const HIGHLIGHT_COLOR = "#ffd23f";
const RESOLVE_DURATION_FRAMES = 8;

// Blur Resolve Style:
// Words resolve smoothly from an optical de-focus blur and subtle scale settling into crisp focus.
// Creates a luxurious, cinematic presentation that contrasts with high-energy bouncy styles.
export const BlurResolve: React.FC<{
  page: CaptionPage;
  overrides?: CaptionStyleOverrides;
  contentInset?: FrameContentInset;
}> = ({ page, overrides, contentInset }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const fontSize = getResponsiveFontSize(height, overrides?.fontSizeMultiplier);
  const currentTimeMs = page.startMs + (frame / fps) * 1000;

  // Active token = LAST token with fromMs <= currentTimeMs
  let activeIndex = -1;
  for (let i = 0; i < page.tokens.length; i++) {
    if (page.tokens[i].fromMs <= currentTimeMs) {
      activeIndex = i;
    }
  }

  const highlightColor = overrides?.highlightColor ?? HIGHLIGHT_COLOR;
  const baseTextColor = overrides?.textColor ?? "white";
  const keywordHighlightEnabled = overrides?.keywordHighlightEnabled ?? false;
  const keywords = overrides?.keywords ?? DEFAULT_KEYWORDS;

  return (
    <AbsoluteFill
      style={getPositionStyle(
        overrides?.position,
        height,
        contentInset,
        overrides?.customPositionY,
        overrides?.textAlign,
      )}
    >
      <div style={getCaptionContainerStyle(overrides, fontSize)}>
        {page.tokens.map((token, i) => {
          const { cleanText, needsSpace } = formatCaptionToken(token.text, i);
          if (!cleanText) return null;

          const isActive = i === activeIndex;
          const isSpoken = i <= activeIndex;
          const tokenStartFrame = Math.round(((token.fromMs - page.startMs) / 1000) * fps);
          const localFrame = Math.max(0, frame - tokenStartFrame);

          const progress = isSpoken
            ? spring({
                fps,
                frame: localFrame,
                durationInFrames: RESOLVE_DURATION_FRAMES,
                config: { damping: 16, mass: 0.8, stiffness: 140 },
              })
            : 0;

          const blurAmount = isSpoken ? interpolate(progress, [0, 1], [8, 0], { extrapolateRight: "clamp" }) : 6;
          const settleScale = isSpoken ? interpolate(progress, [0, 1], [1.08, 1], { extrapolateRight: "clamp" }) : 1.05;
          const opacity = isSpoken ? interpolate(progress, [0, 0.5], [0.4, 1], { extrapolateRight: "clamp" }) : 0.25;

          const isKeyword = keywordHighlightEnabled && isKeywordToken(token.text, keywords);
          const emphasis = applyKeywordEmphasis(
            1,
            isKeyword,
            overrides?.highlightIntensity,
            overrides?.keywordColor,
          );

          const wordTypo = resolveWordTypography(token, fontSize, overrides);
          const hasExplicitColor = !!emphasis.color || !!wordTypo.customColor;
          const isGradient = !hasExplicitColor && !!overrides?.gradientEnabled;
          const tokenColor =
            emphasis.color ??
            (wordTypo.customColor ?? (isActive ? highlightColor : baseTextColor));
          const fillStyle = getCaptionFillStyle(tokenColor, hasExplicitColor, overrides);
          const effectStyle = getCaptionEffectStyle(
            wordTypo.fontSize,
            isGradient,
            overrides,
            emphasis.textShadow,
          );

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
                  opacity,
                  filter: blurAmount > 0.1 ? `blur(${blurAmount.toFixed(1)}px)` : undefined,
                  transform: `scale(${settleScale * emphasis.scale})`,
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
