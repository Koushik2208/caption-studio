import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from './Card';

interface CondensedCardProps {
  title?: string;
  moreTo: string;
  moreLabel: string;
  className?: string;
  children: React.ReactNode;
}

// Half of the "condensed view + More -> full list" sub-panel pattern: a Card
// that shows a handful of options and links out to a full-list route for the
// rest. Pair with SubPanelView on the full-list page. Reused by Style
// (fonts/animations) and Overlay (frames/texture overlays); apply the same
// pair to future categories (colors, keyword styles, ...) without
// restructuring routes again.
export const CondensedCard: React.FC<CondensedCardProps> = ({ title, moreTo, moreLabel, className, children }) => (
  <Card title={title} className={className}>
    {children}
    <Link
      to={moreTo}
      className="mt-3 flex items-center justify-center gap-1 text-label-caps font-label-caps text-primary hover:underline"
    >
      {moreLabel}
      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
    </Link>
  </Card>
);
