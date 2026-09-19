import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLayout } from '../../context/LayoutContext';
import { useProject } from '../../context/ProjectContext';

export const TopBar: React.FC = () => {
  const { layoutMode, setLayoutMode, setIsSettingsOpen } = useLayout();
  const { projectName, setProjectName, saveStatus } = useProject();

  return (
    <header className="fixed top-0 left-0 right-0 bg-surface border-b border-border flex justify-between items-center h-16 px-3 sm:px-4 lg:px-canvas-margin w-full z-50">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <NavLink to="/" className="text-sm sm:text-base lg:text-headline-md font-headline-md font-bold text-text-primary hover:text-text-secondary transition-colors shrink-0">
          Caption Studio
        </NavLink>
        <div className="hidden sm:block h-6 w-px bg-border mx-1 lg:mx-2 shrink-0"></div>
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Untitled Project"
          aria-label="Project name"
          className="hidden sm:block text-body-md font-body-md text-text-secondary italic bg-transparent border border-transparent rounded-md px-1.5 py-0.5 w-24 sm:w-32 lg:w-40 truncate outline-none hover:border-border focus:border-border-strong focus:text-text-primary transition-colors"
        />

        {/* Aspect Ratio Toggle Pill */}
        <div className="hidden sm:block h-6 w-px bg-border mx-1 shrink-0"></div>
        <button
          onClick={() => setLayoutMode(layoutMode === 'vertical' ? 'horizontal' : 'vertical')}
          className="px-2 sm:px-3 py-1 bg-surface-subtle rounded-full border border-border flex items-center gap-1 sm:gap-1.5 cursor-pointer hover:bg-surface-dim transition-colors text-text-secondary hover:text-text-primary shrink-0"
          title="Click to toggle layout aspect ratio"
        >
          <span className="material-symbols-outlined text-[15px] sm:text-[16px] leading-none">
            {layoutMode === 'vertical' ? 'stay_current_portrait' : 'stay_current_landscape'}
          </span>
          <span className="text-label-caps font-label-caps text-[9px] sm:text-[10px] uppercase">
            <span className="hidden sm:inline">{layoutMode === 'vertical' ? '9:16 Vertical' : '16:9 Horizontal'}</span>
            <span className="sm:hidden">{layoutMode === 'vertical' ? '9:16' : '16:9'}</span>
          </span>
        </button>

        <nav className="hidden md:flex gap-6 items-center ml-4 h-full pt-1">
          <NavLink
            to="/import"
            className={({ isActive }) =>
              `pb-1 font-bold font-label-caps text-label-caps uppercase transition-colors duration-200 border-b-2 ${isActive
                ? 'text-text-primary border-brand-accent'
                : 'text-text-secondary hover:text-text-primary border-transparent'
              }`
            }
          >
            Import
          </NavLink>
          <NavLink
            to="/style"
            className={({ isActive }) =>
              `pb-1 font-bold font-label-caps text-label-caps uppercase transition-colors duration-200 border-b-2 ${isActive
                ? 'text-text-primary border-brand-accent'
                : 'text-text-secondary hover:text-text-primary border-transparent'
              }`
            }
          >
            Style
          </NavLink>
          <NavLink
            to="/export"
            className={({ isActive }) =>
              `pb-1 font-bold font-label-caps text-label-caps uppercase transition-colors duration-200 border-b-2 ${isActive
                ? 'text-text-primary border-brand-accent'
                : 'text-text-secondary hover:text-text-primary border-transparent'
              }`
            }
          >
            Export
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4 shrink-0">
        <span className="hidden sm:inline text-body-sm font-body-sm text-text-muted">
          {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
        </span>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 sm:p-2 text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-lg transition-all active:scale-95 cursor-pointer"
            aria-label="Settings"
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">settings</span>
          </button>
          <button
            className="hidden sm:block p-2 text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-lg transition-all active:scale-95 cursor-pointer"
            aria-label="Help"
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">help</span>
          </button>
        </div>
        <NavLink to="/export">
          <button className="bg-brand-accent hover:bg-brand-accent-hover text-accent-foreground px-2.5 sm:px-4 py-1.5 rounded-lg font-bold text-xs sm:text-body-md transition-all active:scale-[0.98] shadow-xs cursor-pointer">
            Export
          </button>
        </NavLink>
      </div>
    </header>
  );
};
