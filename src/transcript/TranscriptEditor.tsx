import React from 'react';
import { useProject } from '../context/ProjectContext';

// Read-only first (PLAN.md Part H, build order step 1): renders the word-level
// Caption[] already in ProjectContext as a wrapped token sequence. Click-to-edit
// and empty-text deletion land in later steps on top of this same markup.
export const TranscriptEditor: React.FC = () => {
  const { captions } = useProject();

  if (!captions || captions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-body-sm text-on-surface-variant">
        No transcript yet - import media to generate captions.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-outline-variant px-4 py-3">
        <h3 className="text-label-caps font-label-caps tracking-wider text-outline">TRANSCRIPT</h3>
        <p className="mt-0.5 text-body-sm text-on-surface-variant">{captions.length} words</p>
      </div>
      <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
        <div className="flex flex-wrap gap-x-1.5 gap-y-2 leading-relaxed">
          {captions.map((caption, index) => (
            <span key={index} className="text-body-md text-on-surface">
              {caption.text.trim()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
