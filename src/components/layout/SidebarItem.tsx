import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarItemProps {
  icon: string;
  label: string;
  to?: string;
  onClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, to, onClick }) => {
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

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
        isActive
          ? 'bg-primary-container text-on-primary-container font-semibold translate-x-1'
          : 'text-on-surface-variant hover:bg-surface-container font-medium'
      }`}
      aria-label={label}
    >
      <span className="material-symbols-outlined" aria-hidden="true">
        {icon}
      </span>
      <span className="hidden lg:inline text-label-caps font-label-caps">
        {label}
      </span>
    </button>
  );
};
