import type { TextureOverlaySettings, OverlayIntensity } from './types';

const OFFSET_PX: Record<OverlayIntensity, number> = { low: 1, medium: 2, high: 4 };

type ChromaticAberrationProps = {
  textureSettings?: TextureOverlaySettings;
  children: React.ReactNode;
};

// Unlike the other texture overlays (Grid, Halation, ...), this doesn't paint
// an additive layer on top - it wraps whatever's passed as children (the
// video/background element specifically, see CaptionPreviewComposition/
// CaptionExportComposition/CaptionExportVideoComposition callers) in an SVG
// filter that offsets the red and blue channels in opposite directions,
// leaving green untouched, so only the wrapped layer gets the color-fringing
// effect and not captions/frame chrome painted afterward.
//
// feColorMatrix isolates each channel onto an otherwise-black layer, then
// feBlend(mode="screen") recombines them - screen(a, 0) = a, so each
// channel's own color passes through untouched while the (black) zeroed
// channels of the other layers contribute nothing. A plain feMerge would use
// normal over-compositing instead, where the topmost opaque layer fully
// occludes the ones underneath rather than adding the channels back
// together, which would just show the last layer's isolated color.
export const ChromaticAberration: React.FC<ChromaticAberrationProps> = ({ textureSettings, children }) => {
  if (!textureSettings?.chromaticAberrationEnabled) return <>{children}</>;

  const intensity = textureSettings.chromaticAberrationIntensity;
  const offset = OFFSET_PX[intensity];
  const filterId = `chromatic-aberration-${intensity}`;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="redOnly"
            />
            <feOffset in="redOnly" dx={-offset} dy="0" result="redShift" />

            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="greenOnly"
            />

            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="blueOnly"
            />
            <feOffset in="blueOnly" dx={offset} dy="0" result="blueShift" />

            <feBlend in="redShift" in2="greenOnly" mode="screen" result="redGreen" />
            <feBlend in="redGreen" in2="blueShift" mode="screen" />
          </filter>
        </defs>
      </svg>
      <div style={{ width: '100%', height: '100%', filter: `url(#${filterId})` }}>{children}</div>
    </div>
  );
};
