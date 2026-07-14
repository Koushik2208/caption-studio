import React, { createContext, useState, useContext } from 'react';

export type LayoutMode = 'vertical' | 'horizontal';

interface LayoutContextType {
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
  // Entry points for TranscriptEditor (PLAN.md Part H, H4): a persistent
  // Sidebar trigger and an auto-open right after transcription both just
  // flip this one flag - the modal itself lives at the App root (see
  // TranscriptEditorModal) so it's reachable no matter which tab is active.
  isTranscriptEditorOpen: boolean;
  setIsTranscriptEditorOpen: (isOpen: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('vertical');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTranscriptEditorOpen, setIsTranscriptEditorOpen] = useState(false);

  return (
    <LayoutContext.Provider
      value={{
        layoutMode,
        setLayoutMode,
        isSettingsOpen,
        setIsSettingsOpen,
        isTranscriptEditorOpen,
        setIsTranscriptEditorOpen,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
