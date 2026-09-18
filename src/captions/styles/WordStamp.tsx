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

// Word Stamp Style:
// Active word enters with a high-energy scale slam / stamp animation.
// Adapts Reel-Craft's punchy spring physics (damping: 8, mass: 1.2) while respecting
// Caption Studio word overrides, keyword highlights, and typography effects.
export const WordStamp: React.FC<{
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
          const activeStartFrame = Math.round(((token.fromMs - page.startMs) / 1000) * fps);
          const localFrame = Math.max(0, frame - activeStartFrame);

          // Punchy spring scale slam
          const stampSpring = isActive
            ? spring({
                fps,
                frame: localFrame,
                config: { damping: 8, mass: 1.2, stiffness: 180 },
              })
            : 1;

          const stampScale = isActive ? interpolate(stampSpring, [0, 1], [1.45, 1]) : 1;
          const inOpacity = isActive
            ? interpolate(localFrame, [0, 3], [0.3, 1], { extrapolateRight: "clamp" })
            : isSpoken
              ? 1
              : 0.3;

          const isKeyword = keywordHighlightEnabled && isKeywordToken(token.text, keywords);
          const emphasis = applyKeywordEmphasis(
            stampScale,
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
                  opacity: inOpacity,
                  transform: `scale(${emphasis.scale})`,
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
