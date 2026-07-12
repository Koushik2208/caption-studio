import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  iconClassName?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  className = '',
  iconClassName = '',
  ...props
}) => {
  return (
    <button
      className={`p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-all active:scale-95 duration-150 cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center ${className}`}
      {...props}
    >
      <span className={`material-symbols-outlined ${iconClassName}`} aria-hidden="true">
        {icon}
      </span>
    </button>
  );
};
