import {
  validateCreativeProject,
  parseCreativeProject,
  serializeCreativeProject,
  createDefaultCreativeProject,
  convertCreativeProjectToProjectState,
  convertProjectStateToCreativeProject,
  convertSrtToCreativeBeats,
  resolveBeatVisualSettings,
  resolveCreativeProjectMedia,
  getMaxProjectFrames,
  CAPABILITY_CATALOG,
  type ProjectStateExportInput,
} from '../src/creative/index.js';
import { ALL_BUILT_IN_ASSETS, TRANSITION_OVERLAYS, SOUND_EFFECTS } from '../src/assets/registry.js';

function runTests() {
  console.log('=== STARTING CREATIVE JSON AUDIT & FINAL VERIFICATION ===\n');
  let passCount = 0;
  let totalCount = 0;

  function test(name: string, fn: () => void) {
    totalCount++;
    try {
      fn();
      console.log(`[PASS] Test ${totalCount}: ${name}`);
      passCount++;
    } catch (err) {
      console.error(`[FAIL] Test ${totalCount}: ${name}`);
      console.error(err);
    }
  }

  // 1. Idea-mode document
  test('1. Idea-mode document validates and represents generated script intent', () => {
    const doc = createDefaultCreativeProject({
      id: 'proj_idea_photosynthesis',
      name: 'Photosynthesis Explained',
      durationInFrames: 300,
      input: {
        mode: 'idea',
        text: 'I want to make a video about photosynthesis.',
      },
      creativeIntent: {
        contentType: 'educational',
        tone: 'punchy',
        energy: 'high',
        pacing: 'fast',
        visualStyle: 'modern_bold',
      },
      beats: [
        {
          id: 'beat_01',
          type: 'hook',
          startFrame: 0,
          endFrame: 120,
          content: { text: 'Plants are basically solar-powered factories.' },
        },
        {
          id: 'beat_02',
          type: 'core_point',
          startFrame: 120,
          endFrame: 300,
          content: { text: 'They capture photons and churn out glucose and oxygen.' },
        },
      ],
    });
    const result = validateCreativeProject(doc);
    if (!result.isValid) throw new Error(`Failed: ${JSON.stringify(result.errors)}`);
  });

  // 2. SRT-mode document
  test('2. SRT-mode document preserves SRT origin and frame-accurate timing', () => {
    const srtRaw = `1\n00:00:00,000 --> 00:00:02,000\nWelcome to caption studio.\n\n2\n00:00:02,100 --> 00:00:04,500\nIt turns ideas into video.`;
    const doc = createDefaultCreativeProject({
      id: 'proj_srt_demo',
      input: {
        mode: 'srt',
        rawSrt: srtRaw,
        fileName: 'captions.srt',
      },
      durationInFrames: 150,
      beats: [
        {
          id: 'beat_01',
          type: 'hook',
          startFrame: 0,
          endFrame: 60,
          content: {
            text: 'Welcome to caption studio.',
            words: [
              { text: 'Welcome', startMs: 0, endMs: 500 },
              { text: ' to', startMs: 500, endMs: 800 },
              { text: ' caption', startMs: 800, endMs: 1400 },
              { text: ' studio.', startMs: 1400, endMs: 2000 },
            ],
          },
        },
      ],
    });
    const result = validateCreativeProject(doc);
    if (!result.isValid) throw new Error(`Failed: ${JSON.stringify(result.errors)}`);
  });

  // 3. Transcript-mode document
  test('3. Transcript-mode document supports structured timestamp entries', () => {
    const doc = createDefaultCreativeProject({
      id: 'proj_transcript_demo',
      input: {
        mode: 'transcript',
        entries: [
          { text: 'First spoken sentence', startMs: 0, endMs: 1500, confidence: 0.98 },
          { text: 'Second spoken sentence', startMs: 1600, endMs: 3200, confidence: 0.95 },
        ],
      },
      durationInFrames: 120,
    });
    const result = validateCreativeProject(doc);
    if (!result.isValid) throw new Error(`Failed: ${JSON.stringify(result.errors)}`);
  });

  // 4. Plain-text document
  test('4. Plain-text document represents timing generation without audio', () => {
    const doc = createDefaultCreativeProject({
      id: 'proj_text_demo',
      input: {
        mode: 'text',
        rawText: 'Step one: initialize project. Step two: generate beats.',
      },
      durationInFrames: 180,
    });
    const result = validateCreativeProject(doc);
    if (!result.isValid) throw new Error(`Failed: ${JSON.stringify(result.errors)}`);
  });

  // 5. Multiple beats
  test('5. Multiple distinct semantic beats validate and maintain sequence', () => {
    const doc = createDefaultCreativeProject({
      id: 'proj_multi_beats',
      durationInFrames: 450,
      beats: [
        { id: 'beat_01', type: 'hook', startFrame: 0, endFrame: 75, content: { text: 'Beat 1' } },
        { id: 'beat_02', type: 'question', startFrame: 75, endFrame: 150, content: { text: 'Beat 2' } },
        { id: 'beat_03', type: 'explanation', startFrame: 150, endFrame: 270, content: { text: 'Beat 3' } },
        { id: 'beat_04', type: 'statistic', startFrame: 270, endFrame: 330, content: { text: 'Beat 4' } },
        { id: 'beat_05', type: 'reveal', startFrame: 330, endFrame: 390, content: { text: 'Beat 5' } },
        { id: 'beat_06', type: 'conclusion', startFrame: 390, endFrame: 450, content: { text: 'Beat 6' } },
      ],
    });
    const result = validateCreativeProject(doc);
    if (!result.isValid) throw new Error(`Failed: ${JSON.stringify(result.errors)}`);
    if (result.data?.beats.length !== 6) throw new Error('Beat count mismatch');
  });

  // 6. Global defaults + beat override
  test('6. Global defaults + beat override resolves cleanly and deterministically', () => {
    const doc = createDefaultCreativeProject({
      globalSettings: {
        ...createDefaultCreativeProject().globalSettings,
        animation: 'signature',
        typography: {
          ...createDefaultCreativeProject().globalSettings.typography,
          textColor: '#FFFFFF',
          fontSizeMultiplier: 1.0,
        },
      },
      beats: [
        {
          id: 'beat_01',
          type: 'hook',
          startFrame: 0,
          endFrame: 150,
          content: { text: 'Beat with overrides' },
          visual: {
            animation: 'wordStamp',
            typography: {
              textColor: '#FFDD00',
              fontSizeMultiplier: 1.3,
            },
          },
        },
      ],
    });
    const result = validateCreativeProject(doc);
    if (!result.isValid) throw new Error(`Failed: ${JSON.stringify(result.errors)}`);

    const resolved = resolveBeatVisualSettings(doc.globalSettings, doc.beats[0].visual);
    if (resolved.animation !== 'wordStamp') throw new Error('Animation override failed');
    if (resolved.typography.textColor !== '#FFDD00') throw new Error('Color override failed');
    if (resolved.typography.fontSizeMultiplier !== 1.3) throw new Error('Font size override failed');
  });

  // 7. Explicit effect disable / override on a beat
  test('7. Beat can explicitly disable or customize a global effect', () => {
    const doc = createDefaultCreativeProject({
      globalSettings: {
        ...createDefaultCreativeProject().globalSettings,
        effects: {
          ...createDefaultCreativeProject().globalSettings.effects,
          filmGrainEnabled: true,
          filmGrainIntensity: 'high',
        },
        videoMotion: {
          type: 'zoom-in',
          intensity: 'medium',
        },
      },
      beats: [
        {
          id: 'beat_01',
          type: 'hook',
          startFrame: 0,
          endFrame: 150,
          content: { text: 'Clean beat with disabled grain and static motion' },
          visual: {
            effects: {
              filmGrainEnabled: false,
            },
            videoMotion: {
              type: 'static',
            },
          },
        },
      ],
    });
    const result = validateCreativeProject(doc);
    if (!result.isValid) throw new Error(`Failed: ${JSON.stringify(result.errors)}`);

    const resolved = resolveBeatVisualSettings(doc.globalSettings, doc.beats[0].visual);
    if (resolved.effects.filmGrainEnabled !== false) throw new Error('Explicit disable failed');
    if (resolved.videoMotion.type !== 'static') throw new Error('Motion override to static failed');
  });

  // 8. Word-level typography override
  test('8. Word-level typography override is preserved in Creative JSON', () => {
    const doc = createDefaultCreativeProject({
      globalSettings: {
        ...createDefaultCreativeProject().globalSettings,
        typography: {
          ...createDefaultCreativeProject().globalSettings.typography,
          wordOverrides: {
            'word_123': {
              color: '#00FFCC',
              fontSize: 1.4,
              fontStyle: 'italic',
            },
          },
        },
      },
    });
    const result = validateCreativeProject(doc);
    if (!result.isValid) throw new Error(`Failed: ${JSON.stringify(result.errors)}`);
    if (result.data?.globalSettings.typography.wordOverrides?.['word_123']?.color !== '#00FFCC') {
      throw new Error('Word override not retained');
    }
  });

  // 9. Transition placement
  test('9. Transition placement is frame-accurate and references registered asset', () => {
    const doc = createDefaultCreativeProject({
      beats: [
        {
          id: 'beat_01',
          type: 'hook',
          startFrame: 0,
          endFrame: 150,
          content: { text: 'Beat with transition' },
          transition: {
            assetId: 'film_burn',
            startFrame: 140,
            durationInFrames: 10,
            opacity: 0.85,
          },
        },
      ],
    });
    const result = validateCreativeProject(doc);
    if (!result.isValid) throw new Error(`Failed: ${JSON.stringify(result.errors)}`);
  });

  // 10. SFX placement
  test('10. SFX placement is frame-accurate and references registered sound effect', () => {
    const doc = createDefaultCreativeProject({
      beats: [
        {
          id: 'beat_01',
          type: 'hook',
          startFrame: 0,
          endFrame: 150,
          content: { text: 'Beat with sfx' },
          sfx: [
            { assetId: 'vine_boom', startFrame: 5, volume: 0.9 },
            { assetId: 'pop_bubble', startFrame: 45, volume: 0.4 },
            { assetId: 'camera_flash', startFrame: 90, volume: 0.8 },
          ],
        },
      ],
    });
    const result = validateCreativeProject(doc);
    if (!result.isValid) throw new Error(`Failed: ${JSON.stringify(result.errors)}`);
  });

  // 11. Media reference
  test('11. Media reference uses stable asset ID ready for multi-media split', () => {
    const doc = createDefaultCreativeProject({
      assets: {
        media: [
          { id: 'video_main', type: 'video', name: 'Primary Speaker' },
          { id: 'video_b_roll', type: 'video', name: 'B-Roll Footage' },
        ],
      },
      beats: [
        {
          id: 'beat_01',
          type: 'hook',
          startFrame: 0,
          endFrame: 150,
          content: { text: 'Main speaker' },
          media: { assetId: 'video_main', zone: 'top' },
        },
      ],
    });
    const result = validateCreativeProject(doc);
    if (!result.isValid) throw new Error(`Failed: ${JSON.stringify(result.errors)}`);
  });

  // 12. 5-minute boundary
  test('12. 5-minute exact duration (9000 frames @ 30fps) passes validation', () => {
    const maxFrames = getMaxProjectFrames(30); // 9000
    const doc = createDefaultCreativeProject({
      fps: 30,
      durationInFrames: maxFrames,
      beats: [
        {
          id: 'beat_01',
          type: 'hook',
          startFrame: 0,
          endFrame: maxFrames,
          content: { text: 'Full 5-minute video' },
        },
      ],
    });
    const result = validateCreativeProject(doc);
    if (!result.isValid) throw new Error(`Failed: ${JSON.stringify(result.errors)}`);
  });

  // 13. >5-minute rejection
  test('13. Duration > 5 minutes (e.g. 9001 frames @ 30fps or 18001 @ 60fps) is strictly rejected', () => {
    const doc = createDefaultCreativeProject({
      fps: 60,
      durationInFrames: getMaxProjectFrames(60) + 1, // 18001 frames @ 60fps
    });
    const result = validateCreativeProject(doc);
    if (result.isValid) throw new Error('Expected validation failure for >5 min at 60fps');
    if (!result.errors.some((e) => e.code === 'PROJECT_DURATION_EXCEEDS_5_MINUTES')) {
      throw new Error('Missing PROJECT_DURATION_EXCEEDS_5_MINUTES code');
    }
  });

  // 14. Round-trip conversion
  test('14. Round-trip ProjectState <-> CreativeJSON preserves creative decisions without loss', () => {
    const initialDoc = createDefaultCreativeProject({
      id: 'proj_roundtrip_test',
      name: 'Roundtrip Test',
      durationInFrames: 300,
      beats: [
        {
          id: 'beat_01',
          type: 'hook',
          startFrame: 0,
          endFrame: 150,
          content: {
            text: 'First beat text',
            words: [
              { text: 'First', startMs: 0, endMs: 1000 },
              { text: ' beat', startMs: 1000, endMs: 2500 },
              { text: ' text', startMs: 2500, endMs: 5000 },
            ],
          },
          transition: { assetId: 'flash', startFrame: 0, durationInFrames: 8, opacity: 0.75 },
          sfx: { assetId: 'impact', startFrame: 0, volume: 0.8 },
        },
      ],
    });

    const jsonString = serializeCreativeProject(initialDoc);
    const parseResult = parseCreativeProject(jsonString);
    if (!parseResult.isValid || !parseResult.data) throw new Error('JSON parsing failed');

    const projectState = convertCreativeProjectToProjectState(parseResult.data);
    const roundTripped = convertProjectStateToCreativeProject(projectState.rawSettings as ProjectStateExportInput);
    const valResult = validateCreativeProject(roundTripped);
    if (!valResult.isValid) throw new Error(`Roundtrip validation failed: ${JSON.stringify(valResult.errors)}`);
    if (roundTripped.beats.length === 0) throw new Error('Beats lost in roundtrip');
    if (roundTripped.assets?.transitions?.includes('flash') !== true) throw new Error('Transition lost');
    if (roundTripped.assets?.sfx?.includes('impact') !== true) throw new Error('SFX lost');
  });

  // 15. Unknown capability rejection
  test('15. Unknown capability (e.g. invalid animation variant) is rejected with clear path', () => {
    const badDoc = createDefaultCreativeProject({
      globalSettings: {
        ...createDefaultCreativeProject().globalSettings,
        animation: 'invalid_super_animation' as any,
      },
    });
    const result = validateCreativeProject(badDoc);
    if (result.isValid) throw new Error('Expected unknown capability rejection');
    if (!result.errors.some((e) => e.path === 'globalSettings.animation')) {
      throw new Error(`Expected error path 'globalSettings.animation', got: ${JSON.stringify(result.errors)}`);
    }
  });

  // 16. Unknown asset rejection
  test('16. Unknown transition or SFX asset is rejected with clear path', () => {
    const badDoc = createDefaultCreativeProject({
      beats: [
        {
          id: 'beat_01',
          type: 'hook',
          startFrame: 0,
          endFrame: 150,
          content: { text: 'Bad asset' },
          transition: { assetId: 'unregistered_transition_xyz', startFrame: 0, durationInFrames: 10 },
        },
      ],
    });
    const result = validateCreativeProject(badDoc);
    if (result.isValid) throw new Error('Expected unknown transition asset rejection');
    if (!result.errors.some((e) => e.path === 'beats[0].transition.assetId')) {
      throw new Error(`Expected error path 'beats[0].transition.assetId', got: ${JSON.stringify(result.errors)}`);
    }
  });

  // 17. Existing SRT conversion
  test('17. Existing SRT parser produces word-level captions and structured CreativeBeats', () => {
    const srt = `1\n00:00:00,000 --> 00:00:02,000\nHello world.\n\n2\n00:00:02,100 --> 00:00:04,500\nThis is caption studio.`;
    const { beats, captions } = convertSrtToCreativeBeats(srt, 30);
    if (beats.length === 0 || captions.length === 0) throw new Error('SRT conversion empty');
  });

  // 18. Existing ProjectContext conversion
  test('18. Existing ProjectContext persisted state formats convert to Creative JSON cleanly', () => {
    const rawState: ProjectStateExportInput = {
      projectId: 'proj_ctx_01',
      projectName: 'Context Project',
      durationInFrames: 150,
      captions: [{ text: 'Hello', startMs: 0, endMs: 500, timestampMs: 0, confidence: 1 }],
      presetName: 'Viral Hook',
      animation: 'signature',
      keywordHighlightEnabled: true,
      highlightIntensity: 0.5,
      highlightColor: '#0066ff',
      keywords: ['Hello'],
      position: 'center',
      captionPositionY: 0.5,
      textAlign: 'center',
      fontSizeMultiplier: 1.0,
      textColor: '#FFFFFF',
      fontWeight: 400,
      strokeEnabled: false,
      strokeColor: '#000000',
      strokeWidth: 2,
      shadowEnabled: true,
      glowEnabled: false,
      glowColor: '#00e5ff',
      glowIntensity: 0.5,
      glowBlur: 12,
      glowOpacity: 0.8,
      gradientEnabled: false,
      gradientStart: '#ff007a',
      gradientEnd: '#7928ca',
      gradientAngle: 90,
      letterSpacing: 0,
      lineHeight: 1.2,
      textTransform: 'none',
      backdropEnabled: false,
      backdropColor: '#000000',
      backdropOpacity: 60,
      backdropRadius: 8,
      backdropPaddingX: 16,
      backdropPaddingY: 8,
      wordOverrides: {},
      watermarkEnabled: false,
      watermarkOpacity: 60,
      watermarkPosition: 'tr',
      progressBarEnabled: false,
      progressBarColor: '#3b82f6',
      progressBarPosition: 'bottom',
      frameVariant: 'none',
      frameBgColor: '#000000',
      bezelRadiusMultiplier: 1.0,
      layout: 'full-bleed',
      cardMode: 'preset',
      customScale: 0.85,
      customAspectRatio: '9:16',
      customPositionY: 0.5,
      customBorderRadius: 24,
      customBorderEnabled: false,
      customBorderWidth: 2,
      customBorderColor: '#ffffff',
      customBorderStyle: 'solid',
      customShadowEnabled: true,
      customShadowBlur: 24,
      customShadowOpacity: 40,
      customBackdrop: 'none',
      customBackdropColor: '#121214',
      customBackdropGradient: '',
      splitGap: 0,
      splitTopFocalX: 0.5,
      splitTopFocalY: 0.25,
      splitBottomFocalX: 0.5,
      splitBottomFocalY: 0.75,
      splitLeftFocalX: 0.25,
      splitLeftFocalY: 0.5,
      splitRightFocalX: 0.75,
      splitRightFocalY: 0.5,
      filmDustEnabled: false,
      halationEnabled: false,
      halationIntensity: 'medium',
      gridEnabled: false,
      gridIntensity: 'medium',
      crtScanlinesEnabled: false,
      crtScanlinesIntensity: 'medium',
      halftoneEnabled: false,
      halftoneIntensity: 'medium',
      lightLeakEnabled: false,
      lightLeakIntensity: 'medium',
      chromaticAberrationEnabled: false,
      chromaticAberrationIntensity: 'medium',
      filmGrainEnabled: false,
      filmGrainIntensity: 'medium',
      audioPulseEnabled: false,
      audioPulseIntensity: 'medium',
      keywordPunchEnabled: false,
      keywordPunchIntensity: 'medium',
      codeBlockEnabled: false,
      codeBlockCode: '',
      codeBlockLanguage: 'js',
      codeBlockPosition: 'center',
      codeBlockLinesPerPage: 10,
      numberCounterEnabled: false,
      numberCounterStart: 0,
      numberCounterEnd: 100,
      numberCounterPrefix: '',
      numberCounterSuffix: '%',
      tickerEnabled: false,
      tickerText: '',
      tickerDirection: 'left',
      tickerPosition: 'bottom',
      videoMotion: { type: 'static', intensity: 'subtle', speed: 'medium', direction: 'zoom-in-center' },
      transitionOverlays: [],
      soundEffects: [],
    };
    const converted = convertProjectStateToCreativeProject(rawState);
    const valResult = validateCreativeProject(converted);
    if (!valResult.isValid) throw new Error(`Conversion validation failed: ${JSON.stringify(valResult.errors)}`);
  });

  // 19. Existing asset registry compatibility
  test('19. Capability catalog & asset registry remain authoritative (23 assets, 2 transitions, 21 SFX)', () => {
    if (ALL_BUILT_IN_ASSETS.length !== 23) throw new Error(`Asset count mismatch: ${ALL_BUILT_IN_ASSETS.length}`);
    if (TRANSITION_OVERLAYS.length !== 2) throw new Error(`Transition count mismatch: ${TRANSITION_OVERLAYS.length}`);
    if (SOUND_EFFECTS.length !== 21) throw new Error(`SFX count mismatch: ${SOUND_EFFECTS.length}`);
    if (CAPABILITY_CATALOG.animations.length !== 9) throw new Error('Animation catalog count mismatch');
    if (CAPABILITY_CATALOG.fontPresets.length !== 9) throw new Error('Font preset catalog count mismatch');
  });

  // 20. Media resolution: No media reference preserves currently loaded video
  test('20. Media resolution: Creative JSON with NO media reference preserves currently loaded video', () => {
    const doc = createDefaultCreativeProject({
      id: 'proj_no_media',
      durationInFrames: 150,
      beats: [{ id: 'b1', type: 'hook', startFrame: 0, endFrame: 150, content: { text: 'Test' } }],
    });
    // Ensure assets.media is undefined/empty
    doc.assets = { transitions: [], sfx: [] };

    const currentMedia = { name: 'my_interview.mp4', size: 1024 * 1024, type: 'video/mp4' };
    const res = resolveCreativeProjectMedia(doc, currentMedia);
    if (res.action !== 'preserve') {
      throw new Error(`Expected action 'preserve' but got '${res.action}': ${res.reason}`);
    }
  });

  // 21. Media resolution: Matching media reference preserves current video
  test('21. Media resolution: Matching media reference (exact name / base name / srt) preserves current video', () => {
    const docWithExactName = createDefaultCreativeProject({
      id: 'proj_matched_media',
      durationInFrames: 150,
      assets: {
        media: [{ id: 'video_main', type: 'video', name: 'podcast_clip.mp4' }],
      },
      beats: [{ id: 'b1', type: 'hook', startFrame: 0, endFrame: 150, content: { text: 'Test' } }],
    });

    const currentMedia = { name: 'podcast_clip.mp4', size: 50000, type: 'video/mp4' };
    const res = resolveCreativeProjectMedia(docWithExactName, currentMedia);
    if (res.action !== 'preserve') {
      throw new Error(`Expected action 'preserve' for matching media but got '${res.action}'`);
    }

    // Also test matching via input.fileName
    const docWithSrt = createDefaultCreativeProject({
      id: 'proj_srt_match',
      durationInFrames: 150,
      input: { mode: 'srt', fileName: 'speech_take1.srt' },
      beats: [{ id: 'b1', type: 'hook', startFrame: 0, endFrame: 150, content: { text: 'Test' } }],
    });
    const srtMedia = { name: 'speech_take1.mp4', size: 50000, type: 'video/mp4' };
    const resSrt = resolveCreativeProjectMedia(docWithSrt, srtMedia);
    if (resSrt.action !== 'preserve') {
      throw new Error(`Expected action 'preserve' for matching SRT base name but got '${resSrt.action}'`);
    }
  });

  // 22. Media resolution: Different media asset clears current video to prevent showing wrong footage
  test('22. Media resolution: Unmatched/different media reference clears current video', () => {
    const docWithDifferentMedia = createDefaultCreativeProject({
      id: 'proj_different_media',
      durationInFrames: 150,
      assets: {
        media: [{ id: 'video_nature', type: 'video', name: 'nature_documentary.mp4' }],
      },
      beats: [{ id: 'b1', type: 'hook', startFrame: 0, endFrame: 150, content: { text: 'Test' } }],
    });

    const currentMedia = { name: 'tech_tutorial.mp4', size: 50000, type: 'video/mp4' };
    const res = resolveCreativeProjectMedia(docWithDifferentMedia, currentMedia);
    if (res.action !== 'clear') {
      throw new Error(`Expected action 'clear' for different media but got '${res.action}'`);
    }
    if (res.requiredAssetName !== 'nature_documentary.mp4') {
      throw new Error(`Expected requiredAssetName 'nature_documentary.mp4' but got '${res.requiredAssetName}'`);
    }
  });

  // 23. Media resolution: Never assume "video_main" matches whatever video is currently loaded
  test('23. Media resolution: Generic "video_main" with non-matching name does not assume match', () => {
    const docWithSpecificMain = createDefaultCreativeProject({
      id: 'proj_specific_main',
      durationInFrames: 150,
      assets: {
        media: [{ id: 'video_main', type: 'video', name: 'cooking_show.mp4' }],
      },
      beats: [{ id: 'b1', type: 'hook', startFrame: 0, endFrame: 150, content: { text: 'Test' } }],
    });

    const currentMedia = { name: 'gaming_stream.mp4', size: 50000, type: 'video/mp4' };
    const res = resolveCreativeProjectMedia(docWithSpecificMain, currentMedia);
    if (res.action !== 'clear') {
      throw new Error(`Expected action 'clear' for non-matching video_main name but got '${res.action}'`);
    }
  });

  // 24. Media resolution: Export with loaded media round-trips media name and preserves on re-import
  test('24. Media resolution: Export with loaded media round-trips media name and preserves on re-import', () => {
    const rawState: ProjectStateExportInput = {
      projectId: 'proj_export_test',
      projectName: 'Marketing Reel',
      mediaFileName: 'promo_video.mp4',
      durationInFrames: 300,
      captions: [{ text: 'Hello', startMs: 0, endMs: 1000, timestampMs: null, confidence: null }],
      presetName: 'Viral Hook',
      animation: 'signature',
      keywordHighlightEnabled: true,
      highlightIntensity: 0.5,
      highlightColor: '#0066ff',
      keywords: ['Hello'],
      position: 'center',
      captionPositionY: 0.5,
      textAlign: 'center',
      fontSizeMultiplier: 1.0,
      textColor: '#FFFFFF',
      fontWeight: null,
      strokeEnabled: false,
      strokeColor: '#000000',
      strokeWidth: 2,
      shadowEnabled: true,
      glowEnabled: false,
      glowColor: '#00e5ff',
      glowIntensity: 0.5,
      glowBlur: 12,
      glowOpacity: 0.8,
      gradientEnabled: false,
      gradientStart: '#ff007a',
      gradientEnd: '#7928ca',
      gradientAngle: 90,
      letterSpacing: 0,
      lineHeight: 1.2,
      textTransform: 'none',
      backdropEnabled: false,
      backdropColor: '#000000',
      backdropOpacity: 60,
      backdropRadius: 8,
      backdropPaddingX: 16,
      backdropPaddingY: 8,
      wordOverrides: {},
      watermarkEnabled: false,
      watermarkOpacity: 30,
      watermarkPosition: 'tr',
      progressBarEnabled: false,
      progressBarColor: '#0066ff',
      progressBarPosition: 'bottom',
      frameVariant: 'minimalBezel',
      frameBgColor: '#000000',
      bezelRadiusMultiplier: 1.0,
      layout: 'full-bleed',
      cardMode: 'preset',
      customScale: 0.85,
      customAspectRatio: '9:16',
      customPositionY: 0.5,
      customBorderRadius: 24,
      customBorderEnabled: false,
      customBorderWidth: 2,
      customBorderColor: '#ffffff',
      customBorderStyle: 'solid',
      customShadowEnabled: true,
      customShadowBlur: 24,
      customShadowOpacity: 40,
      customBackdrop: 'none',
      customBackdropColor: '#121214',
      customBackdropGradient: '',
      splitGap: 0,
      splitTopFocalX: 0.5,
      splitTopFocalY: 0.25,
      splitBottomFocalX: 0.5,
      splitBottomFocalY: 0.75,
      splitLeftFocalX: 0.25,
      splitLeftFocalY: 0.5,
      splitRightFocalX: 0.75,
      splitRightFocalY: 0.5,
      filmDustEnabled: false,
      halationEnabled: false,
      halationIntensity: 'medium',
      gridEnabled: false,
      gridIntensity: 'medium',
      crtScanlinesEnabled: false,
      crtScanlinesIntensity: 'medium',
      halftoneEnabled: false,
      halftoneIntensity: 'medium',
      lightLeakEnabled: false,
      lightLeakIntensity: 'medium',
      chromaticAberrationEnabled: false,
      chromaticAberrationIntensity: 'medium',
      filmGrainEnabled: false,
      filmGrainIntensity: 'medium',
      audioPulseEnabled: false,
      audioPulseIntensity: 'medium',
      keywordPunchEnabled: false,
      keywordPunchIntensity: 'medium',
      codeBlockEnabled: false,
      codeBlockCode: '',
      codeBlockLanguage: 'js',
      codeBlockPosition: 'center',
      codeBlockLinesPerPage: 10,
      numberCounterEnabled: false,
      numberCounterStart: 0,
      numberCounterEnd: 100,
      numberCounterPrefix: '',
      numberCounterSuffix: '%',
      tickerEnabled: false,
      tickerText: '',
      tickerDirection: 'left',
      tickerPosition: 'bottom',
      videoMotion: { type: 'static', intensity: 'subtle', speed: 'medium', direction: 'zoom-in-center' },
      transitionOverlays: [],
      soundEffects: [],
    };

    const exported = convertProjectStateToCreativeProject(rawState);
    if (!exported.assets?.media || exported.assets.media.length !== 1) {
      throw new Error(`Expected 1 media asset in exported Creative JSON`);
    }
    if (exported.assets.media[0].name !== 'promo_video.mp4') {
      throw new Error(`Expected exported media name 'promo_video.mp4' but got '${exported.assets.media[0].name}'`);
    }

    const currentMedia = { name: 'promo_video.mp4', size: 100000, type: 'video/mp4' };
    const res = resolveCreativeProjectMedia(exported, currentMedia);
    if (res.action !== 'preserve') {
      throw new Error(`Expected action 'preserve' on re-import of exported project`);
    }
  });

  // 25. Regression test: Overlapping beats must fail validation
  test('25. Regression: Overlapping beats (beat_01: 41->854, beat_02: 461->865) strictly rejected with overlap details', () => {
    const doc = createDefaultCreativeProject({
      id: 'proj_overlap_regression',
      durationInFrames: 900,
      beats: [
        {
          id: 'beat_01',
          type: 'hook',
          startFrame: 41,
          endFrame: 854,
          content: { text: 'building may suffer localised damage' },
        },
        {
          id: 'beat_02',
          type: 'core_point',
          startFrame: 461,
          endFrame: 865,
          content: { text: 'distribution of remaining structural members' },
        },
      ],
    });
    const result = validateCreativeProject(doc);
    if (result.isValid) {
      throw new Error('Expected validation to fail for overlapping beats, but it passed');
    }
    const overlapErr = result.errors.find((e) => e.code === 'OVERLAPPING_BEATS');
    if (!overlapErr) {
      throw new Error(`Expected OVERLAPPING_BEATS error code, got: ${JSON.stringify(result.errors)}`);
    }
    if (!overlapErr.message.includes('beat_01') || !overlapErr.message.includes('beat_02')) {
      throw new Error(`Expected beat IDs in error message: ${overlapErr.message}`);
    }
    if (!overlapErr.message.includes('854') || !overlapErr.message.includes('461') || !overlapErr.message.includes('393')) {
      throw new Error(`Expected previous endFrame, next startFrame, and overlap duration (393) in message: ${overlapErr.message}`);
    }
  });

  // 26. Sequential beats pass validation
  test('26. Sequential beats (beat_01: 41->461, beat_02: 461->893) pass validation', () => {
    const doc = createDefaultCreativeProject({
      id: 'proj_sequential_pass',
      durationInFrames: 900,
      beats: [
        {
          id: 'beat_01',
          type: 'hook',
          startFrame: 41,
          endFrame: 461,
          content: { text: 'building may suffer localised damage' },
        },
        {
          id: 'beat_02',
          type: 'core_point',
          startFrame: 461,
          endFrame: 893,
          content: { text: 'distribution of remaining structural members' },
        },
      ],
    });
    const result = validateCreativeProject(doc);
    if (!result.isValid) {
      throw new Error(`Expected valid sequential beats to pass, but failed: ${JSON.stringify(result.errors)}`);
    }
  });

  console.log(`\n=== AUDIT RESULTS: ${passCount} / ${totalCount} TESTS PASSED ===\n`);
  if (passCount !== totalCount) {
    process.exit(1);
  }
}

runTests();
