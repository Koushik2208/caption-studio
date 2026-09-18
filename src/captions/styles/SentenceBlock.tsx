import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { FrameContentInset } from "../../frames/types";
import type { CaptionPage } from "../processCaptions";
import type { CaptionStyleOverrides } from "./types";
import { applyKeywordEmphasis, DEFAULT_KEYWORDS, isKeywordToken } from "./applyKeywordEmphasis";
import { getResponsiveFontSize } from "./fontSize";
import {
  getCaptionEffectStyle,
  getLegibilityStroke,
} from "./legibility";
import { formatCaptionToken, getCaptionContainerStyle, getPositionStyle } from "./position";
import { resolveWordTypography } from "./wordOverrides";

const DEFAULT_BLOCK_COLOR = "#FFFFFF";
const WIPE_DURATION_FRAMES = 6;

// Sentence Block Style:
// Animated text backplate treatment where active/spoken words receive an expanding rectangular
// block that wipes in horizontally, placing text in a bold, high-contrast state.
// Distinct from the static Caption Backdrop system.
export const SentenceBlock: React.FC<{
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

  const blockColor = overrides?.highlightColor ?? DEFAULT_BLOCK_COLOR;
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

          const isSpoken = i <= activeIndex;
          const tokenStartFrame = Math.round(((token.fromMs - page.startMs) / 1000) * fps);
          const localFrame = Math.max(0, frame - tokenStartFrame);

          const wipeProgress = isSpoken
            ? spring({
                fps,
                frame: localFrame,
                durationInFrames: WIPE_DURATION_FRAMES,
                config: { damping: 14, mass: 0.5, stiffness: 220 },
              })
            : 0;

          const blockScale = interpolate(wipeProgress, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const isKeyword = keywordHighlightEnabled && isKeywordToken(token.text, keywords);
          const emphasis = applyKeywordEmphasis(
            1,
            isKeyword,
            overrides?.highlightIntensity,
            overrides?.keywordColor,
          );

          const wordTypo = resolveWordTypography(token, fontSize, overrides);

          // Contrast color: dark text on bright backplate, or user's custom color if specified
          const activeTextColor = wordTypo.customColor ?? (emphasis.color ?? "#0D0D12");
          const inactiveTextColor = overrides?.textColor ?? "rgba(255,255,255,0.45)";
          const tokenTextColor = isSpoken ? activeTextColor : inactiveTextColor;

          const effectStyle = getCaptionEffectStyle(
            wordTypo.fontSize,
            false,
            { shadowEnabled: !isSpoken },
            emphasis.textShadow,
          );

          return (
            <React.Fragment key={`${token.fromMs}-${i}`}>
              {needsSpace && " "}
              <span
                style={{
                  display: "inline-block",
                  position: "relative",
                  transform: `scale(${emphasis.scale})`,
                  margin: "2px 2px",
                  verticalAlign: "middle",
                }}
              >
                {/* Animated Rectangular Backplate */}
                {isSpoken && (
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 6,
                      backgroundColor: blockColor,
                      transform: `scaleX(${blockScale})`,
                      transformOrigin: "left center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                  />
                )}

                {/* Text Layer */}
                <span
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "inline-block",
                    fontFamily: wordTypo.fontFamily,
                    fontWeight: wordTypo.fontWeight,
                    fontStyle: wordTypo.fontStyle,
                    fontSize: wordTypo.fontSize,
                    color: tokenTextColor,
                    WebkitTextStroke: isSpoken ? "none" : getLegibilityStroke(wordTypo.fontSize, overrides),
                    paintOrder: "stroke fill",
                    padding: "2px 8px",
                    ...effectStyle,
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
