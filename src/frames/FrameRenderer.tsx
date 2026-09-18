import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { CanvasBackground } from './CanvasBackground';
import { CustomCardFrame } from './CustomCardFrame';
import { TopBottomSplitLayout } from './TopBottomSplitLayout';
import { LeftRightSplitLayout } from './LeftRightSplitLayout';
import { CinematicScope } from './CinematicScope';
import { FilmStrip } from './FilmStrip';
import { GradientBorder } from './GradientBorder';
import { MinimalBezel } from './MinimalBezel';
import { NeonGlow } from './NeonGlow';
import { SquareBezel } from './SquareBezel';
import { VintageProjector } from './VintageProjector';
import { TerminalFrame } from './TerminalFrame';
import type { FrameSettings } from './types';

export type FrameRendererProps = {
  frameSettings?: FrameSettings;
  media?: React.ReactNode;
  captions?: React.ReactNode;
  overlays?: React.ReactNode;
  textures?: React.ReactNode;
  assetOverlays?: React.ReactNode;
  sfx?: React.ReactNode;
  children?: React.ReactNode;
};

// Applies the selected composition layout & frame chrome around whatever content
// the caller renders (media + captions + overlays).
export const FrameRenderer: React.FC<FrameRendererProps> = ({
  frameSettings,
  media,
  captions,
  overlays,
  textures,
  assetOverlays,
  sfx,
  children,
}) => {
  const { width, height } = useVideoConfig();
  const layout = frameSettings?.layout ?? 'floating-card';

  // 1. V4 Phase 3A: Top / Bottom Split Layout
  if (layout === 'top-bottom-split') {
    return (
      <TopBottomSplitLayout
        frameSettings={
          frameSettings ?? {
            variant: 'none',
            bgColor: '#000000',
            bezelRadiusMultiplier: 1,
          }
        }
        compositionWidth={width}
        compositionHeight={height}
        media={media}
        captions={captions}
        overlays={overlays}
        textures={textures}
        assetOverlays={assetOverlays}
      >
        {children}
      </TopBottomSplitLayout>
    );
  }

  // 2. V4 Phase 3C: Left / Right Split Layout
  if (layout === 'left-right-split') {
    return (
      <LeftRightSplitLayout
        frameSettings={
          frameSettings ?? {
            variant: 'none',
            bgColor: '#000000',
            bezelRadiusMultiplier: 1,
          }
        }
        compositionWidth={width}
        compositionHeight={height}
        media={media}
        captions={captions}
        overlays={overlays}
        textures={textures}
        assetOverlays={assetOverlays}
      >
        {children}
      </LeftRightSplitLayout>
    );
  }

  // 3. V4 Phase 3A: Full Bleed Layout
  if (layout === 'full-bleed') {
    const visualContent = media ?? children;
    return (
      <AbsoluteFill style={{ backgroundColor: '#000000', overflow: 'hidden' }}>
        <CanvasBackground
          backdrop={frameSettings?.customBackdrop}
          color={frameSettings?.customBackdropColor}
          gradient={frameSettings?.customBackdropGradient}
        >
          {visualContent}
        </CanvasBackground>
        <AbsoluteFill>
          {visualContent}
          {textures}
          {assetOverlays}
          {sfx}
          <AbsoluteFill>
            {captions}
            {overlays}
          </AbsoluteFill>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  // 3. Floating Card Layout (Default & backward compatible)
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
    case 'terminal':
      return (
        <TerminalFrame width={width} height={height}>
          {children}
        </TerminalFrame>
      );
    default:
      return <>{children}</>;
  }
};
