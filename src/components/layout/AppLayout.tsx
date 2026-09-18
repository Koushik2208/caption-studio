import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden h-screen">
      <TopBar />
      <div className="flex flex-1 pt-16 h-full overflow-hidden relative">
        <Sidebar />
        {/* Main layout container shifting content based on sidebar size and mobile bottom nav */}
        <div className="flex-1 ml-0 md:ml-[80px] lg:ml-panel-width pb-16 md:pb-0 h-full overflow-hidden transition-all">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
