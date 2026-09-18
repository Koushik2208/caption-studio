import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

export type TerminalFrameProps = {
  width: number;
  height: number;
  children: React.ReactNode;
};

const DOT_COLORS = ['#FF5F56', '#FFBD2E', '#27C93F'];

export const TERMINAL_TITLE_BAR_HEIGHT = 48;
export const TERMINAL_TAB_BAR_HEIGHT = 36;
export const TERMINAL_GUTTER_WIDTH = 52;
export const TERMINAL_STATUS_BAR_HEIGHT = 28;

/**
 * TerminalFrame:
 * Developer / code editor shell featuring macOS traffic-light controls, title bar,
 * active tab header, scrolling line-number gutter, status bar, and clipped inner content viewport.
 * Fully responsive to composition dimensions.
 */
export const TerminalFrame: React.FC<TerminalFrameProps> = ({ width, height, children }) => {
  const frame = useCurrentFrame();
  const scaleRatio = width / 1080;

  const titleBarHeight = Math.round(TERMINAL_TITLE_BAR_HEIGHT * scaleRatio);
  const tabBarHeight = Math.round(TERMINAL_TAB_BAR_HEIGHT * scaleRatio);
  const gutterWidth = Math.round(TERMINAL_GUTTER_WIDTH * scaleRatio);
  const statusBarHeight = Math.round(TERMINAL_STATUS_BAR_HEIGHT * scaleRatio);

  const dotSize = Math.max(6, Math.round(10 * scaleRatio));
  const dotGap = Math.max(4, Math.round(8 * scaleRatio));
  const outerRadius = Math.max(8, Math.round(16 * scaleRatio));

  const contentTop = titleBarHeight + tabBarHeight;
  const contentLeft = gutterWidth;
  const contentWidth = width - gutterWidth;
  const contentHeight = height - contentTop - statusBarHeight;

  const lineHeight = Math.max(16, Math.round(28 * scaleRatio));
  const gutterBlockHeight = lineHeight * 20;
  const gutterOffset = -((frame * 0.4) % gutterBlockHeight);
  const cursorVisible = Math.floor(frame / 20) % 2 === 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1E1E1E',
        borderRadius: outerRadius,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.75)',
      }}
    >
      {/* 1. Title Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: titleBarHeight,
          backgroundColor: '#252526',
          borderBottom: '1px solid #333333',
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${Math.round(16 * scaleRatio)}px`,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', gap: dotGap }}>
          {DOT_COLORS.map((c, i) => (
            <div
              key={i}
              style={{
                width: dotSize,
                height: dotSize,
                borderRadius: '50%',
                backgroundColor: c,
              }}
            />
          ))}
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            textAlign: 'center',
            color: '#CCCCCC',
            fontSize: Math.max(11, Math.round(14 * scaleRatio)),
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            pointerEvents: 'none',
          }}
        >
          caption-studio — main.ts
        </div>
      </div>

      {/* 2. Tab Bar */}
      <div
        style={{
          position: 'absolute',
          top: titleBarHeight,
          left: 0,
          right: 0,
          height: tabBarHeight,
          backgroundColor: '#181818',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #282828',
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            padding: `0 ${Math.round(18 * scaleRatio)}px`,
            backgroundColor: '#1E1E1E',
            color: '#FFFFFF',
            fontSize: Math.max(10, Math.round(13 * scaleRatio)),
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            borderTop: '2px solid #007ACC',
            borderRight: '1px solid #282828',
          }}
        >
          <span style={{ color: '#007ACC', marginRight: 6 }}>TS</span> main.ts
        </div>
      </div>

      {/* 3. Line Number Gutter */}
      <div
        style={{
          position: 'absolute',
          top: contentTop,
          left: 0,
          width: gutterWidth,
          height: contentHeight,
          backgroundColor: '#1E1E1E',
          borderRight: '1px solid #2A2A2A',
          overflow: 'hidden',
          zIndex: 5,
        }}
      >
        <div style={{ position: 'absolute', top: gutterOffset, left: 0, right: 0 }}>
          {Array.from({ length: 40 }, (_, i) => (
            <div
              key={i}
              style={{
                height: lineHeight,
                lineHeight: `${lineHeight}px`,
                textAlign: 'right',
                paddingRight: Math.round(10 * scaleRatio),
                color: '#6E7681',
                fontSize: Math.max(9, Math.round(13 * scaleRatio)),
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              }}
            >
              {(i % 25) + 1}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Inner Content Viewport */}
      <div
        style={{
          position: 'absolute',
          top: contentTop,
          left: contentLeft,
          width: contentWidth,
          height: contentHeight,
          overflow: 'hidden',
          backgroundColor: '#0D0D12',
        }}
      >
        <AbsoluteFill>{children}</AbsoluteFill>

        {/* Floating Editor Cursor Hint */}
        <div
          style={{
            position: 'absolute',
            left: Math.round(12 * scaleRatio),
            bottom: Math.round(12 * scaleRatio),
            width: Math.max(2, Math.round(2 * scaleRatio)),
            height: Math.max(14, Math.round(20 * scaleRatio)),
            backgroundColor: '#007ACC',
            opacity: cursorVisible ? 0.9 : 0,
            pointerEvents: 'none',
            zIndex: 20,
          }}
        />
      </div>

      {/* 5. Status Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: statusBarHeight,
          backgroundColor: '#007ACC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `0 ${Math.round(12 * scaleRatio)}px`,
          zIndex: 10,
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontSize: Math.max(9, Math.round(11 * scaleRatio)),
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          }}
        >
          ● main
        </span>
        <div style={{ display: 'flex', gap: Math.round(12 * scaleRatio) }}>
          <span
            style={{
              color: '#FFFFFF',
              fontSize: Math.max(9, Math.round(11 * scaleRatio)),
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            }}
          >
            TypeScript
          </span>
          <span
            style={{
              color: '#FFFFFF',
              fontSize: Math.max(9, Math.round(11 * scaleRatio)),
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            }}
          >
            UTF-8
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
