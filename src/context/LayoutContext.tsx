import React, { createContext, useState, useContext } from 'react';

export type LayoutMode = 'vertical' | 'horizontal';

interface LayoutContextType {
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('vertical');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <LayoutContext.Provider
      value={{
        layoutMode,
        setLayoutMode,
        isSettingsOpen,
        setIsSettingsOpen,
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
