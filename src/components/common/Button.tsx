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
    'px-4 py-2.5 rounded-lg font-semibold text-body-sm transition-all active:scale-[0.98] duration-150 cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent';

  const variants = {
    primary: 'bg-brand-accent hover:bg-brand-accent-hover text-accent-foreground font-semibold shadow-xs active:shadow-none',
    secondary: 'bg-surface border border-border text-text-primary hover:bg-surface-subtle hover:border-border-strong shadow-xs',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-lg p-2',
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
