import { CodeBlock } from './CodeBlock';
import { NumberCounter } from './NumberCounter';
import { Ticker } from './Ticker';
import type { MotionGraphicsSettings } from './types';

type MotionGraphicsRendererProps = {
  motionSettings?: MotionGraphicsSettings;
};

// Mirrors TextureOverlayRenderer's shape (src/textures/TextureOverlayRenderer.tsx)
// - each graphic is independently toggleable and painted as a sibling, not a
// mutually-exclusive variant switch like FrameRenderer. Stack order: Ticker
// (thin edge bar) first, NumberCounter (small bottom-center readout) next,
// CodeBlock (largest panel, most visually dominant) last so it paints on top.
export const MotionGraphicsRenderer: React.FC<MotionGraphicsRendererProps> = ({ motionSettings }) => {
  if (!motionSettings) return null;

  return (
    <>
      {motionSettings.tickerEnabled && (
        <Ticker
          text={motionSettings.tickerText}
          direction={motionSettings.tickerDirection}
          position={motionSettings.tickerPosition}
        />
      )}
      {motionSettings.numberCounterEnabled && (
        <NumberCounter
          startNumber={motionSettings.numberCounterStart}
          endNumber={motionSettings.numberCounterEnd}
          prefix={motionSettings.numberCounterPrefix}
          suffix={motionSettings.numberCounterSuffix}
        />
      )}
      {motionSettings.codeBlockEnabled && (
        <CodeBlock
          code={motionSettings.codeBlockCode}
          language={motionSettings.codeBlockLanguage}
          position={motionSettings.codeBlockPosition}
          linesPerPage={motionSettings.codeBlockLinesPerPage}
        />
      )}
    </>
  );
};
