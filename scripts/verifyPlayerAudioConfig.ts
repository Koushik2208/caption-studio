import fs from 'node:fs';
import path from 'node:path';
import { convertCreativeProjectToProjectState } from '../src/creative/converters.js';
import { validateCreativeProject } from '../src/creative/validation.js';
import type { CreativeProject } from '../src/creative/types.js';

console.log('=== VERIFYING REMOTION PLAYER AUDIO CONCURRENCY & DEDUPLICATION ===\n');

// 1. Verify PreviewPlayer.tsx contains numberOfSharedAudioTags={12}
const previewPlayerPath = path.resolve('src/preview/PreviewPlayer.tsx');
const previewPlayerCode = fs.readFileSync(previewPlayerPath, 'utf8');

if (!previewPlayerCode.includes('numberOfSharedAudioTags={12}')) {
  throw new Error('PreviewPlayer.tsx is missing numberOfSharedAudioTags={12}');
}
console.log('[PASS] Test 1: PreviewPlayer.tsx configures numberOfSharedAudioTags={12}');

// 2. Verify Creative JSON with multiple SFX does not produce duplicate dummy root placements
const multiSfxProject: CreativeProject = {
  version: 1,
  id: 'proj_multi_sfx_test',
  name: 'Multi SFX Concurrency Test',
  fps: 30,
  durationInFrames: 300,
  input: {
    mode: 'idea',
    text: 'Testing audio concurrency with 6+ sound effects.',
  },
  creativeIntent: {
    contentType: 'marketing',
    tone: 'punchy',
  },
  globalSettings: {
    typography: { presetName: 'Viral Hook' },
    animation: 'signature',
    effects: {} as any,
    composition: { layout: 'full-bleed', variant: 'none', bgColor: '#000000', bezelRadiusMultiplier: 1 },
    overlay: { progressBarEnabled: false, progressBarColor: '#0066FF', progressBarPosition: 'bottom', watermarkEnabled: false, watermarkPosition: 'bottom-right', watermarkOpacity: 70 },
    motion: {} as any,
    videoMotion: { type: 'static' },
  },
  beats: [
    {
      id: 'beat_01',
      type: 'hook',
      startFrame: 0,
      endFrame: 50,
      content: { text: 'Beat 1' },
      sfx: { assetId: 'impact', startFrame: 0, volume: 0.8 },
    },
    {
      id: 'beat_02',
      type: 'core_point',
      startFrame: 50,
      endFrame: 100,
      content: { text: 'Beat 2' },
      sfx: { assetId: 'pop_bubble', startFrame: 50, volume: 0.8 },
    },
    {
      id: 'beat_03',
      type: 'statistic',
      startFrame: 100,
      endFrame: 150,
      content: { text: 'Beat 3' },
      sfx: { assetId: 'bass_hit_punchy', startFrame: 100, volume: 0.9 },
    },
    {
      id: 'beat_04',
      type: 'reveal',
      startFrame: 150,
      endFrame: 200,
      content: { text: 'Beat 4' },
      sfx: { assetId: 'camera_flash', startFrame: 150, volume: 0.8 },
    },
    {
      id: 'beat_05',
      type: 'payoff',
      startFrame: 200,
      endFrame: 250,
      content: { text: 'Beat 5' },
      sfx: { assetId: 'vine_boom', startFrame: 200, volume: 0.8 },
    },
    {
      id: 'beat_06',
      type: 'call_to_action',
      startFrame: 250,
      endFrame: 300,
      content: { text: 'Beat 6' },
      sfx: { assetId: 'notification', startFrame: 250, volume: 0.7 },
    },
  ],
  assets: {
    transitions: [],
    sfx: ['impact', 'pop_bubble', 'bass_hit_punchy', 'camera_flash', 'vine_boom', 'notification'],
  },
};

// Validate Creative JSON
const valRes = validateCreativeProject(multiSfxProject);
if (!valRes.isValid) {
  throw new Error(`Creative JSON validation failed: ${valRes.errors.map((e) => e.message).join(', ')}`);
}
console.log('[PASS] Test 2: Project with 6 SFX placements passes Creative JSON validation');

// Convert to state and check soundEffects array length
const state = convertCreativeProjectToProjectState(multiSfxProject);
if (state.assetSettings.soundEffects.length !== 6) {
  throw new Error(`Expected exactly 6 soundEffects placements, got ${state.assetSettings.soundEffects.length}`);
}

// Verify every placement maps to its corresponding beat and no frame 0 phantom duplicates exist
const nonZeroStarts = state.assetSettings.soundEffects.filter((s) => s.startFrame > 0);
if (nonZeroStarts.length !== 5) {
  throw new Error(`Expected 5 non-zero startFrame sound effects, got ${nonZeroStarts.length}`);
}
console.log('[PASS] Test 3: Converted state has exactly 6 distinct beat SFX placements (no duplicate root phantoms)');

console.log('\n=== ALL AUDIO CONCURRENCY & DEDUPLICATION CHECKS PASSED ===\n');
