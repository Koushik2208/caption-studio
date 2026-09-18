import assert from 'node:assert';

console.log('=== VERIFYING MANUAL PLACEMENT SECONDS <-> FRAMES CONVERSION ===\n');

function secToFrames(sec: number, fps: number): number {
  return Math.round(sec * fps);
}

function framesToSec(frames: number, fps: number): number {
  return Math.round((frames / fps) * 100) / 100;
}

// 1. Check 30 FPS conversions
console.log('Testing 30 FPS conversions:');
const cases30Fps = [
  { sec: 0, expectedFrames: 0 },
  { sec: 0.25, expectedFrames: 8 },
  { sec: 0.5, expectedFrames: 15 },
  { sec: 1.0, expectedFrames: 30 },
  { sec: 1.5, expectedFrames: 45 },
  { sec: 2.0, expectedFrames: 60 },
  { sec: 12.5, expectedFrames: 375 },
  { sec: 18.75, expectedFrames: 563 },
];

for (const { sec, expectedFrames } of cases30Fps) {
  const frames = secToFrames(sec, 30);
  assert.strictEqual(frames, expectedFrames, `Expected ${sec}s @ 30fps to be ${expectedFrames} frames, got ${frames}`);
  const convertedBack = framesToSec(frames, 30);
  console.log(`[PASS] 30 FPS: ${sec}s -> ${frames} frames -> ${convertedBack}s`);
}

// 2. Check 60 FPS conversions
console.log('\nTesting 60 FPS conversions:');
const cases60Fps = [
  { sec: 0, expectedFrames: 0 },
  { sec: 0.25, expectedFrames: 15 },
  { sec: 0.5, expectedFrames: 30 },
  { sec: 1.0, expectedFrames: 60 },
  { sec: 1.5, expectedFrames: 90 },
  { sec: 12.5, expectedFrames: 750 },
];

for (const { sec, expectedFrames } of cases60Fps) {
  const frames = secToFrames(sec, 60);
  assert.strictEqual(frames, expectedFrames, `Expected ${sec}s @ 60fps to be ${expectedFrames} frames, got ${frames}`);
  const convertedBack = framesToSec(frames, 60);
  console.log(`[PASS] 60 FPS: ${sec}s -> ${frames} frames -> ${convertedBack}s`);
}

// 3. Check Validation logic
console.log('\nTesting Validation Rules:');
function validateTransition(startSec: number, durSec: number, totalDurationSec: number) {
  if (isNaN(startSec) || startSec < 0) return 'Start time must be >= 0 sec';
  if (totalDurationSec > 0 && startSec > totalDurationSec) return `Start time exceeds project duration (${totalDurationSec}s)`;
  if (isNaN(durSec) || durSec <= 0) return 'Duration must be > 0 sec';
  if (totalDurationSec > 0 && (startSec + durSec) > totalDurationSec + 0.001) return `Transition extends beyond project duration (${totalDurationSec}s)`;
  return null;
}

assert.strictEqual(validateTransition(0, 0.5, 30), null, '0s start with 0.5s dur in 30s project is valid');
assert.strictEqual(validateTransition(-1, 0.5, 30), 'Start time must be >= 0 sec');
assert.strictEqual(validateTransition(35, 0.5, 30), 'Start time exceeds project duration (30s)');
assert.strictEqual(validateTransition(10, 0, 30), 'Duration must be > 0 sec');
assert.strictEqual(validateTransition(29.8, 0.5, 30), 'Transition extends beyond project duration (30s)');
assert.strictEqual(validateTransition(12.5, 0.25, 30), null, '12.5s start with 0.25s dur is valid');

console.log('[PASS] All validation edge cases passed!');
console.log('\n=== ALL MANUAL PLACEMENT UX TESTS PASSED ===\n');
