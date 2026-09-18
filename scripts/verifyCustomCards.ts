import path from 'node:path';
import fs from 'node:fs';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

async function runVerification() {
  console.log('--- Starting V4 Phase 1 Custom Video Card Verification ---');
  const outputDir = path.resolve('tmp', 'test-renders');
  fs.mkdirSync(outputDir, { recursive: true });

  const entryPoint = path.resolve('src/remotion/index.ts');
  console.log('Bundling Remotion entry point...');
  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });

  const testCaptions = [
    { startMs: 0, endMs: 2000, text: 'CREATING HOOKS THAT CONVERT', timestampMs: 0, confidence: 1 },
  ];

  const testCases = [
    {
      name: '1_custom_9_16_gradient_shadow_rounded',
      inputProps: {
        captions: testCaptions,
        frameSettings: {
          variant: 'none',
          bgColor: '#000000',
          bezelRadiusMultiplier: 1,
          cardMode: 'custom',
          customScale: 0.85,
          customAspectRatio: '9:16',
          customPositionY: 0.5,
          customBorderRadius: 40,
          customBorderEnabled: true,
          customBorderWidth: 4,
          customBorderColor: '#00d4ff',
          customBorderStyle: 'solid',
          customShadowEnabled: true,
          customShadowBlur: 32,
          customShadowOpacity: 60,
          customBackdrop: 'gradient',
          customBackdropGradient: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)',
        },
      },
    },
    {
      name: '2_custom_1_1_square_solid_border',
      inputProps: {
        captions: testCaptions,
        frameSettings: {
          variant: 'none',
          bgColor: '#000000',
          bezelRadiusMultiplier: 1,
          cardMode: 'custom',
          customScale: 0.88,
          customAspectRatio: '1:1',
          customPositionY: 0.5,
          customBorderRadius: 28,
          customBorderEnabled: true,
          customBorderWidth: 6,
          customBorderColor: '#ffffff',
          customBorderStyle: 'solid',
          customShadowEnabled: true,
          customShadowBlur: 24,
          customShadowOpacity: 50,
          customBackdrop: 'solid',
          customBackdropColor: '#121214',
        },
      },
    },
    {
      name: '3_custom_16_9_wide_dashed',
      inputProps: {
        captions: testCaptions,
        frameSettings: {
          variant: 'none',
          bgColor: '#000000',
          bezelRadiusMultiplier: 1,
          cardMode: 'custom',
          customScale: 0.92,
          customAspectRatio: '16:9',
          customPositionY: 0.5,
          customBorderRadius: 20,
          customBorderEnabled: true,
          customBorderWidth: 3,
          customBorderColor: '#fbbf24',
          customBorderStyle: 'dashed',
          customShadowEnabled: true,
          customShadowBlur: 20,
          customShadowOpacity: 40,
          customBackdrop: 'solid',
          customBackdropColor: '#0f172a',
        },
      },
    },
    {
      name: '4_preset_minimal_bezel_backward_compat',
      inputProps: {
        captions: testCaptions,
        frameSettings: {
          variant: 'minimalBezel',
          bgColor: '#000000',
          bezelRadiusMultiplier: 1,
          cardMode: 'preset',
        },
      },
    },
    {
      name: '5_preset_neon_glow_backward_compat',
      inputProps: {
        captions: testCaptions,
        frameSettings: {
          variant: 'neonGlow',
          bgColor: '#000000',
          bezelRadiusMultiplier: 1,
          cardMode: 'preset',
        },
      },
    },
    {
      name: '6_full_bleed_layout',
      inputProps: {
        captions: testCaptions,
        frameSettings: {
          layout: 'full-bleed',
          variant: 'none',
          bgColor: '#000000',
          bezelRadiusMultiplier: 1,
        },
      },
    },
    {
      name: '7_top_bottom_split_layout',
      inputProps: {
        captions: testCaptions,
        frameSettings: {
          layout: 'top-bottom-split',
          variant: 'none',
          bgColor: '#000000',
          bezelRadiusMultiplier: 1,
          customBorderRadius: 24,
          customBorderEnabled: true,
          customBorderWidth: 3,
          customBorderColor: '#ffffff',
          customBorderStyle: 'solid',
          customShadowEnabled: true,
          customShadowBlur: 24,
          customShadowOpacity: 50,
          customBackdrop: 'gradient',
          customBackdropGradient: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)',
        },
      },
    },
    {
      name: '8_caption_top_legacy_placement',
      inputProps: {
        captions: testCaptions,
        styleOverrides: {
          position: 'top',
        },
      },
    },
    {
      name: '9_caption_split_center_in_top_bottom_split',
      inputProps: {
        captions: testCaptions,
        styleOverrides: {
          position: 'split-center',
          customPositionY: 0.50,
          textAlign: 'center',
        },
        frameSettings: {
          layout: 'top-bottom-split',
          variant: 'none',
          bgColor: '#000000',
          bezelRadiusMultiplier: 1,
          customBackdrop: 'solid',
          customBackdropColor: '#121214',
        },
      },
    },
    {
      name: '10_caption_left_aligned_slider_position',
      inputProps: {
        captions: testCaptions,
        styleOverrides: {
          customPositionY: 0.35,
          textAlign: 'left',
          textColor: '#00d4ff',
        },
      },
    },
    {
      name: '11_caption_right_aligned_bottom',
      inputProps: {
        captions: testCaptions,
        styleOverrides: {
          customPositionY: 0.85,
          textAlign: 'right',
          textColor: '#ffd23f',
        },
      },
    },
    {
      name: '12_left_right_split_layout',
      inputProps: {
        captions: testCaptions,
        frameSettings: {
          layout: 'left-right-split',
          variant: 'none',
          bgColor: '#000000',
          bezelRadiusMultiplier: 1,
          customBorderRadius: 28,
          customBorderEnabled: true,
          customBorderWidth: 3,
          customBorderColor: '#00d4ff',
          customBorderStyle: 'solid',
          customShadowEnabled: true,
          customShadowBlur: 28,
          customShadowOpacity: 55,
          customBackdrop: 'gradient',
          customBackdropGradient: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)',
        },
      },
    },
    {
      name: '13_left_right_split_center_caption',
      inputProps: {
        captions: testCaptions,
        styleOverrides: {
          customPositionY: 0.50,
          textAlign: 'center',
          textColor: '#ffffff',
          glowEnabled: true,
          glowColor: '#00d4ff',
        },
        frameSettings: {
          layout: 'left-right-split',
          variant: 'none',
          bgColor: '#000000',
          bezelRadiusMultiplier: 1,
          customBackdrop: 'solid',
          customBackdropColor: '#121214',
          customBorderRadius: 20,
          customBorderEnabled: true,
          customBorderWidth: 2,
          customBorderColor: '#ffffff',
          customBorderStyle: 'solid',
        },
      },
    },
    {
      name: '14_left_right_split_bottom_caption',
      inputProps: {
        captions: testCaptions,
        styleOverrides: {
          customPositionY: 0.88,
          textAlign: 'center',
          textColor: '#ffd23f',
        },
        frameSettings: {
          layout: 'left-right-split',
          variant: 'none',
          bgColor: '#000000',
          bezelRadiusMultiplier: 1,
          customBackdrop: 'solid',
          customBackdropColor: '#0f172a',
        },
      },
    },
    {
      name: '15_top_bottom_split_0px_gap',
      inputProps: {
        captions: testCaptions,
        frameSettings: {
          layout: 'top-bottom-split',
          variant: 'none',
          bgColor: '#000000',
          bezelRadiusMultiplier: 1,
          splitGap: 0,
          customBorderRadius: 0,
          customBorderEnabled: false,
          customBackdrop: 'solid',
          customBackdropColor: '#000000',
        },
      },
    },
    {
      name: '16_top_bottom_split_focal_position',
      inputProps: {
        captions: testCaptions,
        frameSettings: {
          layout: 'top-bottom-split',
          variant: 'none',
          bgColor: '#000000',
          bezelRadiusMultiplier: 1,
          splitGap: 24,
          splitTopFocalX: 0.5,
          splitTopFocalY: 0.10,
          splitBottomFocalX: 0.5,
          splitBottomFocalY: 0.90,
          customBorderRadius: 24,
          customBorderEnabled: true,
          customBorderWidth: 3,
          customBorderColor: '#00d4ff',
          customBorderStyle: 'solid',
          customBackdrop: 'gradient',
          customBackdropGradient: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)',
        },
      },
    },
    {
      name: '17_left_right_split_0px_gap',
      inputProps: {
        captions: testCaptions,
        frameSettings: {
          layout: 'left-right-split',
          variant: 'none',
          bgColor: '#000000',
          bezelRadiusMultiplier: 1,
          splitGap: 0,
          customBorderRadius: 0,
          customBorderEnabled: false,
          customBackdrop: 'solid',
          customBackdropColor: '#000000',
        },
      },
    },
    {
      name: '18_left_right_split_focal_position',
      inputProps: {
        captions: testCaptions,
        frameSettings: {
          layout: 'left-right-split',
          variant: 'none',
          bgColor: '#000000',
          bezelRadiusMultiplier: 1,
          splitGap: 20,
          splitLeftFocalX: 0.10,
          splitLeftFocalY: 0.5,
          splitRightFocalX: 0.90,
          splitRightFocalY: 0.5,
          customBorderRadius: 20,
          customBorderEnabled: true,
          customBorderWidth: 2,
          customBorderColor: '#fbbf24',
          customBorderStyle: 'solid',
          customBackdrop: 'solid',
          customBackdropColor: '#121214',
        },
      },
    },
    // --- New Reel-Craft Cherry-Pick Verifications ---
    {
      name: '19_street_split_reveal_basic',
      inputProps: {
        captions: testCaptions,
        styleVariant: 'splitReveal',
        styleOverrides: {
          textColor: '#ffffff',
          highlightColor: '#ffd23f',
        },
      },
    },
    {
      name: '20_street_word_font_pairing',
      inputProps: {
        captions: testCaptions,
        styleVariant: 'splitReveal',
        styleOverrides: {
          textColor: '#ffffff',
          wordOverrides: {
            '0-1': { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#ff3d9a' },
            '0-2': { fontWeight: 900, fontSize: 1.3, color: '#00d4ff' },
          },
        },
      },
    },
    {
      name: '21_street_word_color_gradient',
      inputProps: {
        captions: testCaptions,
        styleVariant: 'splitReveal',
        styleOverrides: {
          gradientEnabled: true,
          gradientStart: '#FF3D9A',
          gradientEnd: '#00D4FF',
          gradientAngle: 90,
        },
      },
    },
    {
      name: '22_street_scale_hierarchy',
      inputProps: {
        captions: testCaptions,
        styleVariant: 'splitReveal',
        styleOverrides: {
          fontSizeMultiplier: 1.2,
          wordOverrides: {
            '0-0': { fontSize: 1.4, color: '#ffd23f' },
          },
        },
      },
    },
    {
      name: '23_word_stamp_kinetic',
      inputProps: {
        captions: testCaptions,
        styleVariant: 'wordStamp',
        styleOverrides: {
          textColor: '#ffffff',
          highlightColor: '#00d4ff',
          glowEnabled: true,
          glowColor: '#0066ff',
        },
      },
    },
    {
      name: '24_blur_resolve_cinematic',
      inputProps: {
        captions: testCaptions,
        styleVariant: 'blurResolve',
        styleOverrides: {
          textColor: '#f8fafc',
          highlightColor: '#10b981',
        },
      },
    },
    {
      name: '25_sentence_block_backplate',
      inputProps: {
        captions: testCaptions,
        styleVariant: 'sentenceBlock',
        styleOverrides: {
          highlightColor: '#ffffff',
          textColor: '#ffffff',
        },
      },
    },
    {
      name: '26_caption_backdrop_disabled',
      inputProps: {
        captions: testCaptions,
        styleVariant: 'signature',
        styleOverrides: {
          backdropEnabled: false,
        },
      },
    },
    {
      name: '27_caption_backdrop_enabled',
      inputProps: {
        captions: testCaptions,
        styleVariant: 'signature',
        styleOverrides: {
          backdropEnabled: true,
          backdropColor: '#000000',
          backdropOpacity: 65,
          backdropRadius: 10,
          backdropPaddingX: 16,
          backdropPaddingY: 8,
          textColor: '#ffffff',
          highlightColor: '#ffd23f',
        },
      },
    },
    {
      name: '28_caption_backdrop_multiline',
      inputProps: {
        captions: [
          { startMs: 0, endMs: 2000, text: 'CREATING HIGH IMPACT HOOKS THAT ENGAGE AND CONVERT', timestampMs: 0, confidence: 1 },
        ],
        styleVariant: 'signature',
        styleOverrides: {
          backdropEnabled: true,
          backdropColor: '#1e1b4b',
          backdropOpacity: 80,
          backdropRadius: 8,
          backdropPaddingX: 14,
          backdropPaddingY: 6,
        },
      },
    },
    {
      name: '29_caption_backdrop_mixed_word_typography',
      inputProps: {
        captions: testCaptions,
        styleVariant: 'signature',
        styleOverrides: {
          backdropEnabled: true,
          backdropColor: '#000000',
          backdropOpacity: 70,
          wordOverrides: {
            '0-1': { fontFamily: 'Georgia, serif', color: '#ffd23f', fontSize: 1.25 },
          },
        },
      },
    },
    {
      name: '30_terminal_frame_basic',
      inputProps: {
        captions: testCaptions,
        frameSettings: {
          variant: 'terminal',
          bgColor: '#000000',
          bezelRadiusMultiplier: 1,
        },
      },
    },
    {
      name: '31_terminal_frame_with_captions',
      inputProps: {
        captions: testCaptions,
        styleVariant: 'splitReveal',
        styleOverrides: {
          textColor: '#ffffff',
          highlightColor: '#007acc',
        },
        frameSettings: {
          variant: 'terminal',
          bgColor: '#000000',
          bezelRadiusMultiplier: 1,
        },
      },
    },
    {
      name: '32_terminal_frame_with_effects',
      inputProps: {
        captions: testCaptions,
        styleVariant: 'wordStamp',
        frameSettings: {
          variant: 'terminal',
          bgColor: '#000000',
          bezelRadiusMultiplier: 1,
        },
        textureSettings: {
          crtScanlinesEnabled: true,
          crtScanlinesIntensity: 'medium',
          halationEnabled: true,
          halationIntensity: 'medium',
        },
      },
    },
  ];

  for (const tc of testCases) {
    console.log(`Testing case: ${tc.name}...`);
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'CaptionExport',
      inputProps: tc.inputProps,
    });

    const outputLocation = path.resolve(outputDir, `${tc.name}.png`);
    await renderStill({
      composition,
      serveUrl: bundleLocation,
      output: outputLocation,
      inputProps: tc.inputProps,
      frame: 15,
    });

    if (fs.existsSync(outputLocation)) {
      const stats = fs.statSync(outputLocation);
      console.log(`✓ ${tc.name}.png rendered successfully (${stats.size} bytes)`);
    } else {
      throw new Error(`Failed to render ${tc.name}`);
    }
  }

  console.log('--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY ---');
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
