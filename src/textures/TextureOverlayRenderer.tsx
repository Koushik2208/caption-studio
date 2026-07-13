import { FilmDust } from './FilmDust';
import { Grid } from './Grid';
import { Halation } from './Halation';
import type { TextureOverlaySettings } from './types';

type TextureOverlayRendererProps = {
  textureSettings?: TextureOverlaySettings;
};

// Renders active texture overlays in reel-craft's documented stack order
// (subtle textures first, expressive effects on top: grid, then film dust,
// then halation) - sits between the background/media and the caption layer
// so textures never obscure captions.
export const TextureOverlayRenderer: React.FC<TextureOverlayRendererProps> = ({ textureSettings }) => {
  if (!textureSettings) return null;

  return (
    <>
      {textureSettings.gridEnabled && <Grid intensity={textureSettings.gridIntensity} />}
      {textureSettings.filmDustEnabled && <FilmDust />}
      {textureSettings.halationEnabled && <Halation intensity={textureSettings.halationIntensity} />}
    </>
  );
};
