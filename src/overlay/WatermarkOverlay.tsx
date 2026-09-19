import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import type { WatermarkPosition, CanonicalWatermarkPosition } from './types';
import { normalizeWatermarkPosition } from '../creative/schema';

export type WatermarkOverlayProps = {
  opacity?: number;
  position?: WatermarkPosition;
  size?: number; // scale percentage (e.g. 15 for 15% or 0.15)
  imageSrc?: string | null;
};

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({
  opacity = 70,
  position = 'bottom-right',
  size = 15,
  imageSrc,
}) => {
  const { width, height } = useVideoConfig();

  // Normalize position to one of 9 canonical positions
  const canonicalPos: CanonicalWatermarkPosition = normalizeWatermarkPosition(position) || 'bottom-right';

  // Responsive safe margins based on composition dimensions
  const marginX = Math.round(width * 0.045);
  const marginY = Math.round(height * 0.045);

  const positionStyles: Record<CanonicalWatermarkPosition, React.CSSProperties> = {
    'top-left': { top: marginY, left: marginX },
    'top-center': { top: marginY, left: '50%', transform: 'translateX(-50%)' },
    'top-right': { top: marginY, right: marginX },
    'center-left': { top: '50%', left: marginX, transform: 'translateY(-50%)' },
    center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    'center-right': { top: '50%', right: marginX, transform: 'translateY(-50%)' },
    'bottom-left': { bottom: marginY, left: marginX },
    'bottom-center': { bottom: marginY, left: '50%', transform: 'translateX(-50%)' },
    'bottom-right': { bottom: marginY, right: marginX },
  };

  // Normalize opacity between 0.0 and 1.0
  const effectiveOpacity = typeof opacity === 'number'
    ? (opacity <= 1 ? Math.max(0, Math.min(1, opacity)) : Math.max(0, Math.min(1, opacity / 100)))
    : 0.7;

  // Normalize size ratio relative to composition width
  const sizeRatio = typeof size === 'number'
    ? (size <= 1 ? Math.max(0.02, Math.min(1, size)) : Math.max(0.02, Math.min(1, size / 100)))
    : 0.15;

  const maxW = Math.round(width * sizeRatio);
  const maxH = Math.round(height * sizeRatio);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          ...positionStyles[canonicalPos],
          opacity: effectiveOpacity,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Watermark"
            style={{
              maxWidth: maxW,
              maxHeight: maxH,
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.45))',
            }}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: Math.max(6, Math.round(width * 0.008)),
              color: 'white',
              fontFamily: 'sans-serif',
              fontWeight: 700,
              fontSize: Math.max(12, Math.round(width * 0.02)),
              letterSpacing: 2,
              textTransform: 'uppercase',
              textShadow: '0 1px 6px rgba(0,0,0,0.6)',
            }}
          >
            <span
              style={{
                width: Math.max(6, Math.round(width * 0.009)),
                height: Math.max(6, Math.round(width * 0.009)),
                borderRadius: '50%',
                backgroundColor: 'white',
                display: 'inline-block',
              }}
            />
            Caption Studio
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

