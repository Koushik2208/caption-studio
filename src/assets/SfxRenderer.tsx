import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import type { SoundEffectPlacement } from './types';
import { getBuiltInAsset } from './registry';

export type SfxRendererProps = {
  placements?: SoundEffectPlacement[];
};

/**
 * Renders positioned sound effects (SFX) at specific video timestamps using Remotion Sequence.
 */
export const SfxRenderer: React.FC<SfxRendererProps> = ({ placements }) => {
  if (!placements || placements.length === 0) {
    return null;
  }

  return (
    <>
      {placements.map((p) => {
        const asset = getBuiltInAsset(p.assetId);
        if (!asset || asset.type !== 'sfx') return null;

        const audioSrc = staticFile(asset.src);
        const volume = Math.max(0, Math.min(1, p.volume ?? 0.8));

        return (
          <Sequence key={p.id} from={p.startFrame}>
            <Audio src={audioSrc} volume={volume} />
          </Sequence>
        );
      })}
    </>
  );
};
