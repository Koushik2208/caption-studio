import React from 'react';

export type StyleCategory =
  | 'text'
  | 'position'
  | 'highlight'
  | 'animation'
  | 'effects'
  | 'composition'
  | 'overlay';

interface CategoryItem {
  id: StyleCategory;
  label: string;
  icon: string;
  description: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'text', label: 'Text', icon: 'title', description: 'Typography & Appearance' },
  { id: 'position', label: 'Position', icon: 'align_vertical_bottom', description: 'Vertical placement' },
  { id: 'highlight', label: 'Highlight', icon: 'ink_highlighter', description: 'Active word & keywords' },
  { id: 'animation', label: 'Animation', icon: 'motion_photos_on', description: 'Motion & transitions' },
  { id: 'effects', label: 'Effects', icon: 'blur_on', description: 'Visual textures & atmosphere' },
  { id: 'composition', label: 'Composition', icon: 'layers', description: 'Frames, canvas & graphics' },
];

interface StyleCategoryNavProps {
  activeCategory: StyleCategory;
  onSelectCategory: (category: StyleCategory) => void;
}

export const StyleCategoryNav: React.FC<StyleCategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <nav
      aria-label="Style categories"
      className="w-[105px] min-w-[105px] max-w-[105px] bg-surface-bright border-r border-outline-variant/60 flex flex-col p-2.5 gap-1.5 shrink-0 select-none overflow-y-auto custom-scrollbar"
    >
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl transition-all duration-150 cursor-pointer text-center group border ${
              isActive
                ? 'bg-white shadow-xs border-primary/40 text-primary font-bold'
                : 'border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
            title={cat.description}
          >
            <span
              className={`material-symbols-outlined text-[21px] transition-transform group-hover:scale-105 ${
                isActive ? 'text-primary' : 'text-outline group-hover:text-on-surface'
              }`}
            >
              {cat.icon}
            </span>
            <span className={`text-[11px] mt-1 leading-tight ${isActive ? 'text-primary font-bold' : 'font-medium'}`}>
              {cat.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
