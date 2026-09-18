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
const SLIDE_DISTANCE_PX = 30;
const ANIM_DURATION_FRAMES = 12;

// Slide-up style: each word slides up + fades in as it becomes active, then
// settles - medium-energy middle ground between Signature's bouncy scale-pop
// and Typewriter's flat character reveal (PLAN.md Part F, Phase 3b). Every
// token is always rendered (like Signature's karaoke fill) so line wrapping
// never reflows; tokens not yet reached just sit at progress 0 (invisible,
// offset below their resting position) until their own fromMs arrives.
export const SlideUp: React.FC<{
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
  const keywordHighlightEnabled = overrides?.keywordHighlightEnabled ?? false;
  const keywords = overrides?.keywords ?? DEFAULT_KEYWORDS;

  return (
    <AbsoluteFill style={getPositionStyle(overrides?.position, height, contentInset, overrides?.customPositionY, overrides?.textAlign)}>
      <div
        style={{
          fontSize,
          fontWeight: overrides?.fontWeight ?? 700,
          fontStyle: overrides?.fontStyle ?? "normal",
          fontFamily: overrides?.fontFamily ?? "Arial, sans-serif",
          textAlign: overrides?.textAlign ?? "center",
          whiteSpace: "pre-wrap",
          maxWidth: "85%",
          lineHeight: overrides?.lineHeight ?? 1.15,
          letterSpacing: overrides?.letterSpacing !== undefined ? `${overrides.letterSpacing}px` : undefined,
          textTransform: overrides?.textTransform ?? "none",
        }}
      >
        {page.tokens.map((token, i) => {
          const tokenStartFrame = Math.round(
            ((token.fromMs - page.startMs) / 1000) * fps,
          );
          const progress = spring({
            fps,
            frame: Math.max(0, frame - tokenStartFrame),
            durationInFrames: ANIM_DURATION_FRAMES,
            config: { damping: 15, mass: 0.5, stiffness: 150 },
          });
          const opacity = Math.min(1, Math.max(0, progress));
          const translateY = interpolate(progress, [0, 1], [SLIDE_DISTANCE_PX, 0]);

          const isKeyword = keywordHighlightEnabled && isKeywordToken(token.text, keywords);
          const emphasis = applyKeywordEmphasis(
            1,
            isKeyword,
            overrides?.highlightIntensity,
            overrides?.keywordColor,
          );

          const isActive = i === activeIndex;
          const wordTypo = resolveWordTypography(token, fontSize, overrides);
          const hasExplicitColor = !!emphasis.color || !!wordTypo.customColor;
          const isGradient = !hasExplicitColor && !!overrides?.gradientEnabled;
          const tokenColor = emphasis.color ?? (wordTypo.customColor ?? (isActive ? highlightColor : (overrides?.textColor ?? "white")));
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
                opacity,
                transform: `translateY(${translateY}px) scale(${emphasis.scale})`,
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
