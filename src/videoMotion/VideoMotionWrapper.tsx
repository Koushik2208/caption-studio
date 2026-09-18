import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import type { VideoMotionSettings } from './types';
import { calculateVideoMotionTransform } from './calculateVideoMotion';

export type VideoMotionWrapperProps = {
  videoMotion?: VideoMotionSettings;
  focalX?: number;
  focalY?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

/**
 * Wraps video elements with smooth, deterministic, frame-driven motion transforms.
 * Operates equivalently inside the live Preview player and server-side MP4 export renderer.
 */
export const VideoMotionWrapper: React.FC<VideoMotionWrapperProps> = ({
  videoMotion,
  focalX = 0.5,
  focalY = 0.5,
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const { transform, transformOrigin } = calculateVideoMotionTransform(
    videoMotion,
    frame,
    fps,
    durationInFrames,
    focalX,
    focalY,
  );

  return (
    <AbsoluteFill
      style={{
        transform,
        transformOrigin,
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
