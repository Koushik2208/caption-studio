import fs from 'node:fs';
import path from 'node:path';
import { ALL_BUILT_IN_ASSETS, getAssetById, getAssetsByType, getAssetsByCategory, TRANSITION_OVERLAYS, SOUND_EFFECTS } from '../src/assets/registry.js';

async function main() {
  console.log('=== VERIFYING BUILT-IN ASSET LIBRARY FOUNDATION ===\n');

  // 1. Check asset registry counts
  console.log(`Total registered assets: ${ALL_BUILT_IN_ASSETS.length}`);
  console.log(`Transition overlays: ${TRANSITION_OVERLAYS.length}`);
  console.log(`Sound effects: ${SOUND_EFFECTS.length}`);

  if (ALL_BUILT_IN_ASSETS.length !== 23) {
    throw new Error(`Expected 23 assets, found ${ALL_BUILT_IN_ASSETS.length}`);
  }

  // 2. Check each file exists on disk in public/
  console.log('\nVerifying filesystem paths...');
  let missingCount = 0;
  for (const asset of ALL_BUILT_IN_ASSETS) {
    const fullPath = path.resolve(process.cwd(), 'public', asset.path);
    const exists = fs.existsSync(fullPath);
    if (!exists) {
      console.error(`[FAIL] Missing file: ${asset.id} -> ${fullPath}`);
      missingCount++;
    } else {
      const stats = fs.statSync(fullPath);
      console.log(`[OK] ${asset.id} (${asset.type}/${asset.category}) -> ${asset.path} (${stats.size} bytes)`);
    }
  }

  if (missingCount > 0) {
    throw new Error(`Found ${missingCount} missing asset files on disk!`);
  }

  // 3. Test registry lookups
  console.log('\nTesting Registry Lookups...');
  const filmBurn = getAssetById('film_burn');
  if (!filmBurn || filmBurn.type !== 'overlay') {
    throw new Error('film_burn lookup failed');
  }

  const vineBoom = getAssetById('vine_boom');
  if (!vineBoom || vineBoom.category !== 'impact' || vineBoom.type !== 'sfx') {
    throw new Error('vine_boom lookup failed');
  }

  const cameraFlash = getAssetById('camera_flash');
  if (!cameraFlash || cameraFlash.category !== 'foley' || cameraFlash.type !== 'sfx') {
    throw new Error('camera_flash lookup failed');
  }

  const whooshes = getAssetsByCategory('whoosh');
  if (whooshes.length < 4) {
    throw new Error(`Expected at least 4 whooshes, got ${whooshes.length}`);
  }

  const sfxList = getAssetsByType('sfx');
  if (sfxList.length !== 21) {
    throw new Error(`Expected 21 SFX, got ${sfxList.length}`);
  }

  console.log('[OK] All registry lookups passed.');

  console.log('\n=== ALL ASSET LIBRARY FOUNDATION CHECKS PASSED ===');
}

main().catch((err) => {
  console.error('\nVerification failed:', err);
  process.exit(1);
});
