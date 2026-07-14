import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { useImportUpload } from '../../pages/useImportUpload';
import { UploadArea } from './UploadArea';

// Rendered by ToolLayout on top of the always-mounted PreviewPlayer canvas
// when on the Import route, so PreviewPlayer never has to unmount just
// because there's nothing to preview yet.
export const ImportCanvasOverlay: React.FC = () => {
  const { mediaUrl, captions } = useProject();
  const { handleFileSelect, isTranscribing } = useImportUpload();
  const hasContent = !!mediaUrl || (!!captions && captions.length > 0);

  if (!hasContent) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-surface-container p-canvas-margin z-10">
        <UploadArea onFileSelect={handleFileSelect} />
      </div>
    );
  }

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

  return null;
};
