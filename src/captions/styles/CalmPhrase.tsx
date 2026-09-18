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

const FADE_MS = 200;

// Calm caption style: the whole phrase fades in/out as one block, no
// per-word pop or karaoke fill - alternated with the energetic style per
// scene (`captionMode`) so word-by-word bounce stays special (PLAN.md B1 #3).
export const CalmPhrase: React.FC<{
  page: CaptionPage;
  overrides?: CaptionStyleOverrides;
  contentInset?: FrameContentInset;
}> = ({ page, overrides, contentInset }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const fontSize = getResponsiveFontSize(height, overrides?.fontSizeMultiplier);
  const elapsedMs = (frame / fps) * 1000;
  const durationMs = (page.durationInFrames / fps) * 1000;

  const opacity = interpolate(
    elapsedMs,
    [0, FADE_MS, Math.max(FADE_MS + 1, durationMs - FADE_MS), durationMs],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const baseColor = overrides?.textColor ?? "white";
  const keywordHighlightEnabled = overrides?.keywordHighlightEnabled ?? false;
  const keywords = overrides?.keywords ?? DEFAULT_KEYWORDS;

  return (
    <AbsoluteFill style={getPositionStyle(overrides?.position, height, contentInset, overrides?.customPositionY, overrides?.textAlign)}>
      <div style={{ ...getCaptionContainerStyle(overrides, fontSize), opacity }}>
        {page.tokens.map((token, i) => {
          const { cleanText, needsSpace } = formatCaptionToken(token.text, i);
          if (!cleanText) return null;

          const isKeyword = keywordHighlightEnabled && isKeywordToken(token.text, keywords);
          const emphasis = applyKeywordEmphasis(1, isKeyword, overrides?.highlightIntensity, overrides?.keywordColor);
          const wordTypo = resolveWordTypography(token, fontSize, overrides);
          const hasExplicitColor = !!emphasis.color || !!wordTypo.customColor;
          const isGradient = !hasExplicitColor && !!overrides?.gradientEnabled;
          const tokenColor = emphasis.color ?? (wordTypo.customColor ?? baseColor);
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
                {cleanText}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
