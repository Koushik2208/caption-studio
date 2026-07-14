import React from 'react';
import { Link } from 'react-router-dom';

interface SubPanelViewProps {
  title: string;
  backTo: string;
  backLabel: string;
  children: React.ReactNode;
}

// Full-list half of the sub-panel pattern (see CondensedCard). Renders the
// same aside shell as the tool panels (StylePage/OverlayPage) with a back
// header instead of the panel's usual footer action.
export const SubPanelView: React.FC<SubPanelViewProps> = ({ title, backTo, backLabel, children }) => (
  <aside className="w-panel-width min-w-panel-width max-w-panel-width bg-surface-bright border-l border-outline-variant flex flex-col h-full shrink-0 grow-0">
    <div className="p-6 border-b border-outline-variant flex items-center gap-3 bg-surface-container-lowest shrink-0">
      <Link
        to={backTo}
        aria-label={backLabel}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </Link>
      <h2 className="text-headline-md font-headline-md font-bold text-on-surface">{title}</h2>
    </div>
    <div className="flex-1 overflow-y-auto custom-scrollbar p-gutter flex flex-col gap-stack-gap">{children}</div>
  </aside>
);
