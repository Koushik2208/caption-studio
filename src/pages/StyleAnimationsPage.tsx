import React from 'react';
import { SubPanelView } from '../components/common/SubPanelView';
import { useProject } from '../context/ProjectContext';
import { ANIMATION_STYLES } from './styleOptions';

export const StyleAnimationsPage: React.FC = () => {
  const { animation, setAnimation } = useProject();

  return (
    <SubPanelView title="Animation Style" backTo="/style" backLabel="Back to Style">
      <div className="grid grid-cols-2 gap-2">
        {ANIMATION_STYLES.map((a) => (
          <button
            key={a.value}
            onClick={() => setAnimation(a.value)}
            className={`h-16 flex items-center justify-center border rounded-lg hover:border-primary transition-all duration-150 cursor-pointer ${animation === a.value ? 'active-ring border-primary' : 'border-outline-variant'
              }`}
          >
            <span className="text-sm font-medium">{a.label}</span>
          </button>
        ))}
      </div>
    </SubPanelView>
  );
};
