import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { serializeSrt } from '@remotion/captions';
import { useLayout } from '../context/LayoutContext';
import { useProject } from '../context/ProjectContext';
import { useMediaDurationFrames } from '../preview/useMediaDurationFrames';
import { PreviewPlayer } from '../preview/PreviewPlayer';
import { formatProjectId, toSafeFilename } from '../utils/filename';
import { RESOLUTION_OPTIONS, RESOLUTION_SCALE, type ResolutionOption } from '../export/resolutions';

const FPS = 30;
const POLL_INTERVAL_MS = 1000;

const triggerBlobDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const ExportPage: React.FC = () => {
  const { layoutMode } = useLayout();
  const {
    captions,
    mediaUrl,
    styleVariant,
    styleOverrides,
    overlaySettings,
    frameSettings,
    textureSettings,
    projectName,
    projectId,
  } = useProject();
  const durationInFrames = useMediaDurationFrames(mediaUrl, FPS);
  const safeFilename = toSafeFilename(projectName);

  const [selectedFormat, setSelectedFormat] = useState<'mp4' | 'chroma' | 'srt'>('chroma');
  const [resolution, setResolution] = useState<ResolutionOption>(RESOLUTION_OPTIONS[0]);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [lastRender, setLastRender] = useState('None');

  const pollHandle = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollHandle.current) clearInterval(pollHandle.current);
    };
  }, []);

  const formats = [
    {
      id: 'mp4',
      name: 'Video (MP4)',
      description: 'Requires real footage compositing - coming soon',
      icon: 'videocam',
      disabled: true,
    },
    {
      id: 'chroma',
      name: 'Chroma Key (Green Screen)',
      description: 'Captions on chroma key base',
      icon: 'auto_videocam',
      disabled: false,
    },
    {
      id: 'srt',
      name: 'SRT Only',
      description: 'SubRip subtitle text file',
      icon: 'description',
      disabled: false,
    },
  ] as const;

  const exportSrt = () => {
    if (!captions || captions.length === 0) return;
    const srtContent = serializeSrt({ lines: captions.map((caption) => [caption]) });
    triggerBlobDownload(new Blob([srtContent], { type: 'text/plain' }), `${safeFilename}.srt`);
    setExportProgress(100);
    setExportComplete(true);
    setLastRender(new Date().toLocaleTimeString());
  };

  const exportGreenScreen = async () => {
    if (!captions || captions.length === 0) return;

    setIsExporting(true);
    setExportProgress(0);
    setExportComplete(false);
    setExportError(null);

    try {
      const startResponse = await fetch('/api/export-green-screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          captions,
          styleVariant,
          styleOverrides,
          overlaySettings,
          frameSettings,
          textureSettings,
          durationInFrames,
          scale: RESOLUTION_SCALE[resolution],
          orientation: layoutMode,
        }),
      });

      if (!startResponse.ok) {
        const body = await startResponse.json().catch(() => null);
        throw new Error(body?.error ?? `Export failed (${startResponse.status})`);
      }

      const { jobId }: { jobId: string } = await startResponse.json();

      await new Promise<void>((resolve, reject) => {
        pollHandle.current = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/export-green-screen/${jobId}`);
            const status: { status: 'rendering' | 'done' | 'error'; progress: number; error?: string } =
              await statusResponse.json();

            setExportProgress(Math.round(status.progress * 100));

            if (status.status === 'error') {
              if (pollHandle.current) clearInterval(pollHandle.current);
              reject(new Error(status.error ?? 'Render failed'));
              return;
            }

            if (status.status === 'done') {
              if (pollHandle.current) clearInterval(pollHandle.current);
              const fileResponse = await fetch(`/api/export-green-screen/${jobId}/download`);
              const blob = await fileResponse.blob();
              triggerBlobDownload(blob, `${safeFilename}.mp4`);
              resolve();
            }
          } catch (error) {
            if (pollHandle.current) clearInterval(pollHandle.current);
            reject(error instanceof Error ? error : new Error('Render failed'));
          }
        }, POLL_INTERVAL_MS);
      });

      setExportProgress(100);
      setExportComplete(true);
      setLastRender(new Date().toLocaleTimeString());
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportTrigger = () => {
    if (isExporting) return;

    if (exportComplete) {
      handleReset();
      return;
    }

    if (selectedFormat === 'srt') {
      exportSrt();
      return;
    }

    if (selectedFormat === 'chroma') {
      void exportGreenScreen();
    }
  };

  const handleReset = () => {
    setExportComplete(false);
    setExportProgress(0);
    setExportError(null);
  };

  const hasCaptions = !!captions && captions.length > 0;

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Central Workspace Canvas - same live PreviewPlayer as Import/Style/Overlay,
          so this shows exactly what the export will bake in. */}
      <main className="flex-1 bg-surface-container flex items-center justify-center p-canvas-margin overflow-hidden relative">
        <div
          className={`relative bg-black rounded-xl overflow-hidden preview-canvas-shadow border-8 border-white/5 transition-all duration-300 ${layoutMode === 'horizontal'
              ? 'aspect-video w-full max-w-[800px] h-auto'
              : 'aspect-9/16 h-[calc(100vh-160px)] max-h-[720px]'
            }`}
        >
          <PreviewPlayer />
        </div>
      </main>

      {/* Right Panel: Export Tool Panel */}
      <aside className="w-panel-width min-w-panel-width max-w-panel-width bg-[#FAFAFA] border-l border-[#E5E5E5] z-40 p-gutter flex flex-col h-full shrink-0 grow-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-stack-gap">
          <div className="mb-2">
            <h3 className="text-label-caps font-label-caps text-outline uppercase tracking-widest text-[10px]">
              Finalize
            </h3>
            <h2 className="text-headline-md font-headline-md text-on-surface">Export Project</h2>
          </div>

          {/* Export Options Card */}
          <div className="bg-white border border-outline-variant rounded-xl p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <span className="text-label-caps font-label-caps text-outline uppercase text-[10px]">
                Select Format
              </span>
              <div className="flex flex-col gap-2">
                {formats.map((fmt) => (
                  <label
                    key={fmt.id}
                    className={`flex items-center p-3 rounded-lg border transition-all ${fmt.disabled
                        ? 'opacity-50 cursor-not-allowed border-outline-variant bg-white'
                        : 'cursor-pointer ' +
                        (selectedFormat === fmt.id
                          ? 'border-primary bg-primary/5'
                          : 'border-outline-variant hover:border-primary/50 bg-white')
                      }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      checked={selectedFormat === fmt.id}
                      disabled={fmt.disabled}
                      onChange={() => setSelectedFormat(fmt.id)}
                      className="w-4 h-4 text-primary border-outline focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="ml-4 flex flex-col text-left">
                      <span className="font-bold text-on-surface text-body-sm">{fmt.name}</span>
                      <span className="text-[11px] text-outline leading-tight">{fmt.description}</span>
                    </div>
                    <span
                      className={`material-symbols-outlined ml-auto ${selectedFormat === fmt.id && !fmt.disabled ? 'text-primary' : 'text-on-surface-variant'
                        }`}
                    >
                      {fmt.icon}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-outline-variant/50 my-1"></div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1 text-left">
                <span className="text-label-caps font-label-caps text-outline uppercase text-[10px]">
                  Resolution
                </span>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value as ResolutionOption)}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-2 text-body-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                >
                  {RESOLUTION_OPTIONS.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body-sm text-on-surface-variant">Watermark</span>
                <Link
                  to="/overlay"
                  className="flex items-center gap-1 text-body-sm font-semibold text-primary hover:underline"
                >
                  {overlaySettings.watermarkEnabled ? 'On' : 'Off'}
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </Link>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={handleExportTrigger}
                disabled={isExporting || !hasCaptions || selectedFormat === 'mp4'}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none text-body-sm ${exportComplete
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-primary text-white hover:bg-primary-container'
                  }`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {exportComplete ? 'check_circle' : 'download'}
                </span>
                {exportComplete
                  ? selectedFormat === 'srt'
                    ? 'Downloaded'
                    : 'Download Ready'
                  : isExporting
                    ? 'Rendering...'
                    : 'Export Project'}
              </button>

              {exportComplete && (
                <button
                  onClick={handleReset}
                  className="text-primary text-[11px] font-semibold hover:underline cursor-pointer"
                >
                  Reset Render Settings
                </button>
              )}

              {!hasCaptions && (
                <p className="text-center text-[10px] text-outline mt-1">
                  Import and transcribe media before exporting.
                </p>
              )}

              {exportError && (
                <p className="text-center text-[10px] text-error mt-1">{exportError}</p>
              )}

              <p className="text-center text-[10px] text-outline mt-1">
                Estimated file size: {selectedFormat === 'srt' ? '2.4 KB' : '42.5 MB'}
              </p>
            </div>
          </div>

          {(isExporting || (exportComplete && selectedFormat === 'chroma')) && (
            <div className="animate-in fade-in duration-200 mt-4">
              <div className="bg-white border border-primary/20 rounded-xl p-4 export-progress-pulse">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-label-caps font-label-caps text-primary font-bold">
                    {exportComplete ? 'Render Successful' : 'Rendering...'}
                  </span>
                  <span className="text-label-caps font-label-caps text-primary" id="progress-text">
                    {Math.round(exportProgress)}%
                  </span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-outline-variant space-y-2">
          <div className="flex justify-between text-[10px] font-label-caps text-outline">
            <span>PROJECT ID</span>
            <span className="text-on-surface font-semibold">{formatProjectId(projectId)}</span>
          </div>
          <div className="flex justify-between text-[10px] font-label-caps text-outline">
            <span>LAST RENDER</span>
            <span className="text-on-surface font-semibold">{lastRender}</span>
          </div>
        </div>
      </aside>
    </div>
  );
};
