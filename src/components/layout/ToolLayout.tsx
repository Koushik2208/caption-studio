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
    mainClassName: 'w-full lg:flex-1 p-2 sm:p-4 lg:p-canvas-margin flex items-center justify-center bg-surface-container overflow-hidden relative shrink-0',
    canvasClassName: 'relative bg-black rounded-xl sm:rounded-2xl overflow-hidden canvas-shadow border border-outline-variant/30 transition-all duration-300',
  },
  '/style': {
    mainClassName: 'w-full lg:flex-1 p-2 sm:p-4 lg:p-canvas-margin flex items-center justify-center bg-surface overflow-hidden relative shrink-0',
    canvasClassName: 'relative bg-black rounded-xl sm:rounded-2xl overflow-hidden canvas-shadow border border-outline-variant/30 transition-all duration-300',
    showAspectTag: true,
  },
  '/export': {
    mainClassName: 'w-full lg:flex-1 bg-surface-container flex items-center justify-center p-2 sm:p-4 lg:p-canvas-margin overflow-hidden relative shrink-0',
    canvasClassName: 'relative bg-black rounded-xl overflow-hidden preview-canvas-shadow border-4 sm:border-8 border-white/5 transition-all duration-300',
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
    <div className="flex flex-col lg:flex-row h-full w-full overflow-y-auto lg:overflow-hidden">
      <main className={config.mainClassName}>
        <div
          className={`${config.canvasClassName} ${
            layoutMode === 'horizontal'
              ? 'aspect-video w-full max-w-[95%] sm:max-w-[480px] md:max-w-[600px] lg:max-w-[800px] h-auto mx-auto'
              : 'aspect-9/16 h-[260px] sm:h-[350px] md:h-[400px] lg:h-[calc(100vh-160px)] max-h-[46vh] lg:max-h-[720px] max-w-full mx-auto'
          }`}
        >
          <PreviewPlayer />
        </div>

        {pathname === '/import' && <ImportCanvasOverlay />}

        {(config.showAspectTag || config.showResolutionTag) && (
          <div className="hidden sm:flex absolute top-3 left-3 lg:top-8 lg:left-8 items-center gap-2">
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

      {/* Right Panel: Fixed-width on Desktop (>= 1024px), Full-width on Mobile/Tablet */}
      <div className="w-full lg:w-[460px] lg:min-w-[460px] lg:max-w-[460px] flex-1 lg:flex-initial lg:h-full shrink-0 grow-0 border-t lg:border-t-0 lg:border-l border-outline-variant bg-surface-bright flex flex-col overflow-hidden min-h-[380px] lg:min-h-0">
        <Outlet />
      </div>
    </div>
  );
};
