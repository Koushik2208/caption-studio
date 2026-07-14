import React from 'react';
import { SidebarItem } from './SidebarItem';
import { useLayout } from '../../context/LayoutContext';

export const Sidebar: React.FC = () => {
  const { setIsSettingsOpen, setIsTranscriptEditorOpen } = useLayout();

  return (
    <aside className="fixed left-0 top-16 bottom-0 flex flex-col p-4 gap-stack-gap border-r bg-surface-bright border-outline-variant w-[80px] lg:w-panel-width z-40 transition-all">
      <div className="hidden lg:block mb-6 px-3">
        <h2 className="text-headline-md font-headline-md font-bold text-on-surface">Tools</h2>
        <p className="text-body-sm font-body-sm text-outline">Project v1.0</p>
      </div>
      <nav className="flex flex-col gap-2 w-full">
        <SidebarItem icon="upload_file" label="Upload" to="/import" />
        {/* Persistent entry point into TranscriptEditor (PLAN.md Part H, H4) -
            a modal trigger rather than a route, so it opens over whichever
            tab is currently active instead of navigating away from it. */}
        <SidebarItem icon="subtitles" label="Transcript" onClick={() => setIsTranscriptEditorOpen(true)} />
        <SidebarItem icon="palette" label="Style" to="/style" />
        <SidebarItem icon="layers" label="Overlay" to="/overlay" />
        <SidebarItem icon="ios_share" label="Export" to="/export" />
      </nav>
      <div className="mt-auto flex flex-col gap-2 w-full">
        <SidebarItem icon="help" label="Help" to="/help" />
        <SidebarItem icon="settings" label="Settings" onClick={() => setIsSettingsOpen(true)} />
      </div>
    </aside>
  );
};
