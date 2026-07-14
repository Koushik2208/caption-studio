import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';

// Click-to-edit (PLAN.md Part H, build order step 2): each token is a plain
// span until clicked, then swaps to an inline input; committing writes
// straight back into ProjectContext.captions via updateCaptionText - no
// separate edit-buffer state shape. Empty-text deletion is intentionally not
// specially handled yet (H3, still pending: processCaptions.ts needs a
// filter-before-pipeline step so an emptied token doesn't break char-budget/
// min-duration merge math) - editing to empty already works here, it's just
// not guaranteed safe through the caption pipeline until that lands.
export const TranscriptEditor: React.FC = () => {
  const { captions, updateCaptionText } = useProject();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftText, setDraftText] = useState('');

  if (!captions || captions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-body-sm text-on-surface-variant">
        No transcript yet - import media to generate captions.
      </div>
    );
  }

  const startEditing = (index: number, currentText: string) => {
    setEditingIndex(index);
    setDraftText(currentText);
  };

  const commitEdit = () => {
    if (editingIndex !== null) {
      updateCaptionText(editingIndex, draftText);
    }
    setEditingIndex(null);
  };

  const cancelEdit = () => setEditingIndex(null);

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-outline-variant px-4 py-3">
        <h3 className="text-label-caps font-label-caps tracking-wider text-outline">TRANSCRIPT</h3>
        <p className="mt-0.5 text-body-sm text-on-surface-variant">{captions.length} words - click a word to fix it</p>
      </div>
      <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
        <div className="flex flex-wrap gap-x-1.5 gap-y-2 leading-relaxed">
          {captions.map((caption, index) =>
            editingIndex === index ? (
              <input
                key={index}
                autoFocus
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                onFocus={(e) => e.currentTarget.select()}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitEdit();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelEdit();
                  }
                }}
                style={{ width: `${Math.max(2, draftText.length + 1)}ch` }}
                className="rounded border border-primary bg-surface px-1 text-body-md text-on-surface outline-none"
              />
            ) : (
              <span
                key={index}
                role="button"
                tabIndex={0}
                onClick={() => startEditing(index, caption.text.trim())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') startEditing(index, caption.text.trim());
                }}
                className="cursor-pointer rounded px-0.5 text-body-md text-on-surface hover:bg-primary-container/40"
              >
                {caption.text.trim() || '  '}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
};
