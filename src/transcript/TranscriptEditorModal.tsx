import React from 'react';
import { useLayout } from '../context/LayoutContext';
import { TranscriptEditor } from './TranscriptEditor';

// Modal shell only - all rendering/edit behavior lives in TranscriptEditor
// itself, reused as-is (mirrors SettingsModal's backdrop/card pattern so the
// two modals feel consistent). Rendered once at the App root (see App.tsx)
// so it's reachable from any tab via either entry point (PLAN.md Part H,
// H4): the persistent Sidebar trigger or the post-transcription auto-open.
export const TranscriptEditorModal: React.FC = () => {
  const { isTranscriptEditorOpen, setIsTranscriptEditorOpen } = useLayout();

  if (!isTranscriptEditorOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 transition-opacity duration-300"
      onClick={() => setIsTranscriptEditorOpen(false)}
    >
      <div
        className="relative flex h-[88vh] sm:h-[75vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsTranscriptEditorOpen(false)}
          className="absolute top-3 right-3 z-10 cursor-pointer rounded-lg p-1 text-on-surface-variant transition-all hover:bg-surface-container active:scale-95"
          aria-label="Close transcript editor"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <TranscriptEditor />
      </div>
    </div>
  );
};
