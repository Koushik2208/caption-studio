import React from 'react';
import { SidebarItem } from './SidebarItem';
import { useLayout } from '../../context/LayoutContext';

export const Sidebar: React.FC = () => {
  const { setIsSettingsOpen, setIsTranscriptEditorOpen } = useLayout();

  return (
    <>
      {/* Desktop (>= 1024px) and Tablet (768px-1023px) Left Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-16 bottom-0 flex-col p-4 gap-stack-gap border-r bg-surface-bright border-outline-variant w-[80px] lg:w-panel-width z-40 transition-all">
        <div className="hidden lg:block mb-6 px-3">
          <h2 className="text-headline-md font-headline-md font-bold text-on-surface">Tools</h2>
          <p className="text-body-sm font-body-sm text-outline">Project v1.0</p>
        </div>
        <nav className="flex flex-col gap-2 w-full">
          <SidebarItem icon="upload_file" label="Upload" to="/import" />
          {/* Persistent entry point into TranscriptEditor */}
          <SidebarItem icon="subtitles" label="Transcript" onClick={() => setIsTranscriptEditorOpen(true)} />
          <SidebarItem icon="palette" label="Style" to="/style" />
          <SidebarItem icon="ios_share" label="Export" to="/export" />
        </nav>
        <div className="mt-auto flex flex-col gap-2 w-full">
          <SidebarItem icon="help" label="Help" to="/help" />
          <SidebarItem icon="settings" label="Settings" onClick={() => setIsSettingsOpen(true)} />
        </div>
      </aside>

      {/* Mobile Bottom Navigation (< 768px) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-bright/95 backdrop-blur-md border-t border-outline-variant flex items-center justify-around px-1 z-40"
      >
        <SidebarItem icon="upload_file" label="Upload" to="/import" isMobile />
        <SidebarItem icon="subtitles" label="Transcript" onClick={() => setIsTranscriptEditorOpen(true)} isMobile />
        <SidebarItem icon="palette" label="Style" to="/style" isMobile />
        <SidebarItem icon="ios_share" label="Export" to="/export" isMobile />
        <SidebarItem icon="settings" label="Settings" onClick={() => setIsSettingsOpen(true)} isMobile />
      </nav>
    </>
  );
};
