import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { serializeSrt } from '@remotion/captions';
import { useLayout } from '../context/LayoutContext';
import { useProject } from '../context/ProjectContext';
import { useMediaDurationFrames } from '../preview/useMediaDurationFrames';
import { formatProjectId, toSafeFilename } from '../utils/filename';
import { RESOLUTION_OPTIONS, RESOLUTION_SCALE, type ResolutionOption } from '../export/resolutions';
import { serializeCreativeProject } from '../creative/index.js';

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
    mediaFile,
    mediaUrl,
    styleVariant,
    styleOverrides,
    overlaySettings,
    frameSettings,
    textureSettings,
    motionSettings,
    videoMotion,
    assetSettings,
    audioAmplitude,
    projectName,
    projectId,
    exportCreativeProject,
  } = useProject();
  const durationInFrames = useMediaDurationFrames(mediaUrl, FPS);
  const captionDurationFrames =
    captions && captions.length > 0
      ? Math.max(1, Math.ceil((captions[captions.length - 1].endMs / 1000) * FPS))
      : 150;
  const effectiveDurationFrames =
    mediaUrl && durationInFrames > 0 ? Math.max(durationInFrames, captionDurationFrames) : captionDurationFrames;
  const safeFilename = toSafeFilename(projectName);
  const mp4Available = !!mediaFile && mediaFile.type.startsWith('video/');

  const [selectedFormat, setSelectedFormat] = useState<'mp4' | 'chroma' | 'srt' | 'json'>('chroma');
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

  // mediaFile only lives in memory (lost on reload, unlike the localStorage-
  // cached transcript) and MP4 export needs its real bytes, so if it drops
  // out from under a selected 'mp4' format, fall back rather than leaving
  // the export button permanently disabled with no way out of this page.
  useEffect(() => {
    if (!mp4Available && selectedFormat === 'mp4') {
      setSelectedFormat('chroma');
    }
  }, [mp4Available, selectedFormat]);

  const formats = [
    {
      id: 'mp4',
      name: 'Video (MP4)',
      description: mp4Available
        ? 'Captions burned onto your uploaded video'
        : 'Re-upload your video to enable (audio-only sources use Chroma Key)',
      icon: 'videocam',
      disabled: !mp4Available,
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
    {
      id: 'json',
      name: 'Creative JSON',
      description: 'Versioned AI Creative Document (beats, styles, assets)',
      icon: 'data_object',
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

  const exportCreativeJson = () => {
    const project = exportCreativeProject();
    const jsonContent = serializeCreativeProject(project, true);
    triggerBlobDownload(new Blob([jsonContent], { type: 'application/json' }), `${safeFilename}.creative.json`);
    setExportProgress(100);
    setExportComplete(true);
    setLastRender(new Date().toLocaleTimeString());
  };

  // Shared by exportGreenScreen/exportVideo: both start a server render job
  // and then poll+download identically, only the endpoint prefix (and how
  // the start request itself is built - JSON vs multipart) differs.
  const trackRenderJob = async (startResponse: Response, endpointBase: string) => {
    if (!startResponse.ok) {
      const body = await startResponse.json().catch(() => null);
      throw new Error(body?.error ?? `Export failed (${startResponse.status})`);
    }

    const { jobId }: { jobId: string } = await startResponse.json();

    await new Promise<void>((resolve, reject) => {
      pollHandle.current = setInterval(async () => {
        try {
          const statusResponse = await fetch(`${endpointBase}/${jobId}`);
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
            const fileResponse = await fetch(`${endpointBase}/${jobId}/download`);
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
          motionSettings,
          videoMotion,
          assetSettings,
          audioAmplitude,
          durationInFrames: effectiveDurationFrames,
          scale: RESOLUTION_SCALE[resolution],
          orientation: layoutMode,
        }),
      });

      await trackRenderJob(startResponse, '/api/export-green-screen');
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const exportVideo = async () => {
    if (!captions || captions.length === 0 || !mediaFile || !mp4Available) return;

    setIsExporting(true);
    setExportProgress(0);
    setExportComplete(false);
    setExportError(null);

    try {
      const formData = new FormData();
      formData.append('media', mediaFile);
      formData.append(
        'payload',
        JSON.stringify({
          captions,
          styleVariant,
          styleOverrides,
          overlaySettings,
          frameSettings,
          textureSettings,
          motionSettings,
          videoMotion,
          assetSettings,
          audioAmplitude,
          durationInFrames: effectiveDurationFrames,
          scale: RESOLUTION_SCALE[resolution],
          orientation: layoutMode,
        }),
      );

      const startResponse = await fetch('/api/export-video', {
        method: 'POST',
        body: formData,
      });

      await trackRenderJob(startResponse, '/api/export-video');
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

    if (selectedFormat === 'json') {
      exportCreativeJson();
      return;
    }

    if (selectedFormat === 'chroma') {
      void exportGreenScreen();
      return;
    }

    if (selectedFormat === 'mp4') {
      void exportVideo();
    }
  };

  const handleReset = () => {
    setExportComplete(false);
    setExportProgress(0);
    setExportError(null);
  };

  const hasCaptions = !!captions && captions.length > 0;

  return (
    <>
      {/* Right Panel: Export Tool Panel */}
      <aside className="w-full bg-surface-bright p-gutter flex flex-col h-full shrink-0 grow-0 overflow-hidden">
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
                  to="/style"
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
                disabled={isExporting || !hasCaptions || (selectedFormat === 'mp4' && !mp4Available)}
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
                  Import media and captions or Creative JSON before exporting.
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

          {(isExporting || (exportComplete && (selectedFormat === 'chroma' || selectedFormat === 'mp4'))) && (
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
    </>
  );
};
