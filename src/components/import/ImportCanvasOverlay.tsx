import React, { useRef } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useImportUpload } from '../../pages/useImportUpload';
import { UploadArea } from './UploadArea';
import { Button } from '../common/Button';

// Rendered by ToolLayout on top of the always-mounted PreviewPlayer canvas
// when on the Import route, so PreviewPlayer never has to unmount just
// because there's nothing to preview yet.
export const ImportCanvasOverlay: React.FC = () => {
  const { mediaUrl, mediaFile, captions } = useProject();
  const {
    handleFileSelect,
    handleSrtUpload,
    handleTranscribe,
    handleContinueWithoutCaptions,
    isTranscribing,
  } = useImportUpload();
  const srtInputRef = useRef<HTMLInputElement>(null);

  const hasMedia = !!mediaUrl;
  const hasCaptions = !!captions && captions.length > 0;

  if (isTranscribing) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-container/80 backdrop-blur-sm z-10">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
        <p className="text-body-md font-bold text-on-surface">Transcribing audio...</p>
        <p className="text-body-sm text-on-surface-variant">
          Running local Whisper.cpp - this can take a minute for longer files.
        </p>
      </div>
    );
  }

  if (!hasMedia && !hasCaptions) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-surface-container p-canvas-margin z-10">
        <UploadArea onFileSelect={handleFileSelect} />
      </div>
    );
  }

  if (hasMedia && !hasCaptions) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs p-6 z-10">
        <input
          ref={srtInputRef}
          type="file"
          className="hidden"
          accept=".srt"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) handleSrtUpload(file);
          }}
        />
        <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-6 max-w-md w-full canvas-shadow flex flex-col gap-4 text-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-2xl">subtitles</span>
            </div>
            <h3 className="text-headline-md font-headline-md text-on-surface">
              How do you want to add captions?
            </h3>
            <p className="text-body-sm text-on-surface-variant">
              Choose an option for <span className="font-semibold text-on-surface">{mediaFile?.name ?? 'your media'}</span>
            </p>
          </div>

          <div className="flex flex-col gap-2.5 mt-1">
            <Button
              variant="secondary"
              onClick={() => srtInputRef.current?.click()}
              className="w-full py-3 justify-start px-4 text-left hover:border-primary"
            >
              <span className="material-symbols-outlined text-primary text-xl">description</span>
              <div className="flex flex-col items-start">
                <span className="text-body-sm font-bold">Upload SRT</span>
                <span className="text-[11px] text-on-surface-variant font-normal">Use your existing subtitle file</span>
              </div>
            </Button>

            <Button
              variant="primary"
              onClick={handleTranscribe}
              className="w-full py-3 justify-start px-4 text-left"
            >
              <span className="material-symbols-outlined text-on-primary text-xl">record_voice_over</span>
              <div className="flex flex-col items-start">
                <span className="text-body-sm font-bold">Transcribe Video</span>
                <span className="text-[11px] text-on-primary/80 font-normal">Auto-generate captions with Whisper</span>
              </div>
            </Button>

            <Button
              variant="ghost"
              onClick={handleContinueWithoutCaptions}
              className="text-xs text-on-surface-variant hover:text-on-surface mt-1"
            >
              Continue without captions →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
