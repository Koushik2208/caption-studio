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
