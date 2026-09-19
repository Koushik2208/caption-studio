import path from 'node:path';
import fs from 'node:fs';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

async function runVerification() {
  console.log('--- Starting Video Motion Effects Verification ---');
  const outputDir = path.resolve('tmp', 'motion-test-renders');
  fs.mkdirSync(outputDir, { recursive: true });

  const entryPoint = path.resolve('src/remotion/index.ts');
  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (config) => ({
      ...config,
      resolve: {
        ...config.resolve,
        extensionAlias: {
          '.js': ['.ts', '.tsx', '.js'],
          ...(config.resolve?.extensionAlias || {}),
        },
      },
    }),
  });

  const testCaptions = [
    { startMs: 0, endMs: 3000, text: 'CINEMATIC MOTION PRIMITIVES', timestampMs: 0, confidence: 1 },
  ];

  const testCases: {
    name: string;
    frame: number;
    inputProps: any;
  }[] = [
    // 1. Static (frames 0, 45, 90)
    {
      name: '01_motion_static_f0',
      frame: 0,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'static' },
      },
    },
    {
      name: '02_motion_static_f45',
      frame: 45,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'static' },
      },
    },
    {
      name: '03_motion_static_f90',
      frame: 90,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'static' },
      },
    },

    // 2. Zoom In (frames 0, 45, 90)
    {
      name: '04_motion_zoom_in_f0',
      frame: 0,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'zoom-in', intensity: 'medium' },
      },
    },
    {
      name: '05_motion_zoom_in_f45',
      frame: 45,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'zoom-in', intensity: 'medium' },
      },
    },
    {
      name: '06_motion_zoom_in_f90',
      frame: 90,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'zoom-in', intensity: 'medium' },
      },
    },

    // 3. Zoom Out (frames 0, 45, 90)
    {
      name: '07_motion_zoom_out_f0',
      frame: 0,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'zoom-out', intensity: 'medium' },
      },
    },
    {
      name: '08_motion_zoom_out_f45',
      frame: 45,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'zoom-out', intensity: 'medium' },
      },
    },
    {
      name: '09_motion_zoom_out_f90',
      frame: 90,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'zoom-out', intensity: 'medium' },
      },
    },

    // 4. Ken Burns (frames 0, 45, 90)
    {
      name: '10_motion_ken_burns_f0',
      frame: 0,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'ken-burns', direction: 'zoom-in-left', intensity: 'medium' },
      },
    },
    {
      name: '11_motion_ken_burns_f45',
      frame: 45,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'ken-burns', direction: 'zoom-in-left', intensity: 'medium' },
      },
    },
    {
      name: '12_motion_ken_burns_f90',
      frame: 90,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'ken-burns', direction: 'zoom-in-left', intensity: 'medium' },
      },
    },

    // 5. Pan (frames 0, 45, 90)
    {
      name: '13_motion_pan_f0',
      frame: 0,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'pan', direction: 'left-to-right', intensity: 'medium' },
      },
    },
    {
      name: '14_motion_pan_f45',
      frame: 45,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'pan', direction: 'left-to-right', intensity: 'medium' },
      },
    },
    {
      name: '15_motion_pan_f90',
      frame: 90,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'pan', direction: 'left-to-right', intensity: 'medium' },
      },
    },

    // 6. Sway (frames 0, 30, 60, 90)
    {
      name: '16_motion_sway_f0',
      frame: 0,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'sway', intensity: 'medium', speed: 'medium' },
      },
    },
    {
      name: '17_motion_sway_f30',
      frame: 30,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'sway', intensity: 'medium', speed: 'medium' },
      },
    },
    {
      name: '18_motion_sway_f60',
      frame: 60,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'sway', intensity: 'medium', speed: 'medium' },
      },
    },
    {
      name: '19_motion_sway_f90',
      frame: 90,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'sway', intensity: 'medium', speed: 'medium' },
      },
    },

    // 7. Layout Composability: Floating Card with Zoom In
    {
      name: '20_layout_card_with_zoom_in',
      frame: 60,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'zoom-in', intensity: 'medium' },
        frameSettings: {
          layout: 'floating-card',
          cardMode: 'custom',
          customScale: 0.85,
          customAspectRatio: '9:16',
          customBorderRadius: 32,
          customBorderEnabled: true,
          customBorderWidth: 4,
          customBorderColor: '#3b82f6',
          customShadowEnabled: true,
        },
      },
    },

    // 8. Layout Composability: Full Bleed with Pan
    {
      name: '21_layout_full_bleed_with_pan',
      frame: 60,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'pan', direction: 'left-to-right', intensity: 'heavy' },
        frameSettings: {
          layout: 'full-bleed',
        },
      },
    },

    // 9. Layout Composability: Top-Bottom Split with Ken Burns
    {
      name: '22_layout_top_bottom_split_with_ken_burns',
      frame: 60,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'ken-burns', direction: 'zoom-in-center', intensity: 'medium' },
        frameSettings: {
          layout: 'top-bottom-split',
          splitGap: 12,
          splitTopFocalY: 0.2,
          splitBottomFocalY: 0.8,
        },
      },
    },

    // 10. Layout Composability: Left-Right Split with Sway
    {
      name: '23_layout_left_right_split_with_sway',
      frame: 60,
      inputProps: {
        captions: testCaptions,
        videoMotion: { type: 'sway', intensity: 'medium', speed: 'fast' },
        frameSettings: {
          layout: 'left-right-split',
          splitGap: 8,
        },
      },
    },
  ];

  for (const tc of testCases) {
    console.log(`Testing case: ${tc.name} at frame ${tc.frame}...`);
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'CaptionExport',
      inputProps: tc.inputProps,
    });

    const outputLocation = path.join(outputDir, `${tc.name}.png`);

    await renderStill({
      composition,
      serveUrl: bundleLocation,
      output: outputLocation,
      frame: tc.frame,
      inputProps: tc.inputProps,
    });

    const stats = fs.statSync(outputLocation);
    if (stats.size > 0) {
      console.log(`✓ ${tc.name}.png rendered successfully (${stats.size} bytes)`);
    } else {
      throw new Error(`Rendered file ${tc.name}.png is empty`);
    }
  }

  console.log('--- ALL VIDEO MOTION VERIFICATION TESTS PASSED SUCCESSFULLY ---');
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
