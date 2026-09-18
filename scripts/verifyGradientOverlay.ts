import {
  validateCreativeProject,
  createDefaultCreativeProject,
  convertCreativeProjectToProjectState,
  convertProjectStateToCreativeProject,
  resolveBeatVisualSettings,
} from '../src/creative/index.js';
import { getGradientOverlayBackground } from '../src/textures/gradientUtils.js';
import type { GradientOverlayDirection } from '../src/textures/types.js';

function runTests() {
  console.log('=== STARTING GRADIENT OVERLAY VERIFICATION SUITE ===\n');
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

  // 1. Default gradient is disabled
  test('1. Default gradient is disabled in default project', () => {
    const doc = createDefaultCreativeProject({ id: 'test_default', name: 'Default Test' });
    const res = validateCreativeProject(doc);
    if (!res.isValid) throw new Error(`Validation failed: ${res.errors.join(', ')}`);
    if (doc.globalSettings.effects?.gradientOverlayEnabled !== false) {
      throw new Error(`Expected gradientOverlayEnabled to default to false, got ${doc.globalSettings.effects?.gradientOverlayEnabled}`);
    }
  });

  // 2. Existing projects without gradient settings still validate
  test('2. Existing projects without gradient settings still validate cleanly', () => {
    const doc = createDefaultCreativeProject({ id: 'test_old', name: 'Legacy Project' });
    delete (doc.globalSettings.effects as any)?.gradientOverlayEnabled;
    delete (doc.globalSettings.effects as any)?.gradientOverlayColor;
    delete (doc.globalSettings.effects as any)?.gradientOverlayOpacity;
    delete (doc.globalSettings.effects as any)?.gradientOverlayStrength;
    delete (doc.globalSettings.effects as any)?.gradientOverlayDirection;
    const res = validateCreativeProject(doc);
    if (!res.isValid) throw new Error(`Validation failed: ${res.errors.join(', ')}`);
  });

  // 3. Bottom direction works in validation and CSS calculation
  test('3. Bottom direction works in validation and CSS generator', () => {
    const doc = createDefaultCreativeProject({ id: 'test_bottom', name: 'Bottom Test' });
    doc.globalSettings.effects = {
      ...doc.globalSettings.effects,
      gradientOverlayEnabled: true,
      gradientOverlayColor: '#000000',
      gradientOverlayOpacity: 0.65,
      gradientOverlayStrength: 0.6,
      gradientOverlayDirection: 'bottom',
    };
    const res = validateCreativeProject(doc);
    if (!res.isValid) throw new Error(`Validation failed: ${res.errors.join(', ')}`);
    const css = getGradientOverlayBackground('#000000', 0.6, 'bottom');
    if (!css.includes('to bottom')) throw new Error(`Expected 'to bottom' in CSS, got ${css}`);
  });

  // 4. Top direction works
  test('4. Top direction works in validation and CSS generator', () => {
    const doc = createDefaultCreativeProject({ id: 'test_top', name: 'Top Test' });
    doc.globalSettings.effects = {
      ...doc.globalSettings.effects,
      gradientOverlayEnabled: true,
      gradientOverlayColor: '#111827',
      gradientOverlayOpacity: 0.7,
      gradientOverlayStrength: 0.5,
      gradientOverlayDirection: 'top',
    };
    const res = validateCreativeProject(doc);
    if (!res.isValid) throw new Error(`Validation failed: ${res.errors.join(', ')}`);
    const css = getGradientOverlayBackground('#111827', 0.5, 'top');
    if (!css.includes('to top')) throw new Error(`Expected 'to top' in CSS, got ${css}`);
  });

  // 5. Left direction works
  test('5. Left direction works in validation and CSS generator', () => {
    const doc = createDefaultCreativeProject({ id: 'test_left', name: 'Left Test' });
    doc.globalSettings.effects = {
      ...doc.globalSettings.effects,
      gradientOverlayEnabled: true,
      gradientOverlayColor: '#000000',
      gradientOverlayOpacity: 0.5,
      gradientOverlayStrength: 0.4,
      gradientOverlayDirection: 'left',
    };
    const res = validateCreativeProject(doc);
    if (!res.isValid) throw new Error(`Validation failed: ${res.errors.join(', ')}`);
    const css = getGradientOverlayBackground('#000000', 0.4, 'left');
    if (!css.includes('to left')) throw new Error(`Expected 'to left' in CSS, got ${css}`);
  });

  // 6. Right direction works
  test('6. Right direction works in validation and CSS generator', () => {
    const doc = createDefaultCreativeProject({ id: 'test_right', name: 'Right Test' });
    doc.globalSettings.effects = {
      ...doc.globalSettings.effects,
      gradientOverlayEnabled: true,
      gradientOverlayColor: '#000000',
      gradientOverlayOpacity: 0.8,
      gradientOverlayStrength: 0.75,
      gradientOverlayDirection: 'right',
    };
    const res = validateCreativeProject(doc);
    if (!res.isValid) throw new Error(`Validation failed: ${res.errors.join(', ')}`);
    const css = getGradientOverlayBackground('#000000', 0.75, 'right');
    if (!css.includes('to right')) throw new Error(`Expected 'to right' in CSS, got ${css}`);
  });

  // 7. Four diagonal directions validate and produce correct CSS
  test('7. Four diagonal directions validate cleanly', () => {
    const diagonals: GradientOverlayDirection[] = ['bottom-left', 'bottom-right', 'top-left', 'top-right'];
    for (const dir of diagonals) {
      const doc = createDefaultCreativeProject({ id: `test_${dir}`, name: `${dir} Test` });
      doc.globalSettings.effects = {
        ...doc.globalSettings.effects,
        gradientOverlayEnabled: true,
        gradientOverlayColor: '#000000',
        gradientOverlayOpacity: 0.65,
        gradientOverlayStrength: 0.6,
        gradientOverlayDirection: dir,
      };
      const res = validateCreativeProject(doc);
      if (!res.isValid) throw new Error(`Validation failed for ${dir}: ${res.errors.join(', ')}`);
      const css = getGradientOverlayBackground('#000000', 0.6, dir);
      const expectedDir = dir.replace('-', ' ');
      if (!css.includes(`to ${expectedDir}`)) {
        throw new Error(`Expected 'to ${expectedDir}' in CSS for ${dir}, got ${css}`);
      }
    }
  });

  // 8. Invalid direction is rejected
  test('8. Invalid direction is rejected', () => {
    const doc = createDefaultCreativeProject({ id: 'test_invalid_dir', name: 'Invalid Dir' });
    doc.globalSettings.effects = {
      ...doc.globalSettings.effects,
      gradientOverlayEnabled: true,
      gradientOverlayDirection: 'radial' as any,
    };
    const res = validateCreativeProject(doc);
    if (res.isValid) throw new Error('Expected invalid direction "radial" to fail validation');
  });

  // 9. Opacity below 0 is rejected
  test('9. Opacity below 0 is rejected', () => {
    const doc = createDefaultCreativeProject({ id: 'test_opacity_neg', name: 'Neg Opacity' });
    doc.globalSettings.effects = {
      ...doc.globalSettings.effects,
      gradientOverlayOpacity: -0.1,
    };
    const res = validateCreativeProject(doc);
    if (res.isValid) throw new Error('Expected opacity < 0 to fail validation');
  });

  // 10. Opacity above 1 is rejected
  test('10. Opacity above 1 is rejected', () => {
    const doc = createDefaultCreativeProject({ id: 'test_opacity_high', name: 'High Opacity' });
    doc.globalSettings.effects = {
      ...doc.globalSettings.effects,
      gradientOverlayOpacity: 1.5,
    };
    const res = validateCreativeProject(doc);
    if (res.isValid) throw new Error('Expected opacity > 1 to fail validation');
  });

  // 11. Strength below 0 is rejected
  test('11. Strength below 0 is rejected', () => {
    const doc = createDefaultCreativeProject({ id: 'test_strength_neg', name: 'Neg Strength' });
    doc.globalSettings.effects = {
      ...doc.globalSettings.effects,
      gradientOverlayStrength: -0.2,
    };
    const res = validateCreativeProject(doc);
    if (res.isValid) throw new Error('Expected strength < 0 to fail validation');
  });

  // 12. Strength above 1 is rejected
  test('12. Strength above 1 is rejected', () => {
    const doc = createDefaultCreativeProject({ id: 'test_strength_high', name: 'High Strength' });
    doc.globalSettings.effects = {
      ...doc.globalSettings.effects,
      gradientOverlayStrength: 1.2,
    };
    const res = validateCreativeProject(doc);
    if (res.isValid) throw new Error('Expected strength > 1 to fail validation');
  });

  // 13. Beat-level gradient can override global gradient
  test('13. Beat-level gradient overrides global gradient', () => {
    const doc = createDefaultCreativeProject({ id: 'test_override', name: 'Override Test' });
    doc.globalSettings.effects = {
      ...doc.globalSettings.effects,
      gradientOverlayEnabled: false,
    };
    doc.beats[0].visual = {
      ...doc.beats[0].visual,
      effects: {
        gradientOverlayEnabled: true,
        gradientOverlayDirection: 'top-right',
        gradientOverlayOpacity: 0.8,
        gradientOverlayStrength: 0.7,
      },
    };
    const res = validateCreativeProject(doc);
    if (!res.isValid) throw new Error(`Validation failed: ${res.errors.map((e) => `${e.path}: ${e.message}`).join('; ')}`);

    const resolved = resolveBeatVisualSettings(doc.globalSettings, doc.beats[0].visual);
    if (resolved.effects?.gradientOverlayEnabled !== true) {
      throw new Error(`Expected beat override gradientOverlayEnabled = true, got ${resolved.effects?.gradientOverlayEnabled}`);
    }
    if (resolved.effects?.gradientOverlayDirection !== 'top-right') {
      throw new Error(`Expected beat override direction = 'top-right', got ${resolved.effects?.gradientOverlayDirection}`);
    }
  });

  // 14. Explicit beat-level disable works (false overrides true)
  test('14. Explicit beat-level disable (false) overrides global true', () => {
    const doc = createDefaultCreativeProject({ id: 'test_disable', name: 'Disable Test' });
    doc.globalSettings.effects = {
      ...doc.globalSettings.effects,
      gradientOverlayEnabled: true,
      gradientOverlayColor: '#000000',
      gradientOverlayOpacity: 0.65,
    };
    doc.beats[0].visual = {
      ...doc.beats[0].visual,
      effects: {
        gradientOverlayEnabled: false,
      },
    };
    const res = validateCreativeProject(doc);
    if (!res.isValid) throw new Error(`Validation failed: ${res.errors.map((e) => `${e.path}: ${e.message}`).join('; ')}`);

    const resolved = resolveBeatVisualSettings(doc.globalSettings, doc.beats[0].visual);
    if (resolved.effects?.gradientOverlayEnabled !== false) {
      throw new Error(`Expected explicit beat disable gradientOverlayEnabled = false, got ${resolved.effects?.gradientOverlayEnabled}`);
    }
  });

  // 15. Bidirectional State <-> Creative Project conversion preserves all gradient fields
  test('15. Bidirectional State <-> Creative Project conversion preserves all gradient fields', () => {
    const doc = createDefaultCreativeProject({ id: 'test_conv', name: 'Conversion Test' });
    doc.globalSettings.effects = {
      ...doc.globalSettings.effects,
      gradientOverlayEnabled: true,
      gradientOverlayColor: '#0f172a',
      gradientOverlayOpacity: 0.85,
      gradientOverlayStrength: 0.75,
      gradientOverlayDirection: 'bottom-left',
    };

    const state = convertCreativeProjectToProjectState(doc);
    if (state.textureSettings?.gradientOverlayEnabled !== true) throw new Error('State gradientOverlayEnabled mismatch');
    if (state.textureSettings?.gradientOverlayColor !== '#0f172a') throw new Error('State gradientOverlayColor mismatch');
    if (state.textureSettings?.gradientOverlayOpacity !== 0.85) throw new Error('State gradientOverlayOpacity mismatch');
    if (state.textureSettings?.gradientOverlayStrength !== 0.75) throw new Error('State gradientOverlayStrength mismatch');
    if (state.textureSettings?.gradientOverlayDirection !== 'bottom-left') throw new Error('State gradientOverlayDirection mismatch');

    const reconverted = convertProjectStateToCreativeProject(state.rawSettings as any);
    if (reconverted.globalSettings.effects?.gradientOverlayEnabled !== true) throw new Error('Reconverted enabled mismatch');
    if (reconverted.globalSettings.effects?.gradientOverlayColor !== '#0f172a') throw new Error('Reconverted color mismatch');
    if (reconverted.globalSettings.effects?.gradientOverlayOpacity !== 0.85) throw new Error('Reconverted opacity mismatch');
    if (reconverted.globalSettings.effects?.gradientOverlayStrength !== 0.75) throw new Error('Reconverted strength mismatch');
    if (reconverted.globalSettings.effects?.gradientOverlayDirection !== 'bottom-left') throw new Error('Reconverted direction mismatch');
  });

  console.log(`\n==================================================`);
  console.log(`RESULTS: ${passCount} / ${totalCount} tests passed`);
  console.log(`==================================================\n`);
  if (passCount !== totalCount) {
    process.exit(1);
  }
}

runTests();
