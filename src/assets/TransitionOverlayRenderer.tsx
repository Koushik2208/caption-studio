import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, Video, staticFile } from 'remotion';
import type { TransitionOverlayPlacement } from './types';
import { getBuiltInAsset } from './registry';

export type TransitionOverlayRendererProps = {
  placements?: TransitionOverlayPlacement[];
  isExport?: boolean;
};

/**
 * Renders positioned transition overlays (Film Burn, Flash) using Remotion Sequence.
 * Applies screen blending so bright light bursts and film burns blend seamlessly over the video.
 */
export const TransitionOverlayRenderer: React.FC<TransitionOverlayRendererProps> = ({
  placements,
  isExport = false,
}) => {
  if (!placements || placements.length === 0) {
    return null;
  }

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {placements.map((p) => {
        const asset = getBuiltInAsset(p.assetId);
        if (!asset || asset.type !== 'overlay') return null;

        const videoSrc = staticFile(asset.src);
        const opacity = p.opacity ?? 1;

        return (
          <Sequence
            key={p.id}
            from={p.startFrame}
            durationInFrames={Math.max(1, p.durationInFrames)}
            style={{ pointerEvents: 'none' }}
          >
            <AbsoluteFill style={{ mixBlendMode: 'screen', opacity }}>
              {isExport ? (
                <OffthreadVideo
                  src={videoSrc}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Video
                  src={videoSrc}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
