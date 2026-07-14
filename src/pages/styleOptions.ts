import type { CaptionStyleVariant } from '../captions/styles/types';

// Shared between the condensed StylePage panel and the full StyleAnimationsPage
// list so the two views can't drift out of sync.
export const ANIMATION_STYLES: { value: CaptionStyleVariant; label: string }[] = [
  { value: 'signature', label: 'Signature' },
  { value: 'calmPhrase', label: 'Calm Phrase' },
  { value: 'typewriter', label: 'Typewriter' },
  { value: 'slideUp', label: 'Slide-up' },
  { value: 'outlineDraw', label: 'Outline Draw' },
];

// How many options the condensed StylePage cards show before linking out to
// the full list - tune per category without touching the full-list pages.
export const CONDENSED_ANIMATION_COUNT = 4;
export const CONDENSED_FONT_COUNT = 4;
