import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const baseStyle =
    'px-4 py-2.5 rounded-lg font-bold text-body-sm transition-all active:scale-95 duration-150 cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-primary text-on-primary hover:opacity-90',
    secondary: 'bg-white border border-outline-variant text-on-surface hover:bg-surface-container',
    ghost: 'text-on-surface-variant hover:bg-surface-container rounded-lg p-2',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
