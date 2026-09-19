import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarItemProps {
  icon: string;
  label: string;
  to?: string;
  onClick?: () => void;
  isMobile?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, to, onClick, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = to ? location.pathname === to || location.pathname.startsWith(`${to}/`) : false;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };

  if (isMobile) {
    return (
      <button
        onClick={handleClick}
        className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-150 cursor-pointer ${
          isActive
            ? 'text-text-primary bg-brand-accent-soft font-bold'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle font-medium'
        }`}
        aria-label={label}
      >
        <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
          {icon}
        </span>
        <span className="text-[10px] font-label-caps tracking-tight leading-tight mt-0.5">
          {label}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-150 cursor-pointer ${
        isActive
          ? 'bg-brand-accent-soft text-text-primary font-semibold border border-brand-accent/50 shadow-2xs translate-x-0.5'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle border border-transparent font-medium'
      }`}
      aria-label={label}
    >
      <span className="material-symbols-outlined" aria-hidden="true">
        {icon}
      </span>
      <span className="hidden lg:inline text-body-md">
        {label}
      </span>
    </button>
  );
};
