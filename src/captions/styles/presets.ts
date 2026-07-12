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
import { loadFont as loadSourceSans3 } from '@remotion/google-fonts/SourceSans3';
import { loadFont as loadArchivoBlack } from '@remotion/google-fonts/ArchivoBlack';
import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';

const { fontFamily: bebasNeue } = loadBebasNeue('normal', { weights: ['400'], subsets: ['latin'] });
const { fontFamily: roboto } = loadRoboto('normal', { weights: ['500'], subsets: ['latin'] });
const { fontFamily: montserrat } = loadMontserrat('normal', { weights: ['600'], subsets: ['latin'] });
const { fontFamily: openSans } = loadOpenSans('normal', { weights: ['400'], subsets: ['latin'] });
const { fontFamily: jetBrainsMono } = loadJetBrainsMono('normal', { weights: ['700'], subsets: ['latin'] });
const { fontFamily: sourceSans3 } = loadSourceSans3('normal', { weights: ['400'], subsets: ['latin'] });
const { fontFamily: archivoBlack } = loadArchivoBlack('normal', { weights: ['400'], subsets: ['latin'] });
const { fontFamily: poppins } = loadPoppins('normal', { weights: ['600'], subsets: ['latin'] });

// Research-backed 8-preset table (PLAN.md Part F), replacing the previous 4
// informal ones. Helvetica/Helvetica Neue skipped despite appearing in
// research - not freely web-licensed; Inter/Roboto already cover the same
// visual space without licensing risk.
export const FONT_PRESETS = [
  {
    name: 'Viral Hook',
    fontFamily: `"${bebasNeue}", "Arial Black", sans-serif`,
    fontWeight: 400,
    fontStyle: 'normal' as const,
    labelClass: 'uppercase tracking-wide',
  },
  {
    name: 'Clean Standard',
    fontFamily: `"${roboto}", sans-serif`,
    fontWeight: 500,
    fontStyle: 'normal' as const,
    labelClass: 'font-medium',
  },
  {
    name: 'Soft Modern',
    fontFamily: `"${montserrat}", sans-serif`,
    fontWeight: 600,
    fontStyle: 'normal' as const,
    labelClass: 'font-semibold',
  },
  {
    name: 'Minimal',
    fontFamily: `"${openSans}", sans-serif`,
    fontWeight: 400,
    fontStyle: 'normal' as const,
    labelClass: 'font-normal',
  },
  {
    name: 'Tech/Mono',
    fontFamily: `"${jetBrainsMono}", monospace`,
    fontWeight: 700,
    fontStyle: 'normal' as const,
    labelClass: 'font-bold font-mono',
  },
  {
    name: 'Editorial',
    fontFamily: `"${sourceSans3}", sans-serif`,
    fontWeight: 400,
    fontStyle: 'normal' as const,
    labelClass: 'font-normal',
  },
  {
    name: 'Impact Punch',
    fontFamily: `"${archivoBlack}", "Arial Black", sans-serif`,
    fontWeight: 400,
    fontStyle: 'normal' as const,
    labelClass: 'uppercase',
  },
  {
    name: 'Rounded Friendly',
    fontFamily: `"${poppins}", sans-serif`,
    fontWeight: 600,
    fontStyle: 'normal' as const,
    labelClass: 'font-semibold',
  },
] as const;

export type FontPresetName = (typeof FONT_PRESETS)[number]['name'];
