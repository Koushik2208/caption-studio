import React from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden h-screen">
      <TopBar />
      <div className="flex flex-1 pt-16 h-full overflow-hidden relative">
        <Sidebar />
        {/* Main layout container shifting content based on sidebar size */}
        <div className="flex-1 ml-[80px] lg:ml-panel-width h-full transition-all">
          {children}
        </div>
      </div>
    </div>
  );
};
