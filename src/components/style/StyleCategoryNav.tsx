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
      className="w-full lg:w-[105px] lg:min-w-[105px] lg:max-w-[105px] bg-surface-bright border-b lg:border-b-0 lg:border-r border-outline-variant/60 flex flex-row lg:flex-col p-2 lg:p-2.5 gap-1.5 shrink-0 select-none overflow-x-auto lg:overflow-y-auto custom-scrollbar"
    >
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`flex flex-row lg:flex-col items-center justify-center py-2 px-3 lg:py-2.5 lg:px-1.5 rounded-xl transition-all duration-150 cursor-pointer text-center group border whitespace-nowrap shrink-0 gap-1.5 lg:gap-0 ${
              isActive
                ? 'bg-white shadow-xs border-primary/40 text-primary font-bold'
                : 'border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
            title={cat.description}
          >
            <span
              className={`material-symbols-outlined text-[19px] lg:text-[21px] transition-transform group-hover:scale-105 ${
                isActive ? 'text-primary' : 'text-outline group-hover:text-on-surface'
              }`}
            >
              {cat.icon}
            </span>
            <span className={`text-[11px] lg:mt-1 leading-tight ${isActive ? 'text-primary font-bold' : 'font-medium'}`}>
              {cat.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
