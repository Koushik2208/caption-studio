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
