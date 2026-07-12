import React from 'react';

interface ProgressIndicatorProps {
  progress: number; // 0 to 100
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  className = '',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`flex items-center gap-2 w-full ${className}`}>
      <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      <span className="text-label-caps font-label-caps text-on-surface-variant min-w-[32px] text-right">
        {Math.round(clampedProgress)}%
      </span>
    </div>
  );
};
