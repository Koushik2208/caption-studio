import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  onClick,
  className = '',
  hoverable = false,
}) => {
  const isClickable = !!onClick || hoverable;

  return (
    <div
      onClick={onClick}
      className={`bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 transition-all duration-200 ${
        isClickable ? 'hover:border-primary cursor-pointer group' : ''
      } ${className}`}
    >
      {title && (
        <h3 className="text-label-caps font-label-caps text-outline mb-3 tracking-wider">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
