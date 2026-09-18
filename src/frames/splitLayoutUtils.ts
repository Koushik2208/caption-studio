/**
 * Split Layout Geometry Utilities
 * Provides deterministic coordinate calculations for Top / Bottom Split compositions.
 */

export type SplitRegionGeometry = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SplitLayoutDimensions = {
  topRegion: SplitRegionGeometry;
  captionBand: SplitRegionGeometry;
  bottomRegion: SplitRegionGeometry;
};

// Default balanced layout ratios
export const SPLIT_TOP_MARGIN_RATIO = 0.04; // 4% top composition margin
export const SPLIT_WIDTH_RATIO = 0.92; // 92% width (4% side margins)

/**
 * Computes exact pixel coordinates for the Top / Bottom Split layout.
 * Anchored to composition width and height for Remotion and browser player parity.
 * Supports true 50/50 division with configurable split gap (0px touching support).
 */
export function getSplitLayoutDimensions(
  compositionWidth: number,
  compositionHeight: number,
  splitGap = 0,
): SplitLayoutDimensions {
  const cardWidth = Math.round(compositionWidth * SPLIT_WIDTH_RATIO);
  const cardLeft = Math.round((compositionWidth - cardWidth) / 2);

  const scaleRatio = compositionWidth / 1080;
  const responsiveGap = Math.round(splitGap * scaleRatio);

  const topY = Math.round(compositionHeight * SPLIT_TOP_MARGIN_RATIO);
  const bottomMargin = topY;
  
  const totalAvailableHeight = compositionHeight - (topY + bottomMargin) - responsiveGap;
  const zoneHeight = Math.floor(totalAvailableHeight / 2);

  const captionBandTop = topY + zoneHeight;
  const bottomY = captionBandTop + responsiveGap;

  return {
    topRegion: {
      x: cardLeft,
      y: topY,
      width: cardWidth,
      height: zoneHeight,
    },
    captionBand: {
      x: cardLeft,
      y: captionBandTop,
      width: cardWidth,
      height: responsiveGap,
    },
    bottomRegion: {
      x: cardLeft,
      y: bottomY,
      width: cardWidth,
      height: zoneHeight,
    },
  };
}
