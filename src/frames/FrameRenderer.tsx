import React from 'react';
import { useVideoConfig } from 'remotion';
import { CustomCardFrame } from './CustomCardFrame';
import { CinematicScope } from './CinematicScope';
import { FilmStrip } from './FilmStrip';
import { GradientBorder } from './GradientBorder';
import { MinimalBezel } from './MinimalBezel';
import { NeonGlow } from './NeonGlow';
import { SquareBezel } from './SquareBezel';
import { VintageProjector } from './VintageProjector';
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

  // V4 Custom Card Mode branch
  if (frameSettings?.cardMode === 'custom') {
    return (
      <CustomCardFrame
        frameSettings={frameSettings}
        compositionWidth={width}
        compositionHeight={height}
      >
        {children}
      </CustomCardFrame>
    );
  }

  const variant = frameSettings?.variant ?? 'none';

  switch (variant) {
    case 'minimalBezel':
      return (
        <MinimalBezel
          width={width}
          height={height}
          bgColor={frameSettings?.bgColor}
          bezelRadiusMultiplier={frameSettings?.bezelRadiusMultiplier}
        >
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
    case 'filmStrip':
      return (
        <FilmStrip width={width} height={height}>
          {children}
        </FilmStrip>
      );
    case 'squareBezel':
      return (
        <SquareBezel width={width} height={height} bgColor={frameSettings?.bgColor}>
          {children}
        </SquareBezel>
      );
    case 'vintageProjector':
      return (
        <VintageProjector width={width} height={height}>
          {children}
        </VintageProjector>
      );
    default:
      return <>{children}</>;
  }
};
