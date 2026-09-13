import React, { useRef } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useProject } from '../context/ProjectContext';
import { formatProjectId } from '../utils/filename';
import { useImportUpload } from './useImportUpload';

export const ImportPage: React.FC = () => {
  const { mediaFile, srtFile, transcribeError, projectId } = useProject();
  const {
    handleFileSelect,
    handleSrtUpload,
    handleTranscribe,
    handleContinueWithoutCaptions,
    isTranscribing,
  } = useImportUpload();

  const srtInputRef = useRef<HTMLInputElement>(null);
  const mainInputRef = useRef<HTMLInputElement>(null);

  const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSrtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) {
      handleSrtUpload(file);
    }
  };

  return (
    <>
      {/* Right Tool Panel */}
      <aside className="w-full bg-surface-container-low flex flex-col h-full shrink-0 grow-0 overflow-hidden">
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
          <input
            ref={mainInputRef}
            type="file"
            className="hidden"
            accept="video/*,audio/*"
            onChange={handleMainFileChange}
          />
          <input
            ref={srtInputRef}
            type="file"
            className="hidden"
            accept=".srt"
            onChange={handleSrtChange}
          />

          {!mediaFile ? (
            <>
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
                <Button
                  className="w-full text-body-sm group-hover:opacity-90"
                  disabled={isTranscribing}
                  onClick={() => mainInputRef.current?.click()}
                >
                  Select from local
                </Button>
              </Card>

              {/* Card 2: Import SRT */}
              <Card hoverable onClick={() => srtInputRef.current?.click()} className="group">
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
                {srtFile && (
                  <div className="mt-2 flex items-center gap-1.5 text-body-sm text-primary">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Script loaded
                  </div>
                )}
              </Card>
            </>
          ) : (
            <>
              {/* Attached Media Card */}
              <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/60 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">
                      {mediaFile.type.startsWith('audio/') ? 'audio_file' : 'video_file'}
                    </span>
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-body-sm font-bold text-on-surface truncate">{mediaFile.name}</p>
                    <p className="text-[11px] text-on-surface-variant">
                      {(mediaFile.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => mainInputRef.current?.click()}
                  className="text-xs text-primary hover:underline shrink-0 ml-2 font-medium"
                >
                  Change
                </button>
              </div>

              {/* Caption Options Section */}
              <div className="mt-2">
                <p className="text-body-sm font-bold text-on-surface mb-2.5">
                  How do you want to add captions?
                </p>

                <div className="flex flex-col gap-2.5">
                  {/* Option 1: Upload SRT */}
                  <Card
                    hoverable
                    onClick={() => srtInputRef.current?.click()}
                    className="p-3.5 border-outline-variant hover:border-primary/50 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-lg">description</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                          Upload SRT
                        </p>
                        <p className="text-[12px] text-on-surface-variant leading-snug mt-0.5">
                          Use pre-existing subtitles without running Whisper
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Option 2: Transcribe */}
                  <Card
                    hoverable
                    onClick={handleTranscribe}
                    className="p-3.5 border-outline-variant hover:border-primary/50 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-lg">record_voice_over</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                          Transcribe Video
                        </p>
                        <p className="text-[12px] text-on-surface-variant leading-snug mt-0.5">
                          Generate word-level timestamps with local Whisper.cpp
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Option 3: Continue without captions */}
                  <Button
                    variant="ghost"
                    onClick={handleContinueWithoutCaptions}
                    className="w-full text-xs text-on-surface-variant hover:text-on-surface mt-1"
                  >
                    Continue without captions →
                  </Button>
                </div>
              </div>
            </>
          )}

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
