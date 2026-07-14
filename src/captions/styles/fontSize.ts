// Fixed caption font size scales with composition HEIGHT instead of using
// an absolute pixel value - the 85px baseline was tuned for the 1920-tall
// vertical composition (85/1920 ≈ 4.43% of height). Height, not width, is
// the right basis: vertical (1080x1920) is tall, horizontal (1920x1080) is
// short - height actually shrinks in landscape, which is what should shrink
// caption size. (Width scales the opposite direction - horizontal is wider,
// not narrower, so a width-based ratio made landscape captions bigger, the
// reverse of what's needed.) Applying this ratio at any height keeps
// 1080x1920 pixel-identical to before (85px) while 1920x1080 correctly
// comes out smaller (~48px) - same computed-from-real-dimensions pattern as
// getPositionStyle.
const FONT_SIZE_RATIO = 85 / 1920;

// multiplier: user-facing override (styleOverrides.fontSizeMultiplier) so
// the computed default can be nudged per-video if it still feels off -
// multiplies the computed value rather than replacing it.
export const getResponsiveFontSize = (compositionHeight: number, multiplier: number = 1): number =>
  compositionHeight * FONT_SIZE_RATIO * multiplier;
