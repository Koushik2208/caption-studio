/**
 * Left / Right Split Layout Geometry Utilities
 * Provides deterministic coordinate calculations for side-by-side editorial compositions.
 */

export type LeftRightRegionGeometry = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LeftRightSplitLayoutDimensions = {
  leftRegion: LeftRightRegionGeometry;
  rightRegion: LeftRightRegionGeometry;
};

// Default balanced layout ratios
export const LR_SIDE_MARGIN_RATIO = 0.035; // 3.5% side margin
export const LR_TOP_MARGIN_RATIO = 0.06; // 6% top & bottom composition margins
export const LR_HEIGHT_RATIO = 0.88; // 88% height for card zones

/**
 * Computes exact pixel coordinates for the Left / Right Split layout.
 * Anchored to composition width and height for Remotion and browser player parity.
 * Supports true 50/50 division with configurable split gap (0px touching support).
 */
export function getLeftRightSplitLayoutDimensions(
  compositionWidth: number,
  compositionHeight: number,
  splitGap = 0,
): LeftRightSplitLayoutDimensions {
  const leftX = Math.round(compositionWidth * LR_SIDE_MARGIN_RATIO);
  const scaleRatio = compositionWidth / 1080;
  const responsiveGap = Math.round(splitGap * scaleRatio);
  
  // Total available width for both cards = compositionWidth - (2 * sideMargin) - responsiveGap
  const totalAvailableWidth = compositionWidth - (leftX * 2) - responsiveGap;
  const zoneWidth = Math.floor(totalAvailableWidth / 2);

  const rightX = leftX + zoneWidth + responsiveGap;

  const zoneY = Math.round(compositionHeight * LR_TOP_MARGIN_RATIO);
  const zoneHeight = Math.round(compositionHeight * LR_HEIGHT_RATIO);

  return {
    leftRegion: {
      x: leftX,
      y: zoneY,
      width: zoneWidth,
      height: zoneHeight,
    },
    rightRegion: {
      x: rightX,
      y: zoneY,
      width: zoneWidth,
      height: zoneHeight,
    },
  };
}
