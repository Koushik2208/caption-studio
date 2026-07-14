import React, { useRef } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useProject } from '../context/ProjectContext';
import { formatProjectId } from '../utils/filename';
import { useImportUpload } from './useImportUpload';

export const ImportPage: React.FC = () => {
  const { srtFile, setSrtFile, transcribeError, projectId } = useProject();
  const { handleFileSelect, isTranscribing } = useImportUpload();
  const srtInputRef = useRef<HTMLInputElement>(null);
  const mainInputRef = useRef<HTMLInputElement>(null);

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
    <>
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
    </>
  );
};
