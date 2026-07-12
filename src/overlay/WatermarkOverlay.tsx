import { AbsoluteFill } from 'remotion';
import type { WatermarkPosition } from './types';

// Plain text/CSS only (no icon font) - this renders both in the browser
// Player preview and in the headless-Chrome export render, where an
// external icon-font link tag isn't guaranteed to be loaded.
const POSITION_STYLE: Record<WatermarkPosition, React.CSSProperties> = {
  tl: { top: 48, left: 48 },
  tr: { top: 48, right: 48 },
  bl: { bottom: 96, left: 48 },
  br: { bottom: 96, right: 48 },
};

type WatermarkOverlayProps = {
  opacity: number;
  position: WatermarkPosition;
};

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({ opacity, position }) => {
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          ...POSITION_STYLE[position],
          opacity: opacity / 100,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: 'white',
          fontFamily: 'sans-serif',
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 2,
          textTransform: 'uppercase',
          textShadow: '0 1px 6px rgba(0,0,0,0.6)',
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: 'white',
            display: 'inline-block',
          }}
        />
        Caption Studio
      </div>
    </AbsoluteFill>
  );
};
