import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { FrameContentInset } from "../../frames/types";
import type { CaptionPage } from "../processCaptions";
import type { CaptionStyleOverrides } from "./types";
import { applyKeywordEmphasis, DEFAULT_KEYWORDS, isKeywordToken } from "./applyKeywordEmphasis";
import { getResponsiveFontSize } from "./fontSize";
import { getCaptionEffectStyle, getCaptionFillStyle, getLegibilityStroke } from "./legibility";
import { getPositionStyle } from "./position";
import { resolveWordTypography } from "./wordOverrides";

const HIGHLIGHT_COLOR = "#ffd23f";

// Signature style: word pop (spring scale-in on the active word) + karaoke pop fill
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
  const baseTextColor = overrides?.textColor ?? "white";
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
          color: baseTextColor,
          textAlign: "center",
          whiteSpace: "pre-wrap",
          maxWidth: "85%",
          lineHeight: overrides?.lineHeight ?? 1.15,
          letterSpacing: overrides?.letterSpacing !== undefined ? `${overrides.letterSpacing}px` : undefined,
          textTransform: overrides?.textTransform ?? "none",
        }}
      >
        {page.tokens.map((token, i) => {
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

          const wordTypo = resolveWordTypography(token, fontSize, overrides);
          const hasExplicitColor = !!emphasis.color || !!wordTypo.customColor;
          const isGradient = !hasExplicitColor && !!overrides?.gradientEnabled;
          const tokenColor = emphasis.color ?? (wordTypo.customColor ?? (isActive ? highlightColor : baseTextColor));
          const fillStyle = getCaptionFillStyle(tokenColor, hasExplicitColor, overrides);
          const effectStyle = getCaptionEffectStyle(wordTypo.fontSize, isGradient, overrides, emphasis.textShadow);

          return (
            <span
              key={`${token.fromMs}-${i}`}
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
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
