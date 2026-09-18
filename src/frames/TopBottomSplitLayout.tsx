import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CanvasBackground } from './CanvasBackground';
import { getSplitLayoutDimensions } from './splitLayoutUtils';
import type { FrameSettings } from './types';

export type TopBottomSplitLayoutProps = {
  frameSettings: FrameSettings;
  compositionWidth: number;
  compositionHeight: number;
  media?: React.ReactNode;
  captions?: React.ReactNode;
  overlays?: React.ReactNode;
  textures?: React.ReactNode;
  children?: React.ReactNode;
};

/**
 * TopBottomSplitLayout renders a balanced two-zone editorial composition:
 * - Full-composition Canvas Background
 * - Top Video Region (with upper-weighted framing)
 * - Central Caption Band (where captions render cleanly between the two cards)
 * - Bottom Video Region (with lower-weighted framing)
 * - Composition Overlays (watermark, progress bar, motion graphics)
 */
export const TopBottomSplitLayout: React.FC<TopBottomSplitLayoutProps> = ({
  frameSettings,
  compositionWidth,
  compositionHeight,
  media,
  captions,
  overlays,
  textures,
  children,
}) => {
  const {
    customBorderRadius = 20,
    customBorderEnabled = false,
    customBorderWidth = 2,
    customBorderColor = '#ffffff',
    customBorderStyle = 'solid',
    customShadowEnabled = false,
    customShadowBlur = 24,
    customShadowOpacity = 40,
    customBackdrop = 'none',
    customBackdropColor = '#121214',
    customBackdropGradient = 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)',
    splitGap = 0,
    splitTopFocalX = 0.5,
    splitTopFocalY = 0.25,
    splitBottomFocalX = 0.5,
    splitBottomFocalY = 0.75,
  } = frameSettings;

  const { topRegion, bottomRegion } = getSplitLayoutDimensions(
    compositionWidth,
    compositionHeight,
    splitGap,
  );

  const scaleRatio = compositionWidth / 1080;
  const responsiveRadius = Math.round(customBorderRadius * scaleRatio);
  const responsiveBorderWidth = Math.max(1, Math.round(customBorderWidth * scaleRatio));
  const responsiveShadowBlur = Math.round(customShadowBlur * scaleRatio);

  const borderStyle: React.CSSProperties = customBorderEnabled
    ? {
        border: `${responsiveBorderWidth}px ${customBorderStyle} ${customBorderColor}`,
      }
    : {};

  const shadowStyle: React.CSSProperties = customShadowEnabled
    ? {
        boxShadow: `0 ${Math.round(responsiveShadowBlur * 0.4)}px ${responsiveShadowBlur}px rgba(0, 0, 0, ${customShadowOpacity / 100})`,
      }
    : {};

  const visualContent = media ?? children;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', overflow: 'hidden' }}>
      {/* 1. Full Canvas Backdrop Layer */}
      <CanvasBackground
        backdrop={customBackdrop}
        color={customBackdropColor}
        gradient={customBackdropGradient}
      >
        {visualContent}
      </CanvasBackground>

      {/* 2. Top Content Region */}
      <div
        style={{
          position: 'absolute',
          left: topRegion.x,
          top: topRegion.y,
          width: topRegion.width,
          height: topRegion.height,
          borderRadius: responsiveRadius,
          overflow: 'hidden',
          clipPath: `inset(0px round ${responsiveRadius}px)`,
          ...borderStyle,
          ...shadowStyle,
          boxSizing: 'border-box',
          backgroundColor: '#000000',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            transform: 'scale(1.25)',
            transformOrigin: `${Math.round(splitTopFocalX * 100)}% ${Math.round(splitTopFocalY * 100)}%`,
          }}
        >
          <AbsoluteFill>{visualContent}</AbsoluteFill>
        </div>
        {textures}
      </div>

      {/* 3. Bottom Content Region */}
      <div
        style={{
          position: 'absolute',
          left: bottomRegion.x,
          top: bottomRegion.y,
          width: bottomRegion.width,
          height: bottomRegion.height,
          borderRadius: responsiveRadius,
          overflow: 'hidden',
          clipPath: `inset(0px round ${responsiveRadius}px)`,
          ...borderStyle,
          ...shadowStyle,
          boxSizing: 'border-box',
          backgroundColor: '#000000',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            transform: 'scale(1.25)',
            transformOrigin: `${Math.round(splitBottomFocalX * 100)}% ${Math.round(splitBottomFocalY * 100)}%`,
          }}
        >
          <AbsoluteFill>{visualContent}</AbsoluteFill>
        </div>
        {textures}
      </div>

      {/* 4. Central Caption Band & Composition Overlays */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        {captions}
        {overlays}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
