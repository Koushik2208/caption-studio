import { extractCaptionsFromBeats, extractAssetPlacements } from '../src/creative/converters.js';
import { createDefaultCreativeProject } from '../src/creative/defaults.js';

const proj = createDefaultCreativeProject({
  beats: [
    {
      id: 'b1',
      type: 'hook',
      startFrame: 0,
      endFrame: 60,
      content: {
        text: 'Plants are basically solar factories',
        words: [
          { text: 'Plants', startMs: 0, endMs: 400 },
          { text: 'are', startMs: 400, endMs: 700 },
          { text: 'basically', startMs: 700, endMs: 1200 },
          { text: 'solar', startMs: 1200, endMs: 1600 },
          { text: 'factories', startMs: 1600, endMs: 2000 }
        ]
      },
      transition: { assetId: 'flash', startFrame: 0, durationInFrames: 10 },
      sfx: { assetId: 'impact', startFrame: 0 }
    }
  ],
  assets: {
    transitions: ['film_burn'],
    sfx: ['vine_boom']
  }
});

const caps = extractCaptionsFromBeats(proj.beats, 30);
console.log('Captions text:', caps.map(c => c.text));
if (caps[0].text !== 'Plants') throw new Error('First word spacing failed');
if (caps[1].text !== ' are') throw new Error('Second word spacing failed: ' + caps[1].text);
if (caps[2].text !== ' basically') throw new Error('Third word spacing failed: ' + caps[2].text);

const assets = extractAssetPlacements(proj);
console.log('Transition count:', assets.transitionOverlays.length);
console.log('SFX count:', assets.soundEffects.length);
if (assets.transitionOverlays.length !== 2) throw new Error('Root transitions not extracted');
if (assets.soundEffects.length !== 2) throw new Error('Root SFX not extracted');

console.log('ALL PREVIEW FIX CHECKS PASSED');
