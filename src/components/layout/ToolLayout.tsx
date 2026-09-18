import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useLayout } from '../../context/LayoutContext';
import { PreviewPlayer } from '../../preview/PreviewPlayer';
import { ImportCanvasOverlay } from '../import/ImportCanvasOverlay';

type CanvasConfig = {
  mainClassName: string;
  canvasClassName: string;
  showAspectTag?: boolean;
  showResolutionTag?: boolean;
};

const CANVAS_CONFIG: Record<string, CanvasConfig> = {
  '/import': {
    mainClassName: 'flex-1 p-canvas-margin flex items-center justify-center bg-surface-container overflow-hidden relative',
    canvasClassName: 'relative bg-black rounded-2xl overflow-hidden canvas-shadow border border-outline-variant/30 transition-all duration-300',
  },
  '/style': {
    mainClassName: 'flex-1 p-canvas-margin flex items-center justify-center bg-surface overflow-hidden relative',
    canvasClassName: 'relative bg-black rounded-2xl overflow-hidden canvas-shadow border border-outline-variant/30 transition-all duration-300',
    showAspectTag: true,
  },
  '/export': {
    mainClassName: 'flex-1 bg-surface-container flex items-center justify-center p-canvas-margin overflow-hidden relative',
    canvasClassName: 'relative bg-black rounded-xl overflow-hidden preview-canvas-shadow border-8 border-white/5 transition-all duration-300',
  },
};

// Parent route for Import/Style/Export. Owns the single PreviewPlayer
// instance so navigating between tool tabs only swaps the <Outlet /> (right
// tool panel), never the player itself - React Router keeps this component
// mounted across those route changes, so playback survives navigation.
export const ToolLayout: React.FC = () => {
  const { pathname } = useLocation();
  const { layoutMode } = useLayout();
  // Sub-panel routes (e.g. /style/fonts, /overlay/frames) share their parent
  // tab's canvas styling - key off the first path segment, not the full path.
  const baseSegment = `/${pathname.split('/')[1] ?? ''}`;
  const config = CANVAS_CONFIG[baseSegment] ?? CANVAS_CONFIG['/import'];

  return (
    <div className="flex h-full w-full overflow-hidden">
      <main className={config.mainClassName}>
        <div
          className={`${config.canvasClassName} ${
            layoutMode === 'horizontal' ? 'aspect-video w-full max-w-[800px] h-auto' : 'aspect-9/16 h-[calc(100vh-160px)] max-h-[720px]'
          }`}
        >
          <PreviewPlayer />
        </div>

        {pathname === '/import' && <ImportCanvasOverlay />}

        {(config.showAspectTag || config.showResolutionTag) && (
          <div className="absolute top-8 left-8 flex items-center gap-2">
            {config.showAspectTag && (
              <div className="px-3 py-1 bg-surface-container-lowest rounded-full border border-outline-variant/60 flex items-center gap-1.5 shadow-xs">
                <span className="material-symbols-outlined text-[15px] text-on-surface-variant">aspect_ratio</span>
                <span className="text-label-caps font-label-caps text-[10px] text-on-surface-variant uppercase">
                  {layoutMode === 'horizontal' ? '16:9 Horizontal' : '9:16 Vertical'}
                </span>
              </div>
            )}
            {config.showResolutionTag && (
              <div className="px-3 py-1 bg-surface-container-lowest rounded-full border border-outline-variant/60 flex items-center gap-1.5 shadow-xs">
                <span className="material-symbols-outlined text-[15px] text-on-surface-variant">hd</span>
                <span className="text-label-caps font-label-caps text-[10px] text-on-surface-variant uppercase">
                  {layoutMode === 'horizontal' ? '4K Landscape' : '1080p Portrait'}
                </span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Fixed-Width Right Panel: Locked width across all tabs to prevent center preview shift */}
      <div className="w-[460px] min-w-[460px] max-w-[460px] h-full shrink-0 grow-0 border-l border-outline-variant bg-surface-bright flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};
