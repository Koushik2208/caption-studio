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
const ANIM_DURATION_FRAMES = 10;

// Street / Split-Reveal Style:
// Active/new word reveals via dual synchronized top and bottom halves using clip-path,
// opening outward toward the center line. Preserves Reel-Craft's iconic Street aesthetic
// while maintaining full word-level typography, gradient, and legibility overrides.
export const SplitReveal: React.FC<{
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

          const tokenStartFrame = Math.round(((token.fromMs - page.startMs) / 1000) * fps);
          const localFrame = Math.max(0, frame - tokenStartFrame);
          const isSpoken = i <= activeIndex;

          const progress = isSpoken
            ? spring({
                fps,
                frame: localFrame,
                durationInFrames: ANIM_DURATION_FRAMES,
                config: { damping: 14, mass: 0.6, stiffness: 200 },
              })
            : 0;

          // Clip from 100% (hidden) down to 50% (meeting at exact middle line)
          const clipPercent = interpolate(progress, [0, 1], [100, 50], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          // Subtle outward vertical separation that snaps cleanly to 0
          const splitOffset = interpolate(progress, [0, 1], [3, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const opacity = isSpoken ? interpolate(progress, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }) : 0.25;

          const isKeyword = keywordHighlightEnabled && isKeywordToken(token.text, keywords);
          const isActive = i === activeIndex;

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

          const sharedWordStyle: React.CSSProperties = {
            fontFamily: wordTypo.fontFamily,
            fontWeight: wordTypo.fontWeight,
            fontStyle: wordTypo.fontStyle,
            fontSize: wordTypo.fontSize,
            WebkitTextStroke: getLegibilityStroke(wordTypo.fontSize, overrides),
            paintOrder: "stroke fill",
            ...fillStyle,
            ...effectStyle,
          };

          return (
            <React.Fragment key={`${token.fromMs}-${i}`}>
              {needsSpace && " "}
              <span
                style={{
                  display: "inline-block",
                  position: "relative",
                  transform: `scale(${emphasis.scale})`,
                  opacity,
                }}
              >
                {/* Invisible spacer to maintain layout flow and baseline */}
                <span style={{ ...sharedWordStyle, visibility: "hidden" }}>{cleanText}</span>

                {/* Top half: reveals downward */}
                <span
                  style={{
                    ...sharedWordStyle,
                    position: "absolute",
                    left: 0,
                    top: 0,
                    clipPath: `inset(0% 0% ${clipPercent}% 0%)`,
                    transform: `translateY(-${splitOffset}px)`,
                  }}
                >
                  {cleanText}
                </span>

                {/* Bottom half: reveals upward */}
                <span
                  style={{
                    ...sharedWordStyle,
                    position: "absolute",
                    left: 0,
                    top: 0,
                    clipPath: `inset(${clipPercent}% 0% 0% 0%)`,
                    transform: `translateY(${splitOffset}px)`,
                  }}
                >
                  {cleanText}
                </span>
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
