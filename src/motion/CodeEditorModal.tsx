import React, { useState } from 'react';
import { useLayout } from '../context/LayoutContext';
import { useProject } from '../context/ProjectContext';
import { CODE_LANGUAGE_LABELS } from './types';
import type { CodeBlockPosition, CodeLanguage } from './types';

const LANGUAGE_OPTIONS: CodeLanguage[] = ['python', 'sql', 'r', 'bash', 'js'];
const POSITION_OPTIONS: CodeBlockPosition[] = ['top', 'center', 'bottom'];

// Outer shell rendered once at the App root (see App.tsx), same as
// SettingsModal/TranscriptEditorModal - but CodeEditorModalContent below only
// mounts while isCodeEditorOpen is true, so its local draft state (see
// reel-craft's own CodeEditorModal.tsx, which this ports) is always
// initialized fresh from ProjectContext on each open instead of going stale
// after the first open/close cycle.
export const CodeEditorModal: React.FC = () => {
  const { isCodeEditorOpen } = useLayout();
  if (!isCodeEditorOpen) return null;
  return <CodeEditorModalContent />;
};

type Draft = {
  code: string;
  language: CodeLanguage;
  position: CodeBlockPosition;
  linesPerPage: number;
};

const CodeEditorModalContent: React.FC = () => {
  const { setIsCodeEditorOpen } = useLayout();
  const {
    codeBlockCode,
    setCodeBlockCode,
    codeBlockLanguage,
    setCodeBlockLanguage,
    codeBlockPosition,
    setCodeBlockPosition,
    codeBlockLinesPerPage,
    setCodeBlockLinesPerPage,
  } = useProject();

  const [draft, setDraft] = useState<Draft>({
    code: codeBlockCode,
    language: codeBlockLanguage,
    position: codeBlockPosition,
    linesPerPage: codeBlockLinesPerPage,
  });

  const close = () => setIsCodeEditorOpen(false);

  const handleSave = () => {
    setCodeBlockCode(draft.code);
    setCodeBlockLanguage(draft.language);
    setCodeBlockPosition(draft.position);
    setCodeBlockLinesPerPage(draft.linesPerPage);
    close();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-label="Edit Code Block"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-outline-variant/60 px-5 py-4">
          <h2 className="text-headline-md font-headline-md font-bold text-on-surface">Edit Code Block</h2>
          <button
            onClick={close}
            aria-label="Close"
            className="rounded-lg p-1.5 text-on-surface-variant transition hover:bg-surface-container active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase text-[10px]">
              Code
            </span>
            <textarea
              rows={14}
              value={draft.code}
              placeholder="Paste your code here..."
              onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))}
              className="w-full resize-y rounded-xl border border-outline-variant/60 bg-[#1E1E1E] px-3 py-3 font-mono text-[13px] text-[#D4D4D4] outline-none transition focus:border-primary/60"
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase text-[10px]">
              Language
            </span>
            <div className="grid grid-cols-5 gap-1 rounded-lg border border-outline-variant/30 bg-surface-container p-1">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setDraft((d) => ({ ...d, language: lang }))}
                  className={`rounded-md py-1.5 text-[11px] font-bold transition cursor-pointer ${
                    draft.language === lang
                      ? 'bg-primary-container text-on-primary-container shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {CODE_LANGUAGE_LABELS[lang]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase text-[10px]">
              Position
            </span>
            <div className="grid grid-cols-3 gap-1 rounded-lg border border-outline-variant/30 bg-surface-container p-1">
              {POSITION_OPTIONS.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setDraft((d) => ({ ...d, position: pos }))}
                  className={`rounded-md py-1.5 text-[11px] font-bold capitalize transition cursor-pointer ${
                    draft.position === pos
                      ? 'bg-primary-container text-on-primary-container shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase text-[10px]">
              Lines per page
            </span>
            <input
              type="number"
              min={4}
              max={20}
              value={draft.linesPerPage}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (!isNaN(n)) setDraft((d) => ({ ...d, linesPerPage: Math.min(20, Math.max(4, n)) }));
              }}
              className="w-24 rounded-lg border border-outline-variant/60 bg-white px-2 py-1.5 text-body-sm text-on-surface outline-none transition focus:border-primary/60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </label>
        </div>

        <div className="flex shrink-0 gap-2 border-t border-outline-variant/60 px-5 py-4">
          <button
            onClick={close}
            className="flex-1 rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-4 py-2.5 text-body-sm text-on-surface-variant transition hover:border-primary hover:text-on-surface cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-body-sm font-bold text-on-primary transition hover:opacity-90 cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
