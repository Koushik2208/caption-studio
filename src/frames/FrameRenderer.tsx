import React from 'react';
import { useVideoConfig } from 'remotion';
import { CinematicScope } from './CinematicScope';
import { GradientBorder } from './GradientBorder';
import { MinimalBezel } from './MinimalBezel';
import { NeonGlow } from './NeonGlow';
import type { FrameSettings } from './types';

type FrameRendererProps = {
  frameSettings?: FrameSettings;
  children: React.ReactNode;
};

// Applies the selected frame chrome around whatever content the caller
// renders (media + captions + overlays) - 'none'/missing settings pass
// children through unwrapped, matching CaptionPreviewComposition/
// CaptionExportComposition's pre-frame output exactly.
export const FrameRenderer: React.FC<FrameRendererProps> = ({ frameSettings, children }) => {
  const { width, height } = useVideoConfig();
  const variant = frameSettings?.variant ?? 'none';

  switch (variant) {
    case 'minimalBezel':
      return (
        <MinimalBezel width={width} height={height} bgColor={frameSettings?.bgColor}>
          {children}
        </MinimalBezel>
      );
    case 'gradientBorder':
      return (
        <GradientBorder width={width} height={height}>
          {children}
        </GradientBorder>
      );
    case 'neonGlow':
      return (
        <NeonGlow width={width} height={height}>
          {children}
        </NeonGlow>
      );
    case 'cinematicScope':
      return (
        <CinematicScope width={width} height={height}>
          {children}
        </CinematicScope>
      );
    default:
      return <>{children}</>;
  }
};
