import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadArea } from '../components/import/UploadArea';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useLayout } from '../context/LayoutContext';
import { useProject } from '../context/ProjectContext';
import { PreviewPlayer } from '../preview/PreviewPlayer';
import { formatProjectId } from '../utils/filename';

export const ImportPage: React.FC = () => {
  const navigate = useNavigate();
  const { layoutMode } = useLayout();
  const { mediaUrl, captions, srtFile, setSrtFile, transcribe, transcribeStatus, transcribeError, projectId } =
    useProject();
  const srtInputRef = useRef<HTMLInputElement>(null);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const isTranscribing = transcribeStatus === 'uploading';

  const handleFileSelect = async (file: File) => {
    if (isTranscribing) return;
    try {
      await transcribe(file);
      navigate('/style');
    } catch {
      // transcribeError is already surfaced in the panel below
    }
  };

  const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSRTClick = () => {
    if (isTranscribing) return;
    srtInputRef.current?.click();
  };

  const handleSrtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSrtFile(file);
    }
    e.target.value = '';
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Central Workspace Canvas */}
      <main className="flex-1 p-canvas-margin flex items-center justify-center bg-surface-container overflow-hidden relative">
        {mediaUrl || (captions && captions.length > 0) ? (
          <div
            className={`relative bg-black rounded-2xl overflow-hidden canvas-shadow border border-outline-variant/30 transition-all duration-300 ${layoutMode === 'horizontal'
                ? 'aspect-video w-full max-w-[800px] h-auto'
                : 'aspect-9/16 h-[calc(100vh-160px)] max-h-[720px]'
              }`}
          >
            <PreviewPlayer />
          </div>
        ) : (
          <UploadArea onFileSelect={handleFileSelect} />
        )}
        {isTranscribing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-container/80 backdrop-blur-sm">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
            <p className="text-body-md font-bold text-on-surface">Transcribing audio...</p>
            <p className="text-body-sm text-on-surface-variant">
              Running local Whisper.cpp - this can take a minute for longer files.
            </p>
          </div>
        )}
      </main>

      {/* Right Tool Panel */}
      <aside className="w-panel-width min-w-panel-width max-w-panel-width border-l border-outline-variant bg-surface-container-low flex flex-col h-full shrink-0 grow-0">
        {/* Panel Header */}
        <div className="p-6 border-b border-outline-variant">
          <h3 className="text-label-caps font-label-caps text-primary tracking-widest mb-1">
            TOOL PANEL
          </h3>
          <h2 className="text-headline-md font-headline-md text-on-surface">
            Import Content
          </h2>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-stack-gap">
          {/* Card 1: Upload File */}
          <Card hoverable className="group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary-container/10 group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined">upload</span>
              </div>
              <div>
                <p className="text-body-md font-bold text-on-surface">Upload File</p>
                <p className="text-label-caps font-label-caps text-on-surface-variant uppercase text-[10px]">
                  MP4, MOV, MP3, WAV
                </p>
              </div>
            </div>
            <input
              ref={mainInputRef}
              type="file"
              className="hidden"
              accept="video/*,audio/*"
              onChange={handleMainFileChange}
            />
            <Button
              className="w-full text-body-sm group-hover:opacity-90"
              disabled={isTranscribing}
              onClick={() => mainInputRef.current?.click()}
            >
              Select from local
            </Button>
          </Card>

          {/* Card 2: Import SRT */}
          <Card hoverable onClick={handleSRTClick} className="group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary-container/10 group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined">subtitles</span>
              </div>
              <div>
                <p className="text-body-md font-bold text-on-surface">Import SRT</p>
                <p className="text-label-caps font-label-caps text-on-surface-variant uppercase text-[10px]">
                  {srtFile ? srtFile.name : 'External script file (optional)'}
                </p>
              </div>
            </div>
            <input
              ref={srtInputRef}
              type="file"
              className="hidden"
              accept=".srt"
              onChange={handleSrtChange}
            />
            {srtFile && (
              <div className="mt-2 flex items-center gap-1.5 text-body-sm text-primary">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Script attached - wording will win over Whisper's guess
              </div>
            )}
          </Card>

          {transcribeError && (
            <div className="p-4 rounded-xl bg-error/5 border border-error/20">
              <p className="text-body-sm text-error leading-relaxed">{transcribeError}</p>
            </div>
          )}

          {/* Info Card */}
          <div className="mt-4 p-4 rounded-xl bg-primary-container/5 border border-primary/10">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-primary text-sm mt-0.5">
                info
              </span>
              <p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
                Files up to 2GB are supported. Max duration is 60 minutes for basic projects.
              </p>
            </div>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="p-4 bg-surface-container border-t border-outline-variant">
          <div className="flex justify-between items-center opacity-60">
            <span className="text-label-caps font-label-caps uppercase text-[10px]">
              Project ID: {formatProjectId(projectId)}
            </span>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-sm">history</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
