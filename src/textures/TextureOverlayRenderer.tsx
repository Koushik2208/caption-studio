import { CrtScanlines } from './CrtScanlines';
import { FilmDust } from './FilmDust';
import { FilmGrain } from './FilmGrain';
import { Grid } from './Grid';
import { Halation } from './Halation';
import { Halftone } from './Halftone';
import { LightLeak } from './LightLeak';
import type { TextureOverlaySettings } from './types';

type TextureOverlayRendererProps = {
  textureSettings?: TextureOverlaySettings;
};

// Renders active texture overlays stacked from subtlest/most-structural to
// most-expressive: grid and halftone are static dot/line patterns, film dust
// and light leak are moving particle/color effects, CRT scanlines and
// halation paint last so their scan-bar/glow sit visibly on top of
// everything beneath. Sits between the background/media and the caption
// layer so textures never obscure captions.
export const TextureOverlayRenderer: React.FC<TextureOverlayRendererProps> = ({ textureSettings }) => {
  if (!textureSettings) return null;

  return (
    <>
      {textureSettings.gridEnabled && <Grid intensity={textureSettings.gridIntensity} />}
      {textureSettings.halftoneEnabled && <Halftone intensity={textureSettings.halftoneIntensity} />}
      {textureSettings.filmGrainEnabled && <FilmGrain intensity={textureSettings.filmGrainIntensity} />}
      {textureSettings.filmDustEnabled && <FilmDust />}
      {textureSettings.lightLeakEnabled && <LightLeak intensity={textureSettings.lightLeakIntensity} />}
      {textureSettings.crtScanlinesEnabled && <CrtScanlines intensity={textureSettings.crtScanlinesIntensity} />}
      {textureSettings.halationEnabled && <Halation intensity={textureSettings.halationIntensity} />}
    </>
  );
};
