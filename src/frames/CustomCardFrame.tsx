import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CanvasBackground } from './CanvasBackground';
import { getCardDimensions } from './customCardUtils';
import type { FrameSettings } from './types';

export type CustomCardFrameProps = {
  frameSettings: FrameSettings;
  compositionWidth: number;
  compositionHeight: number;
  children: React.ReactNode;
};

export const CustomCardFrame: React.FC<CustomCardFrameProps> = ({
  frameSettings,
  compositionWidth,
  compositionHeight,
  children,
}) => {
  const {
    customScale = 0.85,
    customAspectRatio = '9:16',
    customPositionY = 0.5,
    customBorderRadius = 24,
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
  } = frameSettings;

  const { cardWidth, cardHeight, cardLeft, cardTop } = getCardDimensions(
    customAspectRatio,
    customScale,
    customPositionY,
    compositionWidth,
    compositionHeight,
  );

  // Responsive scaling factor anchored to standard 1080p composition
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

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', overflow: 'hidden' }}>
      {/* 1. Full Canvas Backdrop Layer */}
      <CanvasBackground
        backdrop={customBackdrop}
        color={customBackdropColor}
        gradient={customBackdropGradient}
      >
        {children}
      </CanvasBackground>

      {/* 2. Custom Video Card Container */}
      <div
        style={{
          position: 'absolute',
          left: cardLeft,
          top: cardTop,
          width: cardWidth,
          height: cardHeight,
          borderRadius: responsiveRadius,
          overflow: 'hidden',
          clipPath: `inset(0px round ${responsiveRadius}px)`,
          ...borderStyle,
          ...shadowStyle,
          boxSizing: 'border-box',
        }}
      >
        <AbsoluteFill>{children}</AbsoluteFill>
      </div>
    </AbsoluteFill>
  );
};
