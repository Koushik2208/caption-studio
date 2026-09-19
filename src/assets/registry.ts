import type { BuiltInAsset } from './types.js';

const RAW_ASSETS: Array<Omit<BuiltInAsset, 'label' | 'path'>> = [
  // ── Transition Video Overlays (2) ──
  {
    id: 'film_burn',
    type: 'overlay',
    category: 'transition',
    name: 'Film Burn',
    src: 'assets/overlays/transitions/film_burn.mov',
    tags: ['transition', 'film', 'burn', 'cinematic', 'warm', 'organic'],
  },
  {
    id: 'flash',
    type: 'overlay',
    category: 'transition',
    name: 'Flash',
    src: 'assets/overlays/transitions/flash.mov',
    tags: ['transition', 'flash', 'impact', 'bright', 'fast'],
  },

  // ── Sound Effects (21) ──
  {
    id: 'bass_hit_punchy',
    type: 'sfx',
    category: 'impact',
    name: 'Punchy Bass Hit',
    src: 'assets/sfx/bass_hit_punchy.mp3',
    tags: ['bass', 'hit', 'punchy', 'impact', 'low-end', 'emphasis'],
  },
  {
    id: 'camera_flash',
    type: 'sfx',
    category: 'foley',
    name: 'Camera Flash',
    src: 'assets/sfx/camera_flash.mp3',
    tags: ['camera', 'flash', 'photo', 'snap', 'reveal', 'paparazzi', 'snapshot'],
  },
  {
    id: 'camera_shutter',
    type: 'sfx',
    category: 'foley',
    name: 'Camera Shutter',
    src: 'assets/sfx/camera_shutter.mp3',
    tags: ['camera', 'shutter', 'photo', 'snap', 'capture'],
  },
  {
    id: 'click_mouse',
    type: 'sfx',
    category: 'ui',
    name: 'Mouse Click',
    src: 'assets/sfx/click_mouse.mp3',
    tags: ['click', 'mouse', 'ui', 'interface', 'tech', 'digital'],
  },
  {
    id: 'glitch_sfx',
    type: 'sfx',
    category: 'glitch',
    name: 'Glitch SFX',
    src: 'assets/sfx/glitch_sfx.mp3',
    tags: ['glitch', 'digital', 'distortion', 'static', 'tech'],
  },
  {
    id: 'glitch_transition',
    type: 'sfx',
    category: 'glitch',
    name: 'Glitch Transition',
    src: 'assets/sfx/glitch_transition.mp3',
    tags: ['glitch', 'transition', 'digital', 'cyber', 'distortion'],
  },
  {
    id: 'impact',
    type: 'sfx',
    category: 'impact',
    name: 'Impact',
    src: 'assets/sfx/impact.mp3',
    tags: ['impact', 'hit', 'strike', 'emphasis', 'accent'],
  },
  {
    id: 'impact_cinematic',
    type: 'sfx',
    category: 'impact',
    name: 'Cinematic Impact',
    src: 'assets/sfx/impact_cinematic.mp3',
    tags: ['impact', 'cinematic', 'epic', 'boom', 'heavy', 'trailer'],
  },
  {
    id: 'notification',
    type: 'sfx',
    category: 'ui',
    name: 'Notification',
    src: 'assets/sfx/notification.mp3',
    tags: ['notification', 'alert', 'ping', 'message', 'ui', 'bell'],
  },
  {
    id: 'pop_bubble',
    type: 'sfx',
    category: 'pop',
    name: 'Bubble Pop',
    src: 'assets/sfx/pop_bubble.mp3',
    tags: ['pop', 'bubble', 'light', 'clean', 'fun', 'playful'],
  },
  {
    id: 'pop_soft',
    type: 'sfx',
    category: 'pop',
    name: 'Soft Pop',
    src: 'assets/sfx/pop_soft.mp3',
    tags: ['pop', 'soft', 'subtle', 'click', 'minimal', 'clean'],
  },
  {
    id: 'pop_wine_cork',
    type: 'sfx',
    category: 'pop',
    name: 'Wine Cork Pop',
    src: 'assets/sfx/pop_wine_cork.mp3',
    tags: ['pop', 'cork', 'bottle', 'celebration', 'snappy'],
  },
  {
    id: 'riser_cinematic',
    type: 'sfx',
    category: 'riser',
    name: 'Cinematic Riser',
    src: 'assets/sfx/riser_cinematic.mp3',
    tags: ['riser', 'cinematic', 'build-up', 'tension', 'suspense', 'trailer'],
  },
  {
    id: 'riser_sharp_short',
    type: 'sfx',
    category: 'riser',
    name: 'Short Sharp Riser',
    src: 'assets/sfx/riser_sharp_short.mp3',
    tags: ['riser', 'sharp', 'short', 'fast', 'build-up', 'accent'],
  },
  {
    id: 'swipe_whoosh',
    type: 'sfx',
    category: 'whoosh',
    name: 'Swipe Whoosh',
    src: 'assets/sfx/swipe_whoosh.mp3',
    tags: ['swipe', 'whoosh', 'fast', 'transition', 'movement', 'air'],
  },
  {
    id: 'typing',
    type: 'sfx',
    category: 'ui',
    name: 'Typing',
    src: 'assets/sfx/typing.mp3',
    tags: ['typing', 'keyboard', 'keys', 'coding', 'tech', 'text'],
  },
  {
    id: 'vine_boom',
    type: 'sfx',
    category: 'impact',
    name: 'Vine Boom',
    src: 'assets/sfx/vine_boom.mp3',
    tags: ['vine-boom', 'meme', 'dramatic', 'surprise', 'punchline', 'heavy'],
  },
  {
    id: 'whoosh_cinematic',
    type: 'sfx',
    category: 'whoosh',
    name: 'Cinematic Whoosh',
    src: 'assets/sfx/whoosh_cinematic.mp3',
    tags: ['whoosh', 'cinematic', 'deep', 'trailer', 'transition'],
  },
  {
    id: 'whoosh_fast',
    type: 'sfx',
    category: 'whoosh',
    name: 'Fast Whoosh',
    src: 'assets/sfx/whoosh_fast.mp3',
    tags: ['whoosh', 'fast', 'quick', 'transition', 'air', 'swipe'],
  },
  {
    id: 'whoosh_riser',
    type: 'sfx',
    category: 'whoosh',
    name: 'Whoosh Riser',
    src: 'assets/sfx/whoosh_riser.mp3',
    tags: ['whoosh', 'riser', 'build-up', 'transition', 'climax'],
  },
  {
    id: 'whoosh_simple',
    type: 'sfx',
    category: 'whoosh',
    name: 'Simple Whoosh',
    src: 'assets/sfx/whoosh_simple.mp3',
    tags: ['whoosh', 'simple', 'clean', 'subtle', 'movement'],
  },
];

export const BUILT_IN_ASSETS: BuiltInAsset[] = RAW_ASSETS.map((a) => ({
  ...a,
  label: a.name,
  path: a.src,
}));

export const ALL_BUILT_IN_ASSETS = BUILT_IN_ASSETS;

export const TRANSITION_OVERLAYS = BUILT_IN_ASSETS.filter((a) => a.type === 'overlay');

export const SOUND_EFFECTS = BUILT_IN_ASSETS.filter((a) => a.type === 'sfx');

export const ASSET_REGISTRY: Record<string, BuiltInAsset> = BUILT_IN_ASSETS.reduce(
  (acc, asset) => {
    acc[asset.id] = asset;
    return acc;
  },
  {} as Record<string, BuiltInAsset>,
);

export function getBuiltInAsset(id: string): BuiltInAsset | undefined {
  return ASSET_REGISTRY[id];
}

export const getAssetById = getBuiltInAsset;

export function getAssetsByType(type: 'overlay' | 'sfx'): BuiltInAsset[] {
  return BUILT_IN_ASSETS.filter((a) => a.type === type);
}

export function getAssetsByCategory(category: string): BuiltInAsset[] {
  return BUILT_IN_ASSETS.filter((a) => a.category === category);
}
