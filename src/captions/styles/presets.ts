// Font Preset picks typeface only (fontFamily/fontWeight/fontStyle) - it used
// to also force a specific style component via a `variant` field, but PLAN.md
// Part F decoupled animation choice from font choice, so which animation
// plays is now StylePage's independent Animation Style selector, sourced from
// ProjectContext's `animation` state instead of derived from the preset.
// Shared between StylePage (renders the preset buttons) and ProjectContext
// (derives the live styleOverrides so Export reads the same choice).
//
// Fonts are loaded via @remotion/google-fonts rather than an index.html
// <link> tag: the export bundle (@remotion/bundler + renderMedia's headless
// Chrome) doesn't see index.html's <head>, only whatever this module graph
// pulls in - loadFont() calls delayRender()/continueRender() internally so
// both the live Player preview and the server-side render wait for the same
// font file before painting, keeping them byte-identical.
import { loadFont as loadBebasNeue } from '@remotion/google-fonts/BebasNeue';
import { loadFont as loadMontserrat } from '@remotion/google-fonts/Montserrat';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadBangers } from '@remotion/google-fonts/Bangers';
import { loadFont as loadCaveat } from '@remotion/google-fonts/Caveat';
import { loadFont as loadJost } from '@remotion/google-fonts/Jost';
import { loadFont as loadQuicksand } from '@remotion/google-fonts/Quicksand';
import { loadFont as loadDMSerifDisplay } from '@remotion/google-fonts/DMSerifDisplay';
import { loadFont as loadArchivoBlack } from '@remotion/google-fonts/ArchivoBlack';
import type { CaptionStyleVariant } from './types';

const { fontFamily: bebasNeue } = loadBebasNeue('normal', { weights: ['400'], subsets: ['latin'] });
const { fontFamily: montserrat } = loadMontserrat('normal', { weights: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] });
const { fontFamily: anton } = loadAnton('normal', { weights: ['400'], subsets: ['latin'] });
const { fontFamily: bangers } = loadBangers('normal', { weights: ['400'], subsets: ['latin'] });
const { fontFamily: caveat } = loadCaveat('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin'] });
const { fontFamily: jost } = loadJost('normal', { weights: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] });
const { fontFamily: quicksand } = loadQuicksand('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin'] });
const { fontFamily: dmSerifDisplay } = loadDMSerifDisplay('italic', { weights: ['400'], subsets: ['latin'] });
const { fontFamily: archivoBlack } = loadArchivoBlack('normal', { weights: ['400'], subsets: ['latin'] });

// Which orientation a preset is researched/tuned for. Vertical short-form
// rewards personality/energy; horizontal long-form rewards restraint and
// legibility over long view times. 'both' presets work reasonably at either.
export type FontPresetOrientation = 'vertical' | 'horizontal' | 'both';

export const FONT_PRESETS = [
  {
    name: 'Viral Hook',
    fontFamily: `'${bebasNeue}', 'Arial Black', sans-serif`,
    fontWeight: 400,
    availableWeights: [400],
    fontStyle: 'normal' as const,
    labelClass: 'uppercase tracking-wide',
    orientation: 'vertical' as FontPresetOrientation,
    suggestedAnimation: 'signature' as CaptionStyleVariant,
  },
  {
    name: 'Soft Modern',
    fontFamily: `'${montserrat}', sans-serif`,
    fontWeight: 600,
    availableWeights: [400, 500, 600, 700, 800, 900],
    fontStyle: 'normal' as const,
    labelClass: 'font-semibold',
    orientation: 'both' as FontPresetOrientation,
    suggestedAnimation: 'slideUp' as CaptionStyleVariant,
  },
  {
    name: 'Meme Energy',
    fontFamily: `'${anton}', 'Arial Black', sans-serif`,
    fontWeight: 400,
    availableWeights: [400],
    fontStyle: 'normal' as const,
    labelClass: 'uppercase tracking-wide',
    orientation: 'vertical' as FontPresetOrientation,
    suggestedAnimation: 'signature' as CaptionStyleVariant,
  },
  {
    name: 'Playful Comic',
    fontFamily: `'${bangers}', cursive`,
    fontWeight: 400,
    availableWeights: [400],
    fontStyle: 'normal' as const,
    labelClass: 'uppercase tracking-wide',
    orientation: 'vertical' as FontPresetOrientation,
    suggestedAnimation: 'slideUp' as CaptionStyleVariant,
  },
  {
    name: 'Handwritten',
    fontFamily: `'${caveat}', cursive`,
    fontWeight: 700,
    availableWeights: [400, 500, 600, 700],
    fontStyle: 'normal' as const,
    labelClass: 'font-bold',
    orientation: 'vertical' as FontPresetOrientation,
    suggestedAnimation: 'calmPhrase' as CaptionStyleVariant,
  },
  {
    name: 'Cinematic',
    fontFamily: `'${jost}', sans-serif`,
    fontWeight: 500,
    availableWeights: [400, 500, 600, 700, 800, 900],
    fontStyle: 'normal' as const,
    labelClass: 'font-medium tracking-wide',
    orientation: 'horizontal' as FontPresetOrientation,
    suggestedAnimation: 'outlineDraw' as CaptionStyleVariant,
  },
  {
    name: 'Calm Organic',
    fontFamily: `'${quicksand}', sans-serif`,
    fontWeight: 600,
    availableWeights: [400, 500, 600, 700],
    fontStyle: 'normal' as const,
    labelClass: 'font-semibold',
    orientation: 'horizontal' as FontPresetOrientation,
    suggestedAnimation: 'calmPhrase' as CaptionStyleVariant,
  },
  {
    name: 'Editorial',
    fontFamily: `'${dmSerifDisplay}', serif`,
    fontWeight: 400,
    availableWeights: [400],
    fontStyle: 'italic' as const,
    labelClass: 'italic tracking-normal',
    orientation: 'horizontal' as FontPresetOrientation,
    suggestedAnimation: 'calmPhrase' as CaptionStyleVariant,
  },
  {
    name: 'Heavy Display',
    fontFamily: `'${archivoBlack}', 'Arial Black', sans-serif`,
    fontWeight: 900,
    availableWeights: [900],
    fontStyle: 'normal' as const,
    labelClass: 'font-black uppercase tracking-tight',
    letterSpacing: -1.5,
    orientation: 'vertical' as FontPresetOrientation,
    suggestedAnimation: 'signature' as CaptionStyleVariant,
  },
] as const;

export type FontPresetName = (typeof FONT_PRESETS)[number]['name'];

export const getPrioritizedFontPresets = (
  activeOrientation: Exclude<FontPresetOrientation, 'both'>,
): (typeof FONT_PRESETS)[number][] => {
  const matching = FONT_PRESETS.filter((p) => p.orientation === activeOrientation);
  const both = FONT_PRESETS.filter((p) => p.orientation === 'both');
  const rest = FONT_PRESETS.filter((p) => p.orientation !== activeOrientation && p.orientation !== 'both');
  return [...matching, ...both, ...rest];
};
