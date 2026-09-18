import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLayout } from '../../context/LayoutContext';
import { useProject } from '../../context/ProjectContext';

export const TopBar: React.FC = () => {
  const { layoutMode, setLayoutMode, setIsSettingsOpen } = useLayout();
  const { projectName, setProjectName, saveStatus } = useProject();

  return (
    <header className="fixed top-0 left-0 right-0 bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center h-16 px-canvas-margin w-full z-50">
      <div className="flex items-center gap-4">
        <NavLink to="/" className="text-headline-md font-headline-md font-bold text-on-surface hover:text-primary transition-colors">
          Caption Studio
        </NavLink>
        <div className="h-6 w-px bg-outline-variant mx-2"></div>
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Untitled Project"
          aria-label="Project name"
          className="text-body-md font-body-md text-on-surface-variant italic bg-transparent border border-transparent rounded-md px-1.5 py-0.5 w-40 truncate outline-none hover:border-outline-variant focus:border-primary focus:text-on-surface transition-colors"
        />

        {/* Aspect Ratio Toggle Pill */}
        <div className="h-6 w-px bg-outline-variant mx-1"></div>
        <button
          onClick={() => setLayoutMode(layoutMode === 'vertical' ? 'horizontal' : 'vertical')}
          className="px-3 py-1 bg-surface-container rounded-full border border-outline-variant flex items-center gap-1.5 cursor-pointer hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface"
          title="Click to toggle layout aspect ratio"
        >
          <span className="material-symbols-outlined text-[16px] leading-none">
            {layoutMode === 'vertical' ? 'stay_current_portrait' : 'stay_current_landscape'}
          </span>
          <span className="text-label-caps font-label-caps text-[10px] uppercase">
            {layoutMode === 'vertical' ? '9:16 Vertical' : '16:9 Horizontal'}
          </span>
        </button>

        <nav className="hidden md:flex gap-6 items-center ml-4 h-full pt-1">
          <NavLink
            to="/import"
            className={({ isActive }) =>
              `pb-1 font-bold font-label-caps text-label-caps uppercase transition-colors duration-200 border-b-2 ${isActive
                ? 'text-primary border-primary'
                : 'text-on-surface-variant hover:text-primary border-transparent'
              }`
            }
          >
            Import
          </NavLink>
          <NavLink
            to="/style"
            className={({ isActive }) =>
              `pb-1 font-bold font-label-caps text-label-caps uppercase transition-colors duration-200 border-b-2 ${isActive
                ? 'text-primary border-primary'
                : 'text-on-surface-variant hover:text-primary border-transparent'
              }`
            }
          >
            Style
          </NavLink>
          <NavLink
            to="/export"
            className={({ isActive }) =>
              `pb-1 font-bold font-label-caps text-label-caps uppercase transition-colors duration-200 border-b-2 ${isActive
                ? 'text-primary border-primary'
                : 'text-on-surface-variant hover:text-primary border-transparent'
              }`
            }
          >
            Export
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-body-sm font-body-sm text-outline">
          {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-all active:scale-95 cursor-pointer"
            aria-label="Settings"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button
            className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-all active:scale-95 cursor-pointer"
            aria-label="Help"
          >
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>
        <NavLink to="/export">
          <button className="bg-primary text-on-primary px-4 py-1.5 rounded-lg font-bold text-body-md transition-all active:scale-95 hover:bg-primary-container cursor-pointer">
            Export
          </button>
        </NavLink>
      </div>
    </header>
  );
};
