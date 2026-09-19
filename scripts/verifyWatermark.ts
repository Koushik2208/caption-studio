import {
  validateCreativeProject,
  createDefaultCreativeProject,
  convertCreativeProjectToProjectState,
  convertProjectStateToCreativeProject,
  serializeCreativeProject,
  parseCreativeProject,
  resolveCreativeProjectWatermark,
  normalizeWatermarkPosition,
} from '../src/creative/index.js';
import type { WatermarkPosition } from '../src/overlay/types.js';

function runTests() {
  console.log('=== STARTING USER-UPLOADED WATERMARK VERIFICATION SUITE ===\n');
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
      process.exitCode = 1;
    }
  }

  // 1. Default watermark disabled
  test('1. Default watermark disabled', () => {
    const doc = createDefaultCreativeProject({ id: 'test_default', name: 'Default Watermark Test' });
    const res = validateCreativeProject(doc);
    if (!res.isValid) throw new Error(`Validation failed: ${res.errors.map((e) => e.message).join(', ')}`);
    if (doc.globalSettings.overlay.watermarkEnabled !== false) {
      throw new Error(`Expected watermarkEnabled to default to false, got ${doc.globalSettings.overlay.watermarkEnabled}`);
    }
    if (doc.globalSettings.overlay.watermark?.enabled !== false) {
      throw new Error(`Expected watermark.enabled to default to false, got ${doc.globalSettings.overlay.watermark?.enabled}`);
    }
  });

  // 2. Upload/reference is stored correctly in assets and overlay
  test('2. Upload/reference is stored correctly', () => {
    const doc = createDefaultCreativeProject({
      id: 'test_upload',
      name: 'Upload Test',
      globalSettings: {
        ...createDefaultCreativeProject().globalSettings,
        overlay: {
          watermarkEnabled: true,
          watermarkOpacity: 70,
          watermarkPosition: 'bottom-right',
          watermarkSize: 15,
          watermarkAssetId: 'watermark_01',
          watermarkFilename: 'brand-logo.png',
          watermark: {
            enabled: true,
            assetId: 'watermark_01',
            position: 'bottom-right',
            size: 0.15,
            opacity: 0.7,
          },
          progressBarEnabled: false,
          progressBarColor: '#3b82f6',
          progressBarPosition: 'bottom',
        },
      },
      assets: {
        media: [
          { id: 'watermark_01', type: 'image', name: 'brand-logo.png' },
        ],
        transitions: [],
        sfx: [],
      },
    });

    const res = validateCreativeProject(doc);
    if (!res.isValid) throw new Error(`Validation failed: ${res.errors.map((e) => e.message).join(', ')}`);
    if (!doc.assets?.media?.some((m) => m.id === 'watermark_01' && m.type === 'image')) {
      throw new Error('Watermark asset was not stored in assets.media');
    }
  });

  // 3. All supported positions validate
  test('3. All supported positions validate', () => {
    const allPositions: WatermarkPosition[] = [
      'top-left',
      'top-center',
      'top-right',
      'center-left',
      'center',
      'center-right',
      'bottom-left',
      'bottom-center',
      'bottom-right',
      'tl',
      'tr',
      'bl',
      'br',
      'tc',
      'cl',
      'c',
      'cr',
      'bc',
    ];

    for (const pos of allPositions) {
      const doc = createDefaultCreativeProject({ id: `test_pos_${pos}`, name: `Pos Test ${pos}` });
      doc.globalSettings.overlay = {
        ...doc.globalSettings.overlay,
        watermarkEnabled: true,
        watermarkPosition: pos,
      };
      const res = validateCreativeProject(doc);
      if (!res.isValid) {
        throw new Error(`Position '${pos}' failed validation: ${res.errors.map((e: { message: string }) => e.message).join(', ')}`);
      }
      const normalized = normalizeWatermarkPosition(pos);
      if (!normalized) {
        throw new Error(`Position '${pos}' failed to normalize`);
      }
    }
  });

  // 4. Invalid position is rejected
  test('4. Invalid position is rejected', () => {
    const doc = createDefaultCreativeProject({ id: 'test_invalid_pos', name: 'Invalid Pos Test' });
    doc.globalSettings.overlay = {
      ...doc.globalSettings.overlay,
      watermarkEnabled: true,
      watermarkPosition: 'outer-space' as any,
    };
    const res = validateCreativeProject(doc);
    if (res.isValid) throw new Error('Expected invalid position to be rejected');
    if (!res.errors.some((e: { code: string }) => e.code === 'UNSUPPORTED_WATERMARK_POSITION')) {
      throw new Error(`Expected UNSUPPORTED_WATERMARK_POSITION error code, got: ${JSON.stringify(res.errors)}`);
    }
  });

  // 5. Opacity range validation works
  test('5. Opacity range validation works', () => {
    // Valid 0.7
    const doc1 = createDefaultCreativeProject({ id: 'test_op_1', name: 'Opacity Test' });
    doc1.globalSettings.overlay = { ...doc1.globalSettings.overlay, watermarkOpacity: 0.7 };
    const res1 = validateCreativeProject(doc1);
    if (!res1.isValid) throw new Error('Valid opacity 0.7 failed');

    // Valid 70%
    const doc2 = createDefaultCreativeProject({ id: 'test_op_2', name: 'Opacity Test 2' });
    doc2.globalSettings.overlay = { ...doc2.globalSettings.overlay, watermarkOpacity: 70 };
    const res2 = validateCreativeProject(doc2);
    if (!res2.isValid) throw new Error('Valid opacity 70 failed');

    // Invalid < 0
    const doc3 = createDefaultCreativeProject({ id: 'test_op_3', name: 'Opacity Test 3' });
    doc3.globalSettings.overlay = { ...doc3.globalSettings.overlay, watermarkOpacity: -0.5 };
    const res3 = validateCreativeProject(doc3);
    if (res3.isValid) throw new Error('Invalid negative opacity passed');

    // Invalid > 100
    const doc4 = createDefaultCreativeProject({ id: 'test_op_4', name: 'Opacity Test 4' });
    doc4.globalSettings.overlay = { ...doc4.globalSettings.overlay, watermarkOpacity: 150 };
    const res4 = validateCreativeProject(doc4);
    if (res4.isValid) throw new Error('Invalid opacity > 100 passed');
  });

  // 6. Size validation works
  test('6. Size validation works', () => {
    // Valid 0.15
    const doc1 = createDefaultCreativeProject({ id: 'test_size_1', name: 'Size Test 1' });
    doc1.globalSettings.overlay = { ...doc1.globalSettings.overlay, watermarkSize: 0.15 };
    const res1 = validateCreativeProject(doc1);
    if (!res1.isValid) throw new Error('Valid size 0.15 failed');

    // Valid 15%
    const doc2 = createDefaultCreativeProject({ id: 'test_size_2', name: 'Size Test 2' });
    doc2.globalSettings.overlay = { ...doc2.globalSettings.overlay, watermarkSize: 15 };
    const res2 = validateCreativeProject(doc2);
    if (!res2.isValid) throw new Error('Valid size 15 failed');

    // Invalid 0 or negative
    const doc3 = createDefaultCreativeProject({ id: 'test_size_3', name: 'Size Test 3' });
    doc3.globalSettings.overlay = { ...doc3.globalSettings.overlay, watermarkSize: 0 };
    const res3 = validateCreativeProject(doc3);
    if (res3.isValid) throw new Error('Invalid size 0 passed');

    // Invalid > 100
    const doc4 = createDefaultCreativeProject({ id: 'test_size_4', name: 'Size Test 4' });
    doc4.globalSettings.overlay = { ...doc4.globalSettings.overlay, watermarkSize: 200 };
    const res4 = validateCreativeProject(doc4);
    if (res4.isValid) throw new Error('Invalid size > 100 passed');
  });

  // 7. Watermark survives project persistence
  test('7. Watermark survives project persistence', () => {
    const inputState = {
      projectId: 'proj_roundtrip',
      projectName: 'Roundtrip Watermark Project',
      presetName: 'Viral Hook' as const,
      animation: 'signature' as const,
      keywordHighlightEnabled: true,
      highlightIntensity: 0.5,
      highlightColor: '#0066ff',
      keywords: [],
      position: 'center' as const,
      captionPositionY: 0.5,
      textAlign: 'center' as const,
      fontSizeMultiplier: 1.0,
      textColor: '#ffffff',
      fontWeight: 700,
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
      textTransform: 'none' as const,
      backdropEnabled: false,
      backdropColor: '#000000',
      backdropOpacity: 60,
      backdropRadius: 8,
      backdropPaddingX: 16,
      backdropPaddingY: 8,
      wordOverrides: {},
      watermarkEnabled: true,
      watermarkOpacity: 80,
      watermarkPosition: 'top-left' as const,
      watermarkSize: 20,
      watermarkAssetId: 'watermark_01',
      watermarkFilename: 'my-logo.png',
      progressBarEnabled: true,
      progressBarColor: '#0066ff',
      progressBarPosition: 'bottom' as const,
      frameVariant: 'none' as const,
      frameBgColor: '#000000',
      bezelRadiusMultiplier: 1,
      layout: 'full-bleed' as const,
      cardMode: 'preset' as const,
      customScale: 0.85,
      customAspectRatio: '9:16' as const,
      customPositionY: 0.5,
      customBorderRadius: 24,
      customBorderEnabled: false,
      customBorderWidth: 2,
      customBorderColor: '#ffffff',
      customBorderStyle: 'solid' as const,
      customShadowEnabled: false,
      customShadowBlur: 24,
      customShadowOpacity: 40,
      customBackdrop: 'none' as const,
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
      halationIntensity: 'medium' as const,
      gridEnabled: false,
      gridIntensity: 'medium' as const,
      crtScanlinesEnabled: false,
      crtScanlinesIntensity: 'medium' as const,
      halftoneEnabled: false,
      halftoneIntensity: 'medium' as const,
      lightLeakEnabled: false,
      lightLeakIntensity: 'medium' as const,
      chromaticAberrationEnabled: false,
      chromaticAberrationIntensity: 'medium' as const,
      filmGrainEnabled: false,
      filmGrainIntensity: 'medium' as const,
      audioPulseEnabled: false,
      audioPulseIntensity: 'medium' as const,
      keywordPunchEnabled: false,
      keywordPunchIntensity: 'medium' as const,
      codeBlockEnabled: false,
      codeBlockCode: '',
      codeBlockLanguage: 'js' as const,
      codeBlockPosition: 'center' as const,
      codeBlockLinesPerPage: 10,
      numberCounterEnabled: false,
      numberCounterStart: 0,
      numberCounterEnd: 100,
      numberCounterPrefix: '',
      numberCounterSuffix: '',
      tickerEnabled: false,
      tickerText: '',
      tickerDirection: 'left' as const,
      tickerPosition: 'bottom' as const,
      videoMotion: { type: 'static' as const, intensity: 'medium' as const },
      transitionOverlays: [],
      soundEffects: [],
      captions: [],
    };

    const creativeProject = convertProjectStateToCreativeProject(inputState);
    const convertedBack = convertCreativeProjectToProjectState(creativeProject);

    if (convertedBack.overlaySettings.watermarkEnabled !== true) {
      throw new Error('watermarkEnabled lost during roundtrip');
    }
    if (convertedBack.overlaySettings.watermarkPosition !== 'top-left') {
      throw new Error(`watermarkPosition lost during roundtrip: expected 'top-left', got '${convertedBack.overlaySettings.watermarkPosition}'`);
    }
    if (convertedBack.overlaySettings.watermarkOpacity !== 80) {
      throw new Error(`watermarkOpacity lost during roundtrip: expected 80, got ${convertedBack.overlaySettings.watermarkOpacity}`);
    }
    if (convertedBack.overlaySettings.watermarkSize !== 20) {
      throw new Error(`watermarkSize lost during roundtrip: expected 20, got ${convertedBack.overlaySettings.watermarkSize}`);
    }
    if (convertedBack.overlaySettings.watermarkFilename !== 'my-logo.png') {
      throw new Error(`watermarkFilename lost during roundtrip: expected 'my-logo.png', got '${convertedBack.overlaySettings.watermarkFilename}'`);
    }
  });

  // 8. Creative JSON serialization works
  test('8. Creative JSON serialization works', () => {
    const doc = createDefaultCreativeProject({
      id: 'test_serialization',
      name: 'Serialization Test',
      globalSettings: {
        ...createDefaultCreativeProject().globalSettings,
        overlay: {
          watermarkEnabled: true,
          watermarkOpacity: 70,
          watermarkPosition: 'bottom-right',
          watermarkSize: 15,
          watermarkAssetId: 'watermark_01',
          watermarkFilename: 'brand.png',
          watermark: {
            enabled: true,
            assetId: 'watermark_01',
            position: 'bottom-right',
            size: 0.15,
            opacity: 0.7,
          },
          progressBarEnabled: false,
          progressBarColor: '#3b82f6',
          progressBarPosition: 'bottom',
        },
      },
      assets: {
        media: [
          { id: 'watermark_01', type: 'image', name: 'brand.png' },
        ],
        transitions: [],
        sfx: [],
      },
    });

    const jsonStr = serializeCreativeProject(doc);
    if (typeof jsonStr !== 'string' || !jsonStr.includes('watermark_01')) {
      throw new Error('Serialization failed or omitted watermark asset reference');
    }
    const parsed = parseCreativeProject(jsonStr);
    if (!parsed.isValid || !parsed.data) {
      throw new Error(`Parsed serialized JSON failed validation: ${parsed.errors.map((e: { message: string }) => e.message).join(', ')}`);
    }
  });

  // 9. Creative JSON import works when asset is available
  test('9. Creative JSON import works when asset is available', () => {
    const doc = createDefaultCreativeProject({
      id: 'test_available_asset',
      name: 'Available Asset Test',
      globalSettings: {
        ...createDefaultCreativeProject().globalSettings,
        overlay: {
          watermarkEnabled: true,
          watermarkOpacity: 70,
          watermarkPosition: 'top-right',
          watermarkSize: 12,
          watermarkAssetId: 'watermark_01',
          watermarkFilename: 'brand.png',
          watermark: {
            enabled: true,
            assetId: 'watermark_01',
            position: 'top-right',
            size: 0.12,
            opacity: 0.7,
          },
          progressBarEnabled: false,
          progressBarColor: '#3b82f6',
          progressBarPosition: 'bottom',
        },
      },
      assets: {
        media: [
          { id: 'watermark_01', type: 'image', name: 'brand.png' },
        ],
        transitions: [],
        sfx: [],
      },
    });

    const resolution = resolveCreativeProjectWatermark(doc, { id: 'watermark_01', name: 'brand.png' });
    if (resolution.status !== 'resolved') {
      throw new Error(`Expected resolution status 'resolved', got '${resolution.status}'`);
    }
  });

  // 10. Missing watermark asset produces a safe warning without crashing
  test('10. Missing watermark asset produces a safe warning', () => {
    const doc = createDefaultCreativeProject({
      id: 'test_missing_asset',
      name: 'Missing Asset Test',
      globalSettings: {
        ...createDefaultCreativeProject().globalSettings,
        overlay: {
          watermarkEnabled: true,
          watermarkOpacity: 70,
          watermarkPosition: 'bottom-left',
          watermarkSize: 15,
          watermarkAssetId: 'watermark_remote_99',
          watermarkFilename: 'remote-logo.png',
          watermark: {
            enabled: true,
            assetId: 'watermark_remote_99',
            position: 'bottom-left',
            size: 0.15,
            opacity: 0.7,
          },
          progressBarEnabled: false,
          progressBarColor: '#3b82f6',
          progressBarPosition: 'bottom',
        },
      },
      assets: {
        media: [
          { id: 'watermark_remote_99', type: 'image', name: 'remote-logo.png' },
        ],
        transitions: [],
        sfx: [],
      },
    });

    // No local watermark in workspace
    const resolution = resolveCreativeProjectWatermark(doc, null);
    if (resolution.status !== 'missing') {
      throw new Error(`Expected resolution status 'missing', got '${resolution.status}'`);
    }
    if (!resolution.warning || !resolution.warning.includes('remote-logo.png')) {
      throw new Error(`Expected informative warning referencing 'remote-logo.png', got '${resolution.warning}'`);
    }

    // Document itself remains 100% valid
    const validation = validateCreativeProject(doc);
    if (!validation.isValid) {
      throw new Error(`Missing workspace asset should not invalidate project document: ${validation.errors.map((e: { message: string }) => e.message).join(', ')}`);
    }
  });

  // 11. Legacy Creative JSON documents without watermark settings continue working
  test('11. Legacy Creative JSON documents continue working', () => {
    const doc = createDefaultCreativeProject({ id: 'test_legacy', name: 'Legacy Document' });
    delete (doc.globalSettings.overlay as any).watermark;
    delete (doc.globalSettings.overlay as any).watermarkSize;
    delete (doc.globalSettings.overlay as any).watermarkAssetId;
    delete (doc.globalSettings.overlay as any).watermarkFilename;

    const res = validateCreativeProject(doc);
    if (!res.isValid) {
      throw new Error(`Legacy document failed validation: ${res.errors.map((e: { message: string }) => e.message).join(', ')}`);
    }

    const state = convertCreativeProjectToProjectState(doc);
    if (state.overlaySettings.watermarkPosition !== 'bottom-right' && state.overlaySettings.watermarkPosition !== 'tr') {
      throw new Error('Legacy document failed to convert to project state');
    }
  });

  // 12. Beat-level visual overlay override validates cleanly
  test('12. Beat-level visual overlay override validates', () => {
    const doc = createDefaultCreativeProject({
      id: 'test_beat_overlay',
      name: 'Beat Overlay Test',
      beats: [
        {
          id: 'beat_01',
          type: 'hook',
          startFrame: 0,
          endFrame: 150,
          content: { text: 'Hook Beat' },
          visual: {
            overlay: {
              watermarkEnabled: false,
              watermarkPosition: 'top-left',
              watermarkOpacity: 50,
            },
          },
        },
      ],
    });

    const res = validateCreativeProject(doc);
    if (!res.isValid) {
      throw new Error(`Beat visual overlay failed validation: ${res.errors.map((e: { message: string }) => e.message).join(', ')}`);
    }
  });

  console.log(`\n==================================================`);
  console.log(`WATERMARK RESULTS: ${passCount} / ${totalCount} tests passed`);
  console.log(`==================================================\n`);

  if (passCount !== totalCount) {
    process.exit(1);
  }
}

runTests();
