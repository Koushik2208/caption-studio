import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CanvasBackground } from './CanvasBackground';
import { getLeftRightSplitLayoutDimensions } from './leftRightSplitUtils';
import type { FrameSettings } from './types';

export type LeftRightSplitLayoutProps = {
  frameSettings: FrameSettings;
  compositionWidth: number;
  compositionHeight: number;
  media?: React.ReactNode;
  captions?: React.ReactNode;
  overlays?: React.ReactNode;
  textures?: React.ReactNode;
  assetOverlays?: React.ReactNode;
  children?: React.ReactNode;
};

/**
 * LeftRightSplitLayout renders a balanced two-zone horizontal editorial composition:
 * - Full-composition Canvas Background
 * - Left Video Region (with left-weighted focal framing)
 * - Right Video Region (with right-weighted focal framing)
 * - Composition Overlays & Floating Captions
 */
export const LeftRightSplitLayout: React.FC<LeftRightSplitLayoutProps> = ({
  frameSettings,
  compositionWidth,
  compositionHeight,
  media,
  captions,
  overlays,
  textures,
  assetOverlays,
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
    splitLeftFocalX = 0.25,
    splitLeftFocalY = 0.5,
    splitRightFocalX = 0.75,
    splitRightFocalY = 0.5,
  } = frameSettings;

  const { leftRegion, rightRegion } = getLeftRightSplitLayoutDimensions(
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

      {/* 2. Left Content Region */}
      <div
        style={{
          position: 'absolute',
          left: leftRegion.x,
          top: leftRegion.y,
          width: leftRegion.width,
          height: leftRegion.height,
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
            transformOrigin: `${Math.round(splitLeftFocalX * 100)}% ${Math.round(splitLeftFocalY * 100)}%`,
          }}
        >
          <AbsoluteFill>{visualContent}</AbsoluteFill>
        </div>
        {textures}
        {assetOverlays}
      </div>

      {/* 3. Right Content Region */}
      <div
        style={{
          position: 'absolute',
          left: rightRegion.x,
          top: rightRegion.y,
          width: rightRegion.width,
          height: rightRegion.height,
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
            transformOrigin: `${Math.round(splitRightFocalX * 100)}% ${Math.round(splitRightFocalY * 100)}%`,
          }}
        >
          <AbsoluteFill>{visualContent}</AbsoluteFill>
        </div>
        {textures}
        {assetOverlays}
      </div>

      {/* 4. Composition Overlays & Captions Layer */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        {captions}
        {overlays}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
