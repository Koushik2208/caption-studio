import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { ANIMATION_STYLES } from '../../pages/styleOptions';
import type { CaptionStyleVariant } from '../../captions/styles/types';

interface AnimationMeta {
  value: CaptionStyleVariant;
  label: string;
  tag: string;
  icon: string;
  description: string;
}

const ANIMATION_METAS: AnimationMeta[] = [
  {
    value: 'signature',
    label: 'Signature',
    tag: 'Energetic',
    icon: 'bolt',
    description: 'High-energy scale pulse on active word with subtle overshoot',
  },
  {
    value: 'calmPhrase',
    label: 'Calm Phrase',
    tag: 'Minimal',
    icon: 'nature_people',
    description: 'Subtle whole-phrase opacity transitions, ideal for storytelling',
  },
  {
    value: 'typewriter',
    label: 'Typewriter',
    tag: 'Retro / Tech',
    icon: 'keyboard',
    description: 'Crisp character-by-character revelation matching audio pace',
  },
  {
    value: 'slideUp',
    label: 'Slide-up',
    tag: 'Smooth',
    icon: 'arrow_upward_alt',
    description: 'Smooth vertical spring glide into position',
  },
  {
    value: 'outlineDraw',
    label: 'Outline Draw',
    tag: 'Cinematic',
    icon: 'draw',
    description: 'Dynamic kinetic outline expand with luxurious presence',
  },
];

export const AnimationInspector: React.FC = () => {
  const { animation, setAnimation } = useProject();

  return (
    <div className="flex flex-col gap-6 p-4">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
            Caption Animation
          </span>
          <span className="text-[11px] text-outline">
            {ANIMATION_STYLES.length} styles
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {ANIMATION_METAS.map((a) => {
            const isSelected = animation === a.value;
            return (
              <button
                key={a.value}
                type="button"
                onClick={() => setAnimation(a.value)}
                className={`flex items-start gap-3.5 p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary-container/5 shadow-xs ring-1 ring-primary'
                    : 'border-outline-variant/60 bg-surface-container-lowest hover:border-primary/50 hover:bg-surface-container-low'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-surface-container text-outline'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {a.icon}
                  </span>
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${
                        isSelected ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      {a.label}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium font-mono ${
                        isSelected
                          ? 'bg-primary-container/20 text-primary'
                          : 'bg-surface-container text-outline'
                      }`}
                    >
                      {a.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-outline mt-1 leading-relaxed">
                    {a.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
