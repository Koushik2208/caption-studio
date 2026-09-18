import assert from 'node:assert';
import { validateCreativeProject } from '../src/creative/validation.js';
import { createDefaultCreativeProject, DEFAULT_GLOBAL_SETTINGS } from '../src/creative/defaults.js';
import type { CreativeProject } from '../src/creative/types.js';

console.log('=== STARTING MULTILINGUAL CREATIVE JSON VERIFICATION ===\n');

// 1. Existing document without language fields (Backward Compatibility)
const existingEnglishProject: CreativeProject = createDefaultCreativeProject({
  id: 'proj_en_legacy',
  name: 'Legacy English Project',
  fps: 30,
  durationInFrames: 300,
  input: {
    mode: 'srt',
    text: 'Hello world, welcome to caption studio.',
  },
  creativeIntent: {
    contentType: 'educational',
    tone: 'punchy',
    energy: 'high',
    pacing: 'fast',
    visualStyle: 'modern_bold',
  },
  globalSettings: {
    ...DEFAULT_GLOBAL_SETTINGS,
    typography: {
      ...DEFAULT_GLOBAL_SETTINGS.typography,
      presetName: 'Viral Hook',
    },
    animation: 'signature',
  },
  beats: [
    {
      id: 'beat_01',
      type: 'hook',
      startFrame: 0,
      endFrame: 150,
      content: {
        text: 'Hello world, welcome to caption studio.',
        words: [
          { text: 'Hello', startMs: 0, endMs: 500 },
          { text: ' world,', startMs: 500, endMs: 1200 },
          { text: ' welcome', startMs: 1200, endMs: 2500 },
          { text: ' to', startMs: 2500, endMs: 3200 },
          { text: ' caption', startMs: 3200, endMs: 4000 },
          { text: ' studio.', startMs: 4000, endMs: 5000 },
        ],
      },
    },
  ],
});

const res1 = validateCreativeProject(existingEnglishProject);
assert.strictEqual(res1.isValid, true, 'Legacy document without language metadata must validate');
console.log('[PASS] Test 1: Backward-compatibility with legacy documents without language metadata');

// 2. Multilingual Non-English (Telugu) Source -> English Creative Beats
const teluguToEnglishProject: CreativeProject = createDefaultCreativeProject({
  id: 'proj_te_to_en',
  name: 'Telugu to English Project',
  fps: 30,
  durationInFrames: 600, // 20.0s @ 30fps
  input: {
    mode: 'srt',
    text: 'మన business కోసం ఒక website build చేయాలి. ఇది చాలా ముఖ్యమైన అడుగు.',
    sourceLanguage: 'te',
    outputLanguage: 'en',
  },
  creativeIntent: {
    contentType: 'educational',
    tone: 'punchy',
    energy: 'medium',
    pacing: 'moderate',
    visualStyle: 'modern_bold',
  },
  globalSettings: {
    ...DEFAULT_GLOBAL_SETTINGS,
    typography: {
      ...DEFAULT_GLOBAL_SETTINGS.typography,
      presetName: 'Soft Modern',
    },
    animation: 'calmPhrase',
  },
  beats: [
    {
      id: 'beat_01',
      type: 'hook',
      startFrame: 0,
      endFrame: 300, // 0.0s - 10.0s exactly matching source spoken timing
      content: {
        text: 'We need to build a website for our business.',
      },
      visual: {
        animation: 'signature',
      },
    },
    {
      id: 'beat_02',
      type: 'core_point',
      startFrame: 300,
      endFrame: 600, // 10.0s - 20.0s exactly matching source spoken timing
      content: {
        text: 'This is a crucial first step.',
      },
      visual: {
        animation: 'blurResolve',
      },
    },
  ],
});

const res2 = validateCreativeProject(teluguToEnglishProject);
assert.strictEqual(res2.isValid, true, `Telugu -> English project must validate: ${JSON.stringify(res2.errors)}`);
console.log('[PASS] Test 2: Multilingual Telugu source -> Natural English creative beats validates cleanly');

// 3. Mixed-language code-switching
const mixedLangProject: CreativeProject = createDefaultCreativeProject({
  id: 'proj_mixed_lang',
  name: 'Mixed Code-Switched Project',
  fps: 30,
  durationInFrames: 450,
  input: {
    mode: 'transcript',
    text: 'Marketing strategy lo AI tools use chesthe results amazing ga untayi.',
    sourceLanguage: 'te',
    outputLanguage: 'en',
  },
  creativeIntent: {
    contentType: 'educational',
    tone: 'punchy',
    energy: 'high',
    pacing: 'fast',
    visualStyle: 'modern_bold',
  },
  globalSettings: {
    ...DEFAULT_GLOBAL_SETTINGS,
    typography: {
      ...DEFAULT_GLOBAL_SETTINGS.typography,
      presetName: 'Viral Hook',
    },
    animation: 'splitReveal',
  },
  beats: [
    {
      id: 'beat_01',
      type: 'hook',
      startFrame: 0,
      endFrame: 240,
      content: {
        text: 'If you use AI tools in your marketing strategy...',
      },
    },
    {
      id: 'beat_02',
      type: 'payoff',
      startFrame: 240,
      endFrame: 450,
      content: {
        text: '...the results will be amazing.',
      },
    },
  ],
});

const res3 = validateCreativeProject(mixedLangProject);
assert.strictEqual(res3.isValid, true, `Mixed language project must validate: ${JSON.stringify(res3.errors)}`);
console.log('[PASS] Test 3: Mixed-language / code-switched transcript translates to clean English beats');

// 4. Invalid language metadata rejection (type safety)
const invalidLangProject: unknown = {
  ...teluguToEnglishProject,
  input: {
    mode: 'srt',
    text: 'test',
    sourceLanguage: '', // empty string rejected
  },
};
const res4 = validateCreativeProject(invalidLangProject);
assert.strictEqual(res4.isValid, false, 'Empty sourceLanguage must be rejected');
console.log('[PASS] Test 4: Invalid language metadata correctly rejected by validator');

console.log('\n=== ALL MULTILINGUAL TESTS PASSED (4 / 4) ===\n');
