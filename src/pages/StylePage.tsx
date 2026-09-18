import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { StyleCategoryNav, type StyleCategory } from '../components/style/StyleCategoryNav';
import { TextInspector } from '../components/style/TextInspector';
import { PositionInspector } from '../components/style/PositionInspector';
import { HighlightInspector } from '../components/style/HighlightInspector';
import { AnimationInspector } from '../components/style/AnimationInspector';
import { EffectsInspector } from '../components/style/EffectsInspector';
import { OverlayInspector } from '../components/style/OverlayInspector';

const CATEGORY_TITLES: Record<StyleCategory, string> = {
  text: 'Text & Typography',
  position: 'Caption Position',
  highlight: 'Highlight & Karaoke',
  animation: 'Motion & Animations',
  effects: 'Effects & Atmosphere',
  composition: 'Composition',
  overlay: 'Composition',
};

const CATEGORY_ICONS: Record<StyleCategory, string> = {
  text: 'title',
  position: 'align_vertical_bottom',
  highlight: 'ink_highlighter',
  animation: 'motion_photos_on',
  effects: 'blur_on',
  composition: 'layers',
  overlay: 'layers',
};

export const StylePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<StyleCategory>('text');
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full w-full bg-surface-bright select-none overflow-hidden">
      {/* FULL-WIDTH INSPECTOR HEADER */}
      <div className="h-12 px-4 border-b border-outline-variant/60 flex items-center justify-between shrink-0 bg-surface-container-lowest">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-primary">tune</span>
          <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider font-label-caps">
            Inspector
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-label-caps uppercase text-outline font-medium">
            Live Preview
          </span>
        </div>
      </div>

      {/* WORKSPACE: CATEGORY NAV + DETAIL CONTROLS */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
        {/* Minimal Style Category Navigation */}
        <StyleCategoryNav
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        {/* Detailed Contextual Inspector */}
        <div className="flex-1 flex flex-col h-full bg-surface-container-lowest border-t lg:border-t-0 lg:border-l border-outline-variant/40 overflow-hidden min-w-0">
          {/* Active Category Sub-header */}
          <div className="px-4 py-2.5 border-b border-outline-variant/40 flex items-center justify-between shrink-0 bg-surface-container-low/40">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px] text-primary">
                {CATEGORY_ICONS[activeCategory]}
              </span>
              <span className="text-xs font-bold text-on-surface uppercase tracking-wide">
                {CATEGORY_TITLES[activeCategory]}
              </span>
            </div>
          </div>

          {/* Scrollable Inspector Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeCategory === 'text' && <TextInspector />}
            {activeCategory === 'position' && <PositionInspector />}
            {activeCategory === 'highlight' && <HighlightInspector />}
            {activeCategory === 'animation' && <AnimationInspector />}
            {activeCategory === 'effects' && <EffectsInspector />}
            {(activeCategory === 'composition' || activeCategory === 'overlay') && <OverlayInspector />}
          </div>

          {/* Footer Navigation Action */}
          <div className="p-3 border-t border-outline-variant/40 bg-surface-container-lowest shrink-0">
            <Button
              onClick={() => navigate('/export')}
              className="w-full py-2.5 shadow-xs text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Proceed to Export</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
