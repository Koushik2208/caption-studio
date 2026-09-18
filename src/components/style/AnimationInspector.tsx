import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { ANIMATION_STYLES } from '../../pages/styleOptions';
import type { CaptionStyleVariant } from '../../captions/styles/types';
import type {
  KenBurnsDirection,
  PanDirection,
  VideoMotionIntensity,
  VideoMotionSpeed,
  VideoMotionType,
} from '../../videoMotion/types';

interface AnimationMeta {
  value: CaptionStyleVariant;
  label: string;
  tag: string;
  icon: string;
  description: string;
}

const ANIMATION_METAS: AnimationMeta[] = [
  {
    value: 'signature',
    label: 'Signature',
    tag: 'Energetic',
    icon: 'bolt',
    description: 'High-energy scale pulse on active word with subtle overshoot',
  },
  {
    value: 'splitReveal',
    label: 'Street',
    tag: 'Urban',
    icon: 'splitscreen',
    description: 'Two-half split clip reveal opening outward with bold energy',
  },
  {
    value: 'wordStamp',
    label: 'Word Stamp',
    tag: 'Punchy',
    icon: 'pan_tool_alt',
    description: 'High-impact spring scale slam with punchy overshoot',
  },
  {
    value: 'blurResolve',
    label: 'Blur Resolve',
    tag: 'Cinematic',
    icon: 'blur_on',
    description: 'Optical de-focus to sharp resolution with subtle scale settling',
  },
  {
    value: 'sentenceBlock',
    label: 'Sentence Block',
    tag: 'Editorial',
    icon: 'highlight',
    description: 'Animated rectangular backplate wipes with high-contrast text',
  },
  {
    value: 'calmPhrase',
    label: 'Calm Phrase',
    tag: 'Minimal',
    icon: 'nature_people',
    description: 'Subtle whole-phrase opacity transitions, ideal for storytelling',
  },
  {
    value: 'typewriter',
    label: 'Typewriter',
    tag: 'Retro / Tech',
    icon: 'keyboard',
    description: 'Crisp character-by-character revelation matching audio pace',
  },
  {
    value: 'slideUp',
    label: 'Slide-up',
    tag: 'Smooth',
    icon: 'arrow_upward_alt',
    description: 'Smooth vertical spring glide into position',
  },
  {
    value: 'outlineDraw',
    label: 'Outline Draw',
    tag: 'Cinematic',
    icon: 'draw',
    description: 'Dynamic kinetic outline expand with luxurious presence',
  },
];

interface MotionMeta {
  type: VideoMotionType;
  label: string;
  icon: string;
  description: string;
}

const MOTION_PRESETS: MotionMeta[] = [
  {
    type: 'static',
    label: 'Static',
    icon: 'crop_free',
    description: 'Stationary frame without camera motion',
  },
  {
    type: 'ken-burns',
    label: 'Ken Burns',
    icon: 'zoom_out_map',
    description: 'Cinematic slow zoom & subtle directional drift',
  },
  {
    type: 'zoom-in',
    label: 'Zoom In',
    icon: 'zoom_in',
    description: 'Smooth cinematic push-in towards focal point',
  },
  {
    type: 'zoom-out',
    label: 'Zoom Out',
    icon: 'zoom_out',
    description: 'Gentle pull-back revealing wider context',
  },
  {
    type: 'pan',
    label: 'Pan',
    icon: 'pan_tool',
    description: 'Slow horizontal or vertical camera track',
  },
  {
    type: 'sway',
    label: 'Sway',
    icon: 'waves',
    description: 'Subtle continuous handheld-style oscillation',
  },
];

const INTENSITIES: { value: VideoMotionIntensity; label: string }[] = [
  { value: 'subtle', label: 'Subtle' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
];

const SPEEDS: { value: VideoMotionSpeed; label: string }[] = [
  { value: 'slow', label: 'Slow' },
  { value: 'medium', label: 'Medium' },
  { value: 'fast', label: 'Fast' },
];

const KEN_BURNS_DIRECTIONS: { value: KenBurnsDirection; label: string }[] = [
  { value: 'zoom-in-center', label: 'Push Center' },
  { value: 'zoom-in-left', label: 'Push Left' },
  { value: 'zoom-in-right', label: 'Push Right' },
  { value: 'zoom-out-center', label: 'Pull Center' },
  { value: 'zoom-out-left', label: 'Pull Left' },
  { value: 'zoom-out-right', label: 'Pull Right' },
];

const PAN_DIRECTIONS: { value: PanDirection; label: string }[] = [
  { value: 'left-to-right', label: 'Left → Right' },
  { value: 'right-to-left', label: 'Right → Left' },
  { value: 'top-to-bottom', label: 'Top → Bottom' },
  { value: 'bottom-to-top', label: 'Bottom → Top' },
];

export const AnimationInspector: React.FC = () => {
  const { animation, setAnimation, videoMotion, updateVideoMotion, setVideoMotion } = useProject();

  const currentType = videoMotion?.type ?? 'static';
  const currentIntensity = videoMotion?.intensity ?? 'subtle';
  const currentSpeed = videoMotion?.speed ?? 'medium';
  const currentDirection = videoMotion?.direction;

  const handleSelectMotionType = (type: VideoMotionType) => {
    let defaultDirection = videoMotion?.direction;
    if (type === 'ken-burns' && (!defaultDirection || !defaultDirection.startsWith('zoom-'))) {
      defaultDirection = 'zoom-in-center';
    } else if (type === 'pan' && (!defaultDirection || defaultDirection.startsWith('zoom-'))) {
      defaultDirection = 'left-to-right';
    }

    setVideoMotion({
      type,
      intensity: videoMotion?.intensity ?? 'subtle',
      speed: videoMotion?.speed ?? 'medium',
      direction: defaultDirection,
    });
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* ── SECTION 1: VIDEO MOTION ── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
              Video Motion
            </span>
            <span className="text-[11px] text-outline">
              Smooth camera motion applied to the background video
            </span>
          </div>
          <span className="text-[11px] font-medium text-primary font-mono capitalize">
            {currentType.replace('-', ' ')}
          </span>
        </div>

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-2 gap-2">
          {MOTION_PRESETS.map((m) => {
            const isSelected = currentType === m.type;
            return (
              <button
                key={m.type}
                type="button"
                onClick={() => handleSelectMotionType(m.type)}
                className={`flex flex-col p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary-container/10 shadow-xs ring-1 ring-primary'
                    : 'border-outline-variant/60 bg-surface-container-lowest hover:border-primary/50 hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-surface-container text-outline'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px]">{m.icon}</span>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isSelected ? 'text-primary' : 'text-on-surface'
                    }`}
                  >
                    {m.label}
                  </span>
                </div>
                <p className="text-[10px] text-outline mt-1.5 leading-tight line-clamp-2">
                  {m.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Contextual Controls for Selected Preset */}
        {currentType !== 'static' && (
          <div className="flex flex-col gap-3 p-3 rounded-xl border border-outline-variant/60 bg-surface-container-low/40 mt-1">
            {/* Intensity Selector */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-on-surface">Motion Intensity</span>
              <div className="flex rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-0.5">
                {INTENSITIES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => updateVideoMotion({ intensity: item.value })}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                      currentIntensity === item.value
                        ? 'bg-primary text-white shadow-xs font-semibold'
                        : 'text-outline hover:text-on-surface'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ken Burns Directions */}
            {currentType === 'ken-burns' && (
              <div className="flex flex-col gap-1.5 pt-1 border-t border-outline-variant/40">
                <span className="text-[11px] font-medium text-on-surface">Motion Direction</span>
                <div className="grid grid-cols-3 gap-1">
                  {KEN_BURNS_DIRECTIONS.map((dir) => {
                    const isDir = (currentDirection ?? 'zoom-in-center') === dir.value;
                    return (
                      <button
                        key={dir.value}
                        type="button"
                        onClick={() => updateVideoMotion({ direction: dir.value })}
                        className={`py-1.5 px-2 rounded-lg text-[10px] border text-center transition-all ${
                          isDir
                            ? 'border-primary bg-primary text-white font-semibold'
                            : 'border-outline-variant/60 bg-surface-container-lowest text-outline hover:text-on-surface'
                        }`}
                      >
                        {dir.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pan Directions */}
            {currentType === 'pan' && (
              <div className="flex flex-col gap-1.5 pt-1 border-t border-outline-variant/40">
                <span className="text-[11px] font-medium text-on-surface">Pan Direction</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {PAN_DIRECTIONS.map((dir) => {
                    const isDir = (currentDirection ?? 'left-to-right') === dir.value;
                    return (
                      <button
                        key={dir.value}
                        type="button"
                        onClick={() => updateVideoMotion({ direction: dir.value })}
                        className={`py-1.5 px-2.5 rounded-lg text-[11px] border text-center transition-all ${
                          isDir
                            ? 'border-primary bg-primary text-white font-semibold'
                            : 'border-outline-variant/60 bg-surface-container-lowest text-outline hover:text-on-surface'
                        }`}
                      >
                        {dir.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sway Speed */}
            {currentType === 'sway' && (
              <div className="flex items-center justify-between pt-1 border-t border-outline-variant/40">
                <span className="text-[11px] font-medium text-on-surface">Oscillation Speed</span>
                <div className="flex rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-0.5">
                  {SPEEDS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => updateVideoMotion({ speed: item.value })}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                        currentSpeed === item.value
                          ? 'bg-primary text-white shadow-xs font-semibold'
                          : 'text-outline hover:text-on-surface'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── DIVIDER ── */}
      <hr className="border-outline-variant/40" />

      {/* ── SECTION 2: CAPTION ANIMATION ── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-label-caps">
            Caption Animation
          </span>
          <span className="text-[11px] text-outline">{ANIMATION_STYLES.length} styles</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {ANIMATION_METAS.map((a) => {
            const isSelected = animation === a.value;
            return (
              <button
                key={a.value}
                type="button"
                onClick={() => setAnimation(a.value)}
                className={`flex items-start gap-3.5 p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary-container/5 shadow-xs ring-1 ring-primary'
                    : 'border-outline-variant/60 bg-surface-container-lowest hover:border-primary/50 hover:bg-surface-container-low'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-surface-container text-outline'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{a.icon}</span>
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${
                        isSelected ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      {a.label}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium font-mono ${
                        isSelected
                          ? 'bg-primary-container/20 text-primary'
                          : 'bg-surface-container text-outline'
                      }`}
                    >
                      {a.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-outline mt-1 leading-relaxed">
                    {a.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
