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
import { loadFont as loadRoboto } from '@remotion/google-fonts/Roboto';
import { loadFont as loadMontserrat } from '@remotion/google-fonts/Montserrat';
import { loadFont as loadOpenSans } from '@remotion/google-fonts/OpenSans';
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';
import { loadFont as loadArchivoBlack } from '@remotion/google-fonts/ArchivoBlack';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadCourierPrime } from '@remotion/google-fonts/CourierPrime';
import { loadFont as loadBangers } from '@remotion/google-fonts/Bangers';
import { loadFont as loadLeagueSpartan } from '@remotion/google-fonts/LeagueSpartan';
import { loadFont as loadCaveat } from '@remotion/google-fonts/Caveat';
import { loadFont as loadJost } from '@remotion/google-fonts/Jost';
import { loadFont as loadCinzel } from '@remotion/google-fonts/Cinzel';
import { loadFont as loadArvo } from '@remotion/google-fonts/Arvo';
import { loadFont as loadQuicksand } from '@remotion/google-fonts/Quicksand';
import { loadFont as loadAtkinsonHyperlegible } from '@remotion/google-fonts/AtkinsonHyperlegible';
import { loadFont as loadRajdhani } from '@remotion/google-fonts/Rajdhani';
import { loadFont as loadMarcellus } from '@remotion/google-fonts/Marcellus';
import type { CaptionStyleVariant } from './types';

const { fontFamily: bebasNeue } = loadBebasNeue('normal', { weights: ['400'], subsets: ['latin'] });
const { fontFamily: roboto } = loadRoboto('normal', { weights: ['400', '500', '700', '900'], subsets: ['latin'] });
const { fontFamily: montserrat } = loadMontserrat('normal', { weights: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] });
const { fontFamily: openSans } = loadOpenSans('normal', { weights: ['400', '500', '600', '700', '800'], subsets: ['latin'] });
const { fontFamily: jetBrainsMono } = loadJetBrainsMono('normal', { weights: ['400', '500', '600', '700', '800'], subsets: ['latin'] });
const { fontFamily: archivoBlack } = loadArchivoBlack('normal', { weights: ['400'], subsets: ['latin'] });
const { fontFamily: anton } = loadAnton('normal', { weights: ['400'], subsets: ['latin'] });
const { fontFamily: courierPrime } = loadCourierPrime('normal', { weights: ['400', '700'], subsets: ['latin'] });
const { fontFamily: bangers } = loadBangers('normal', { weights: ['400'], subsets: ['latin'] });
const { fontFamily: leagueSpartan } = loadLeagueSpartan('normal', { weights: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] });
const { fontFamily: caveat } = loadCaveat('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin'] });
const { fontFamily: jost } = loadJost('normal', { weights: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] });
const { fontFamily: cinzel } = loadCinzel('normal', { weights: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] });
const { fontFamily: arvo } = loadArvo('normal', { weights: ['400', '700'], subsets: ['latin'] });
const { fontFamily: quicksand } = loadQuicksand('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin'] });
const { fontFamily: atkinsonHyperlegible } = loadAtkinsonHyperlegible('normal', { weights: ['400', '700'], subsets: ['latin'] });
const { fontFamily: rajdhani } = loadRajdhani('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin'] });
const { fontFamily: marcellus } = loadMarcellus('normal', { weights: ['400'], subsets: ['latin'] });

// Which orientation a preset is researched/tuned for. Vertical short-form
// rewards personality/energy; horizontal long-form rewards restraint and
// legibility over long view times. 'both' presets work reasonably at either.
export type FontPresetOrientation = 'vertical' | 'horizontal' | 'both';

// PLAN.md Part I: expanded from the original research-backed 8-preset table
// (Part F). Editorial (Source Sans 3) and Rounded Friendly (Poppins) were cut
// as redundant with Minimal/Soft Modern. 12 new presets added, each verified
// as a real @remotion/google-fonts entry (checked against the installed
// package's font list, not assumed from name recognition) - no substitutions
// were needed, every researched name matched a real font exactly.
// `suggestedAnimation` is a default-on-select hint from the research
// pairings, not a forced constraint - animation and font stay decoupled
// per Part F.
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
    name: 'Clean Standard',
    fontFamily: `'${roboto}', sans-serif`,
    fontWeight: 500,
    availableWeights: [400, 500, 700, 900],
    fontStyle: 'normal' as const,
    labelClass: 'font-medium',
    orientation: 'both' as FontPresetOrientation,
    suggestedAnimation: 'calmPhrase' as CaptionStyleVariant,
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
    name: 'Minimal',
    fontFamily: `'${openSans}', sans-serif`,
    fontWeight: 400,
    availableWeights: [400, 500, 600, 700, 800],
    fontStyle: 'normal' as const,
    labelClass: 'font-normal',
    orientation: 'both' as FontPresetOrientation,
    suggestedAnimation: 'calmPhrase' as CaptionStyleVariant,
  },
  {
    name: 'Tech/Mono',
    fontFamily: `'${jetBrainsMono}', monospace`,
    fontWeight: 700,
    availableWeights: [400, 500, 600, 700, 800],
    fontStyle: 'normal' as const,
    labelClass: 'font-bold font-mono',
    orientation: 'both' as FontPresetOrientation,
    suggestedAnimation: 'typewriter' as CaptionStyleVariant,
  },
  {
    name: 'Impact Punch',
    fontFamily: `'${archivoBlack}', 'Arial Black', sans-serif`,
    fontWeight: 400,
    availableWeights: [400],
    fontStyle: 'normal' as const,
    labelClass: 'uppercase',
    orientation: 'vertical' as FontPresetOrientation,
    suggestedAnimation: 'signature' as CaptionStyleVariant,
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
    name: 'Screenplay',
    fontFamily: `'${courierPrime}', 'Courier New', monospace`,
    fontWeight: 700,
    availableWeights: [400, 700],
    fontStyle: 'normal' as const,
    labelClass: 'font-bold font-mono',
    orientation: 'vertical' as FontPresetOrientation,
    suggestedAnimation: 'typewriter' as CaptionStyleVariant,
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
    name: 'Business Bold',
    fontFamily: `'${leagueSpartan}', sans-serif`,
    fontWeight: 700,
    availableWeights: [400, 500, 600, 700, 800, 900],
    fontStyle: 'normal' as const,
    labelClass: 'font-bold',
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
    name: 'Elegant Serif',
    fontFamily: `'${cinzel}', serif`,
    fontWeight: 600,
    availableWeights: [400, 500, 600, 700, 800, 900],
    fontStyle: 'normal' as const,
    labelClass: 'font-semibold',
    orientation: 'horizontal' as FontPresetOrientation,
    suggestedAnimation: 'outlineDraw' as CaptionStyleVariant,
  },
  {
    name: 'Essay Slab',
    fontFamily: `'${arvo}', serif`,
    fontWeight: 700,
    availableWeights: [400, 700],
    fontStyle: 'normal' as const,
    labelClass: 'font-bold',
    orientation: 'horizontal' as FontPresetOrientation,
    suggestedAnimation: 'calmPhrase' as CaptionStyleVariant,
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
    name: 'Accessible',
    fontFamily: `'${atkinsonHyperlegible}', sans-serif`,
    fontWeight: 700,
    availableWeights: [400, 700],
    fontStyle: 'normal' as const,
    labelClass: 'font-bold',
    orientation: 'horizontal' as FontPresetOrientation,
    suggestedAnimation: 'calmPhrase' as CaptionStyleVariant,
  },
  {
    name: 'Sci-Fi Tech',
    fontFamily: `'${rajdhani}', sans-serif`,
    fontWeight: 600,
    availableWeights: [400, 500, 600, 700],
    fontStyle: 'normal' as const,
    labelClass: 'font-semibold uppercase tracking-wide',
    orientation: 'horizontal' as FontPresetOrientation,
    suggestedAnimation: 'typewriter' as CaptionStyleVariant,
  },
  {
    name: 'Luxury Display',
    fontFamily: `'${marcellus}', serif`,
    fontWeight: 400,
    availableWeights: [400],
    fontStyle: 'normal' as const,
    labelClass: 'tracking-wide',
    orientation: 'horizontal' as FontPresetOrientation,
    suggestedAnimation: 'outlineDraw' as CaptionStyleVariant,
  },
] as const;

export type FontPresetName = (typeof FONT_PRESETS)[number]['name'];

// PLAN.md Part I3: StylePage's condensed Font card shows a few presets
// "filtered/prioritized by current layoutMode" - presets tuned for the
// active orientation lead (in their existing table order), followed by the
// orientation-agnostic 'both' presets, so slicing the first
// CONDENSED_FONT_COUNT off this reordering surfaces the fonts the Part I
// research actually recommends for that orientation first, instead of
// whichever 'both' presets happen to sit earliest in the full table.
// Doesn't drop the non-matching-orientation presets entirely (unlike a
// plain filter) - they're just deprioritized - so a slice always has enough
// entries to fill the condensed card.
export const getPrioritizedFontPresets = (
  activeOrientation: Exclude<FontPresetOrientation, 'both'>,
): (typeof FONT_PRESETS)[number][] => {
  const matching = FONT_PRESETS.filter((p) => p.orientation === activeOrientation);
  const both = FONT_PRESETS.filter((p) => p.orientation === 'both');
  const rest = FONT_PRESETS.filter((p) => p.orientation !== activeOrientation && p.orientation !== 'both');
  return [...matching, ...both, ...rest];
};
