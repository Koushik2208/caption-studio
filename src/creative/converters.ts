import { parseSrt, type Caption } from '@remotion/captions';
import { ensureWordLevelCaptions } from '../captions/processCaptions.js';
import type { CaptionStyleOverrides, CaptionStyleVariant } from '../captions/styles/types.js';
import type { FontPresetName } from '../captions/styles/presets';
import type { CompositionLayout, FrameVariant } from '../frames/types.js';
import type { VideoMotionSettings, VideoMotionType } from '../videoMotion/types.js';
import type { AssetSettings, SoundEffectPlacement, TransitionOverlayPlacement } from '../assets/types.js';
import type { TextureOverlaySettings } from '../textures/types.js';
import {
  DEFAULT_FPS,
  DEFAULT_GLOBAL_SETTINGS,
  createDefaultCreativeProject,
} from './defaults.js';
import {
  normalizeAnimationVariant,
  normalizeCompositionLayout,
  normalizeFontPresetName,
  normalizeFrameVariant,
  normalizeVideoMotionType,
  normalizeWatermarkPosition,
} from './schema.js';
import type {
  ConvertedProjectState,
  CreativeBeat,
  CreativeBeatContent,
  CreativeBeatWord,
  CreativeMediaAsset,
  CreativeProject,
  CreativeSfxPlacement,
  CreativeTransitionPlacement,
  CreativeTypographySettings,
  MediaResolutionResult,
  ProjectStateExportInput,
} from './types.js';

/**
 * Builds a CaptionStyleOverrides object from creative typography settings.
 */
export function buildCaptionStyleOverrides(
  typography: CreativeTypographySettings,
): CaptionStyleOverrides {
  return {
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight ?? undefined,
    fontStyle: typography.fontStyle,
    fontSizeMultiplier: typography.fontSizeMultiplier,
    textColor: typography.textColor,
    position: typography.position,
    customPositionY: typography.captionPositionY,
    textAlign: typography.textAlign,
    strokeEnabled: typography.strokeEnabled,
    strokeColor: typography.strokeColor,
    strokeWidth: typography.strokeWidth,
    shadowEnabled: typography.shadowEnabled,
    glowEnabled: typography.glowEnabled,
    glowColor: typography.glowColor,
    glowIntensity: typography.glowIntensity,
    glowBlur: typography.glowBlur,
    glowOpacity: typography.glowOpacity,
    gradientEnabled: typography.gradientEnabled,
    gradientStart: typography.gradientStart,
    gradientEnd: typography.gradientEnd,
    gradientAngle: typography.gradientAngle,
    letterSpacing: typography.letterSpacing,
    lineHeight: typography.lineHeight,
    textTransform: typography.textTransform,
    backdropEnabled: typography.backdropEnabled,
    backdropColor: typography.backdropColor,
    backdropOpacity: typography.backdropOpacity,
    backdropRadius: typography.backdropRadius,
    backdropPaddingX: typography.backdropPaddingX,
    backdropPaddingY: typography.backdropPaddingY,
    keywordHighlightEnabled: typography.keywordHighlightEnabled,
    highlightIntensity: typography.highlightIntensity,
    keywordColor: typography.highlightColor,
    keywords: typography.keywords,
    wordOverrides: typography.wordOverrides,
  };
}

/**
 * Collects all transition overlays and sound effects from beats and project assets into AssetSettings.
 */
export function extractAssetPlacements(project: CreativeProject): AssetSettings {
  const transitionOverlays: TransitionOverlayPlacement[] = [];
  const soundEffects: SoundEffectPlacement[] = [];

  // 1. Collect root-level asset placement objects if present
  if (project.assets?.transitions && Array.isArray(project.assets.transitions)) {
    project.assets.transitions.forEach((trans: unknown, idx) => {
      if (trans && typeof trans === 'object' && 'assetId' in trans) {
        const obj = trans as CreativeTransitionPlacement;
        transitionOverlays.push({
          id: obj.id ?? `trans_root_${idx}_${obj.startFrame ?? 0}`,
          assetId: obj.assetId,
          startFrame: obj.startFrame ?? 0,
          durationInFrames: obj.durationInFrames ?? 15,
          opacity: obj.opacity ?? 1.0,
        });
      }
    });
  }

  if (project.assets?.sfx && Array.isArray(project.assets.sfx)) {
    project.assets.sfx.forEach((sfx: unknown, idx) => {
      if (sfx && typeof sfx === 'object' && 'assetId' in sfx) {
        const obj = sfx as CreativeSfxPlacement;
        soundEffects.push({
          id: obj.id ?? `sfx_root_${idx}_${obj.startFrame ?? 0}`,
          assetId: obj.assetId,
          startFrame: obj.startFrame ?? 0,
          volume: obj.volume ?? 0.8,
        });
      }
    });
  }

  // 2. Collect beat-level transitions and SFX (supports both objects and string IDs)
  project.beats.forEach((beat, index) => {
    // Collect beat transition
    const rawTrans = beat.transition as unknown;
    if (rawTrans) {
      if (typeof rawTrans === 'string' && rawTrans.trim()) {
        transitionOverlays.push({
          id: `trans_${beat.id || index}_${beat.startFrame}`,
          assetId: rawTrans.trim(),
          startFrame: beat.startFrame,
          durationInFrames: Math.min(15, Math.max(1, beat.endFrame - beat.startFrame)),
          opacity: 1.0,
        });
      } else if (typeof rawTrans === 'object' && 'assetId' in rawTrans && (rawTrans as CreativeTransitionPlacement).assetId) {
        const transObj = rawTrans as CreativeTransitionPlacement;
        transitionOverlays.push({
          id: transObj.id ?? `trans_${beat.id || index}_${transObj.startFrame ?? beat.startFrame}`,
          assetId: transObj.assetId,
          startFrame: transObj.startFrame ?? beat.startFrame,
          durationInFrames: transObj.durationInFrames ?? 15,
          opacity: transObj.opacity ?? 1.0,
        });
      }
    }

    // Collect beat SFX
    const rawSfx = beat.sfx as unknown;
    if (rawSfx) {
      if (Array.isArray(rawSfx)) {
        rawSfx.forEach((sfxItem, sfxIdx) => {
          if (typeof sfxItem === 'string' && sfxItem.trim()) {
            soundEffects.push({
              id: `sfx_${beat.id || index}_${sfxIdx}_${beat.startFrame}`,
              assetId: sfxItem.trim(),
              startFrame: beat.startFrame,
              volume: 0.8,
            });
          } else if (sfxItem && typeof sfxItem === 'object' && 'assetId' in sfxItem && (sfxItem as CreativeSfxPlacement).assetId) {
            const sfxObj = sfxItem as CreativeSfxPlacement;
            soundEffects.push({
              id: sfxObj.id ?? `sfx_${beat.id || index}_${sfxIdx}_${sfxObj.startFrame ?? beat.startFrame}`,
              assetId: sfxObj.assetId,
              startFrame: sfxObj.startFrame ?? beat.startFrame,
              volume: sfxObj.volume ?? 0.8,
            });
          }
        });
      } else if (typeof rawSfx === 'string' && rawSfx.trim()) {
        soundEffects.push({
          id: `sfx_${beat.id || index}_${beat.startFrame}`,
          assetId: rawSfx.trim(),
          startFrame: beat.startFrame,
          volume: 0.8,
        });
      } else if (typeof rawSfx === 'object' && 'assetId' in rawSfx && (rawSfx as CreativeSfxPlacement).assetId) {
        const sfxObj = rawSfx as CreativeSfxPlacement;
        soundEffects.push({
          id: sfxObj.id ?? `sfx_${beat.id || index}_${sfxObj.startFrame ?? beat.startFrame}`,
          assetId: sfxObj.assetId,
          startFrame: sfxObj.startFrame ?? beat.startFrame,
          volume: sfxObj.volume ?? 0.8,
        });
      }
    }
  });

  // 3. Fallback for root-level string declarations not yet placed on beats
  if (project.assets?.transitions && Array.isArray(project.assets.transitions)) {
    project.assets.transitions.forEach((trans: unknown, idx) => {
      if (typeof trans === 'string' && trans.trim()) {
        const assetId = trans.trim();
        const alreadyPlaced = transitionOverlays.some((t) => t.assetId === assetId);
        if (!alreadyPlaced) {
          const targetBeat = project.beats[idx] ?? project.beats[0];
          const startFrame = targetBeat ? targetBeat.startFrame : 0;
          transitionOverlays.push({
            id: `trans_root_str_${idx}_${startFrame}`,
            assetId,
            startFrame,
            durationInFrames: 15,
            opacity: 1.0,
          });
        }
      }
    });
  }

  if (project.assets?.sfx && Array.isArray(project.assets.sfx)) {
    project.assets.sfx.forEach((sfx: unknown, idx) => {
      if (typeof sfx === 'string' && sfx.trim()) {
        const assetId = sfx.trim();
        const alreadyPlaced = soundEffects.some((s) => s.assetId === assetId);
        if (!alreadyPlaced) {
          const targetBeat = project.beats[idx] ?? project.beats[0];
          const startFrame = targetBeat ? targetBeat.startFrame : 0;
          soundEffects.push({
            id: `sfx_root_str_${idx}_${startFrame}`,
            assetId,
            startFrame,
            volume: 0.8,
          });
        }
      }
    });
  }

  return {
    transitionOverlays,
    soundEffects,
  };
}

/**
 * Derives Remotion word/sentence captions from CreativeProject beats.
 */
export function extractCaptionsFromBeats(
  beats: CreativeBeat[],
  fps = DEFAULT_FPS,
): Caption[] {
  const allCaptions: Caption[] = [];

  for (const beat of beats) {
    if (beat.content.captions && beat.content.captions.length > 0) {
      allCaptions.push(...beat.content.captions);
    } else if (beat.content.words && beat.content.words.length > 0) {
      beat.content.words.forEach((w, wIdx) => {
        const rawText = w.text.trim();
        const formattedText =
          allCaptions.length === 0 && wIdx === 0
            ? rawText
            : w.text.startsWith(' ')
              ? w.text
              : ` ${rawText}`;

        allCaptions.push({
          text: formattedText,
          startMs: w.startMs,
          endMs: w.endMs,
          timestampMs: w.startMs,
          confidence: w.confidence ?? 1.0,
        });
      });
    } else if (beat.content.text.trim()) {
      // Fallback: create evenly timed word captions within the beat's frame range
      const startMs = Math.round((beat.startFrame / fps) * 1000);
      const endMs = Math.round((beat.endFrame / fps) * 1000);
      const words = beat.content.text.trim().split(/\s+/).filter(Boolean);

      if (words.length > 0) {
        const durationPerWord = Math.max(50, Math.floor((endMs - startMs) / words.length));
        words.forEach((word, wIdx) => {
          const wStart = startMs + wIdx * durationPerWord;
          const wEnd = wIdx === words.length - 1 ? endMs : wStart + durationPerWord;
          const formattedText = allCaptions.length === 0 && wIdx === 0 ? word : ` ${word}`;
          allCaptions.push({
            text: formattedText,
            startMs: wStart,
            endMs: wEnd,
            timestampMs: wStart,
            confidence: 1.0,
          });
        });
      }
    }
  }

  return ensureWordLevelCaptions(allCaptions);
}

/**
 * Converts a validated CreativeProject into existing ProjectContext-compatible state.
 */
export function convertCreativeProjectToProjectState(
  project: CreativeProject,
): ConvertedProjectState {
  const fps = project.fps || DEFAULT_FPS;
  const global = project.globalSettings ?? DEFAULT_GLOBAL_SETTINGS;
  const typography = global.typography;

  const captions = project.content?.transcript && project.content.transcript.length > 0
    ? ensureWordLevelCaptions(project.content.transcript)
    : extractCaptionsFromBeats(project.beats, fps);

  const styleOverrides = buildCaptionStyleOverrides(typography);
  const assetSettings = extractAssetPlacements(project);

  const normalizedAnimation: CaptionStyleVariant =
    normalizeAnimationVariant(global.animation) ?? 'signature';
  const normalizedPresetName: FontPresetName =
    (typography.presetName && normalizeFontPresetName(typography.presetName)) || 'Viral Hook';
  const normalizedLayout: CompositionLayout =
    (global.composition.layout && normalizeCompositionLayout(global.composition.layout)) || 'full-bleed';
  const normalizedFrameVariant: FrameVariant =
    (global.composition.variant && normalizeFrameVariant(global.composition.variant)) || 'none';
  const normalizedVideoMotionType: VideoMotionType =
    (global.videoMotion?.type && normalizeVideoMotionType(global.videoMotion.type)) || 'static';

  const resolvedVideoMotion: VideoMotionSettings = {
    ...DEFAULT_GLOBAL_SETTINGS.videoMotion,
    ...global.videoMotion,
    type: normalizedVideoMotionType,
  };

  const resolvedEffects: TextureOverlaySettings = {
    ...DEFAULT_GLOBAL_SETTINGS.effects,
    ...global.effects,
    gridIntensity: global.effects?.gridIntensity || 'medium',
    halationIntensity: global.effects?.halationIntensity || 'medium',
    crtScanlinesIntensity: global.effects?.crtScanlinesIntensity || 'medium',
    halftoneIntensity: global.effects?.halftoneIntensity || 'medium',
    lightLeakIntensity: global.effects?.lightLeakIntensity || 'medium',
    chromaticAberrationIntensity: global.effects?.chromaticAberrationIntensity || 'medium',
    filmGrainIntensity: global.effects?.filmGrainIntensity || 'medium',
    audioPulseIntensity: global.effects?.audioPulseIntensity || 'medium',
    keywordPunchIntensity: global.effects?.keywordPunchIntensity || 'medium',
  };

    const rawOverlay = global.overlay as Record<string, unknown> | undefined;
    const watermarkObj = rawOverlay && typeof rawOverlay.watermark === 'object' && rawOverlay.watermark !== null
      ? (rawOverlay.watermark as Record<string, unknown>)
      : null;
    const resolvedWatermarkEnabled = watermarkObj?.enabled !== undefined
      ? !!watermarkObj.enabled
      : !!rawOverlay?.watermarkEnabled;
    const rawWmPos = String(watermarkObj?.position || rawOverlay?.watermarkPosition || 'bottom-right');
    const resolvedWatermarkPos = normalizeWatermarkPosition(rawWmPos) || 'bottom-right';
    const rawWmOpacity = watermarkObj?.opacity !== undefined ? watermarkObj.opacity : rawOverlay?.watermarkOpacity;
    const resolvedWatermarkOpacity = typeof rawWmOpacity === 'number'
      ? (rawWmOpacity <= 1 ? Math.round(rawWmOpacity * 100) : rawWmOpacity)
      : 70;
    const rawWmSize = watermarkObj?.size !== undefined ? watermarkObj.size : rawOverlay?.watermarkSize;
    const resolvedWatermarkSize = typeof rawWmSize === 'number'
      ? (rawWmSize <= 1 ? Math.round(rawWmSize * 100) : rawWmSize)
      : 15;
    const resolvedWatermarkAssetId = (watermarkObj?.assetId as string) || (rawOverlay?.watermarkAssetId as string) || undefined;
    const referencedWatermarkAsset = resolvedWatermarkAssetId
      ? project.assets?.media?.find((m) => m && m.type === 'image' && m.id === resolvedWatermarkAssetId)
      : project.assets?.media?.find((m) => m && m.type === 'image');
    const resolvedWatermarkFilename = referencedWatermarkAsset?.name || (rawOverlay?.watermarkFilename as string) || undefined;

    const rawSettings: Partial<ProjectStateExportInput> = {
      projectId: project.id,
      projectName: project.name,
      durationInFrames: project.durationInFrames,
      captions,
      presetName: normalizedPresetName,
      animation: normalizedAnimation,
      keywordHighlightEnabled: typography.keywordHighlightEnabled ?? true,
      highlightIntensity: typography.highlightIntensity ?? 0.5,
      highlightColor: typography.highlightColor ?? '#0066ff',
      keywords: typography.keywords ?? [],
      position: typography.position ?? 'center',
      captionPositionY: typography.captionPositionY ?? 0.5,
      textAlign: typography.textAlign ?? 'center',
      fontSizeMultiplier: typography.fontSizeMultiplier ?? 1.0,
      textColor: typography.textColor ?? '#FFFFFF',
      fontWeight: typography.fontWeight ?? 400,
      strokeEnabled: typography.strokeEnabled ?? false,
      strokeColor: typography.strokeColor ?? '#000000',
      strokeWidth: typography.strokeWidth ?? 2,
      shadowEnabled: typography.shadowEnabled ?? true,
      glowEnabled: typography.glowEnabled ?? false,
      glowColor: typography.glowColor ?? '#00e5ff',
      glowIntensity: typography.glowIntensity ?? 0.5,
      glowBlur: typography.glowBlur ?? 12,
      glowOpacity: typography.glowOpacity ?? 0.8,
      gradientEnabled: typography.gradientEnabled ?? false,
      gradientStart: typography.gradientStart ?? '#ff007a',
      gradientEnd: typography.gradientEnd ?? '#7928ca',
      gradientAngle: typography.gradientAngle ?? 90,
      letterSpacing: typography.letterSpacing ?? 0,
      lineHeight: typography.lineHeight ?? 1.2,
      textTransform: typography.textTransform ?? 'none',
      backdropEnabled: typography.backdropEnabled ?? false,
      backdropColor: typography.backdropColor ?? '#000000',
      backdropOpacity: typography.backdropOpacity ?? 60,
      backdropRadius: typography.backdropRadius ?? 8,
      backdropPaddingX: typography.backdropPaddingX ?? 16,
      backdropPaddingY: typography.backdropPaddingY ?? 8,
      wordOverrides: typography.wordOverrides ?? {},
      watermarkEnabled: resolvedWatermarkEnabled,
      watermarkOpacity: resolvedWatermarkOpacity,
      watermarkPosition: resolvedWatermarkPos,
      watermarkSize: resolvedWatermarkSize,
      watermarkAssetId: resolvedWatermarkAssetId,
      watermarkFilename: resolvedWatermarkFilename,
      progressBarEnabled: global.overlay.progressBarEnabled,
      progressBarColor: global.overlay.progressBarColor,
      progressBarPosition: global.overlay.progressBarPosition,
    frameVariant: normalizedFrameVariant,
    frameBgColor: global.composition.bgColor,
    bezelRadiusMultiplier: global.composition.bezelRadiusMultiplier,
    layout: normalizedLayout,
    cardMode: global.composition.cardMode ?? 'preset',
    customScale: global.composition.customScale ?? 0.85,
    customAspectRatio: global.composition.customAspectRatio ?? '9:16',
    customPositionY: global.composition.customPositionY ?? 0.5,
    customBorderRadius: global.composition.customBorderRadius ?? 24,
    customBorderEnabled: global.composition.customBorderEnabled ?? false,
    customBorderWidth: global.composition.customBorderWidth ?? 2,
    customBorderColor: global.composition.customBorderColor ?? '#ffffff',
    customBorderStyle: global.composition.customBorderStyle ?? 'solid',
    customShadowEnabled: global.composition.customShadowEnabled ?? true,
    customShadowBlur: global.composition.customShadowBlur ?? 24,
    customShadowOpacity: global.composition.customShadowOpacity ?? 40,
    customBackdrop: global.composition.customBackdrop ?? 'none',
    customBackdropColor: global.composition.customBackdropColor ?? '#121214',
    customBackdropGradient: global.composition.customBackdropGradient ?? '',
    splitGap: global.composition.splitGap ?? 0,
    splitTopFocalX: global.composition.splitTopFocalX ?? 0.5,
    splitTopFocalY: global.composition.splitTopFocalY ?? 0.25,
    splitBottomFocalX: global.composition.splitBottomFocalX ?? 0.5,
    splitBottomFocalY: global.composition.splitBottomFocalY ?? 0.75,
    splitLeftFocalX: global.composition.splitLeftFocalX ?? 0.25,
    splitLeftFocalY: global.composition.splitLeftFocalY ?? 0.5,
    splitRightFocalX: global.composition.splitRightFocalX ?? 0.75,
    splitRightFocalY: global.composition.splitRightFocalY ?? 0.5,
    gradientOverlayEnabled: resolvedEffects.gradientOverlayEnabled ?? false,
    gradientOverlayColor: resolvedEffects.gradientOverlayColor ?? '#000000',
    gradientOverlayOpacity: resolvedEffects.gradientOverlayOpacity ?? 0.65,
    gradientOverlayStrength: resolvedEffects.gradientOverlayStrength ?? 0.6,
    gradientOverlayDirection: resolvedEffects.gradientOverlayDirection ?? 'bottom',
    filmDustEnabled: resolvedEffects.filmDustEnabled,
    halationEnabled: resolvedEffects.halationEnabled,
    halationIntensity: resolvedEffects.halationIntensity,
    gridEnabled: resolvedEffects.gridEnabled,
    gridIntensity: resolvedEffects.gridIntensity,
    crtScanlinesEnabled: resolvedEffects.crtScanlinesEnabled,
    crtScanlinesIntensity: resolvedEffects.crtScanlinesIntensity,
    halftoneEnabled: resolvedEffects.halftoneEnabled,
    halftoneIntensity: resolvedEffects.halftoneIntensity,
    lightLeakEnabled: resolvedEffects.lightLeakEnabled,
    lightLeakIntensity: resolvedEffects.lightLeakIntensity,
    chromaticAberrationEnabled: resolvedEffects.chromaticAberrationEnabled,
    chromaticAberrationIntensity: resolvedEffects.chromaticAberrationIntensity,
    filmGrainEnabled: resolvedEffects.filmGrainEnabled,
    filmGrainIntensity: resolvedEffects.filmGrainIntensity,
    audioPulseEnabled: resolvedEffects.audioPulseEnabled,
    audioPulseIntensity: resolvedEffects.audioPulseIntensity,
    keywordPunchEnabled: resolvedEffects.keywordPunchEnabled,
    keywordPunchIntensity: resolvedEffects.keywordPunchIntensity,
    codeBlockEnabled: global.motion.codeBlockEnabled,
    codeBlockCode: global.motion.codeBlockCode,
    codeBlockLanguage: global.motion.codeBlockLanguage,
    codeBlockPosition: global.motion.codeBlockPosition,
    codeBlockLinesPerPage: global.motion.codeBlockLinesPerPage,
    numberCounterEnabled: global.motion.numberCounterEnabled,
    numberCounterStart: global.motion.numberCounterStart,
    numberCounterEnd: global.motion.numberCounterEnd,
    numberCounterPrefix: global.motion.numberCounterPrefix,
    numberCounterSuffix: global.motion.numberCounterSuffix,
    tickerEnabled: global.motion.tickerEnabled,
    tickerText: global.motion.tickerText,
    tickerDirection: global.motion.tickerDirection,
    tickerPosition: global.motion.tickerPosition,
    videoMotion: resolvedVideoMotion,
    transitionOverlays: assetSettings.transitionOverlays,
    soundEffects: assetSettings.soundEffects,
  };

    return {
      projectId: project.id,
      projectName: project.name,
      captions,
      styleVariant: normalizedAnimation,
      styleOverrides,
      overlaySettings: {
        ...global.overlay,
        watermarkEnabled: resolvedWatermarkEnabled,
        watermarkOpacity: resolvedWatermarkOpacity,
        watermarkPosition: resolvedWatermarkPos,
        watermarkSize: resolvedWatermarkSize,
        watermarkAssetId: resolvedWatermarkAssetId,
        watermarkFilename: resolvedWatermarkFilename,
        watermark: {
          enabled: resolvedWatermarkEnabled,
          assetId: resolvedWatermarkAssetId,
          position: resolvedWatermarkPos,
          size: resolvedWatermarkSize <= 1 ? resolvedWatermarkSize : resolvedWatermarkSize / 100,
          opacity: resolvedWatermarkOpacity <= 1 ? resolvedWatermarkOpacity : resolvedWatermarkOpacity / 100,
        },
      },
    frameSettings: {
      ...global.composition,
      layout: normalizedLayout,
      variant: normalizedFrameVariant,
    },
    textureSettings: resolvedEffects,
    motionSettings: global.motion,
    videoMotion: resolvedVideoMotion,
    assetSettings,
    durationInFrames: project.durationInFrames,
    rawSettings,
  };
}

/**
 * Groups a sequence of captions into cohesive CreativeBeats.
 */
export function convertCaptionsToCreativeBeats(
  captions: Caption[],
  fps = DEFAULT_FPS,
): CreativeBeat[] {
  if (!captions || captions.length === 0) {
    return [
      {
        id: 'beat_01',
        type: 'hook',
        startFrame: 0,
        endFrame: 150,
        content: { text: '' },
      },
    ];
  }

  const beats: CreativeBeat[] = [];
  let currentWords: CreativeBeatWord[] = [];
  let currentCaptions: Caption[] = [];
  let beatIndex = 1;

  for (let i = 0; i < captions.length; i++) {
    const cap = captions[i];
    const wordText = cap.text.trim();
    currentCaptions.push(cap);
    currentWords.push({
      text: cap.text,
      startMs: cap.startMs,
      endMs: cap.endMs,
      confidence: cap.confidence,
    });

    const isSentenceEnd = /[.!?]$/.test(wordText);
    const isLast = i === captions.length - 1;
    const nextCap = captions[i + 1];
    const hasLongPause = nextCap && (nextCap.startMs - cap.endMs > 600);

    // Group roughly 8-15 words per beat or at punctuation pauses
    const reachedWordBudget = currentWords.length >= 10;

    if (isSentenceEnd || hasLongPause || reachedWordBudget || isLast) {
      const beatStartMs = currentWords[0].startMs;
      const beatEndMs = currentWords[currentWords.length - 1].endMs;
      const startFrame = Math.max(0, Math.floor((beatStartMs / 1000) * fps));
      const endFrame = Math.max(startFrame + 1, Math.ceil((beatEndMs / 1000) * fps));

      let semanticRole = 'core_point';
      if (beatIndex === 1) semanticRole = 'hook';
      else if (beatIndex === 2) semanticRole = 'setup';
      else if (isLast) semanticRole = 'payoff';

      const content: CreativeBeatContent = {
        text: currentWords.map((w) => w.text).join('').trim(),
        words: [...currentWords],
        captions: [...currentCaptions],
      };

      beats.push({
        id: `beat_${String(beatIndex).padStart(2, '0')}`,
        type: semanticRole,
        startFrame,
        endFrame,
        content,
      });

      beatIndex++;
      currentWords = [];
      currentCaptions = [];
    }
  }

  // Ensure beat frames are contiguous and strictly increasing
  for (let i = 0; i < beats.length; i++) {
    if (i > 0 && beats[i].startFrame < beats[i - 1].endFrame) {
      beats[i].startFrame = beats[i - 1].endFrame;
      if (beats[i].endFrame <= beats[i].startFrame) {
        beats[i].endFrame = beats[i].startFrame + 15;
      }
    }
  }

  return beats;
}

/**
 * Converts existing ProjectContext state into a CreativeProject document.
 */
export function convertProjectStateToCreativeProject(
  input: ProjectStateExportInput,
  fps = DEFAULT_FPS,
): CreativeProject {
  const captions = input.captions ? ensureWordLevelCaptions(input.captions) : [];

  let maxCaptionEndMs = 0;
  if (captions.length > 0) {
    maxCaptionEndMs = Math.max(...captions.map((c: { endMs: number }) => c.endMs));
  }
  const computedDurationInFrames = maxCaptionEndMs > 0
    ? Math.ceil((maxCaptionEndMs / 1000) * fps)
    : 150;

  const durationInFrames = Math.max(
    input.durationInFrames && input.durationInFrames > 0 ? input.durationInFrames : 0,
    computedDurationInFrames,
  );

  const beats = convertCaptionsToCreativeBeats(captions, fps);

  // If there's only 1 beat covering empty content, set duration properly
  if (beats.length === 1 && beats[0].endFrame < durationInFrames) {
    beats[0].endFrame = durationInFrames;
  }

  // Associate transitions to enclosing beats
  if (input.transitionOverlays && input.transitionOverlays.length > 0) {
    input.transitionOverlays.forEach((trans) => {
      const targetBeat = beats.find((b) => trans.startFrame >= b.startFrame && trans.startFrame < b.endFrame) ?? beats[0];
      if (targetBeat && !targetBeat.transition) {
        targetBeat.transition = {
          id: trans.id,
          assetId: trans.assetId,
          startFrame: trans.startFrame,
          durationInFrames: trans.durationInFrames,
          opacity: trans.opacity,
        };
      }
    });
  }

  // Associate SFX to enclosing beats
  if (input.soundEffects && input.soundEffects.length > 0) {
    input.soundEffects.forEach((sfx) => {
      const targetBeat = beats.find((b) => sfx.startFrame >= b.startFrame && sfx.startFrame < b.endFrame) ?? beats[0];
      if (targetBeat) {
        const sfxPlacement = {
          id: sfx.id,
          assetId: sfx.assetId,
          startFrame: sfx.startFrame,
          volume: sfx.volume,
        };
        if (!targetBeat.sfx) {
          targetBeat.sfx = sfxPlacement;
        } else if (Array.isArray(targetBeat.sfx)) {
          targetBeat.sfx.push(sfxPlacement);
        } else {
          targetBeat.sfx = [targetBeat.sfx, sfxPlacement];
        }
      }
    });
  }

  const typography: CreativeTypographySettings = {
    presetName: input.presetName,
    fontWeight: input.fontWeight ?? undefined,
    fontSizeMultiplier: input.fontSizeMultiplier,
    textColor: input.textColor,
    position: input.position,
    captionPositionY: input.captionPositionY,
    textAlign: input.textAlign,
    strokeEnabled: input.strokeEnabled,
    strokeColor: input.strokeColor,
    strokeWidth: input.strokeWidth,
    shadowEnabled: input.shadowEnabled,
    glowEnabled: input.glowEnabled,
    glowColor: input.glowColor,
    glowIntensity: input.glowIntensity,
    glowBlur: input.glowBlur,
    glowOpacity: input.glowOpacity,
    gradientEnabled: input.gradientEnabled,
    gradientStart: input.gradientStart,
    gradientEnd: input.gradientEnd,
    gradientAngle: input.gradientAngle,
    letterSpacing: input.letterSpacing,
    lineHeight: input.lineHeight,
    textTransform: input.textTransform,
    backdropEnabled: input.backdropEnabled,
    backdropColor: input.backdropColor,
    backdropOpacity: input.backdropOpacity,
    backdropRadius: input.backdropRadius,
    backdropPaddingX: input.backdropPaddingX,
    backdropPaddingY: input.backdropPaddingY,
    keywordHighlightEnabled: input.keywordHighlightEnabled,
    highlightIntensity: input.highlightIntensity,
    highlightColor: input.highlightColor,
    keywords: input.keywords,
    wordOverrides: input.wordOverrides,
  };

  const watermarkAssetId = input.watermarkAssetId || (input.watermarkFilename ? 'watermark_01' : undefined);
  const normalizedWatermarkPos = normalizeWatermarkPosition(input.watermarkPosition) || 'bottom-right';
  const wmOpacityPercent = input.watermarkOpacity !== undefined ? input.watermarkOpacity : 70;
  const wmOpacityNormalized = wmOpacityPercent <= 1 ? wmOpacityPercent : wmOpacityPercent / 100;
  const wmSizePercent = input.watermarkSize !== undefined ? input.watermarkSize : 15;
  const wmSizeNormalized = wmSizePercent <= 1 ? wmSizePercent : wmSizePercent / 100;

  const mediaAssets: CreativeMediaAsset[] = [];
  if (input.mediaFileName) {
    mediaAssets.push({
      id: 'video_main',
      type: 'video',
      name: input.mediaFileName,
      durationInFrames,
    });
  }
  if (input.watermarkFilename) {
    mediaAssets.push({
      id: watermarkAssetId || 'watermark_01',
      type: 'image',
      name: input.watermarkFilename,
    });
  }

  const project = createDefaultCreativeProject({
    id: input.projectId,
    name: input.projectName,
    fps,
    durationInFrames,
    input: {
      mode: captions.length > 0 ? 'transcript' : 'idea',
      text: captions.map((c: { text: string }) => c.text).join(' ').trim(),
    },
    content: {
      text: captions.map((c: { text: string }) => c.text).join(' ').trim(),
      transcript: captions,
    },
    creativeIntent: {
      contentType: 'educational',
      tone: 'punchy',
      energy: 'medium',
      pacing: 'moderate',
      visualStyle: 'modern_bold',
    },
    beats,
    globalSettings: {
      typography,
      animation: input.animation,
      effects: {
        gradientOverlayEnabled: input.gradientOverlayEnabled ?? false,
        gradientOverlayColor: input.gradientOverlayColor ?? '#000000',
        gradientOverlayOpacity: input.gradientOverlayOpacity ?? 0.65,
        gradientOverlayStrength: input.gradientOverlayStrength ?? 0.6,
        gradientOverlayDirection: input.gradientOverlayDirection ?? 'bottom',
        filmDustEnabled: input.filmDustEnabled,
        halationEnabled: input.halationEnabled,
        halationIntensity: input.halationIntensity,
        gridEnabled: input.gridEnabled,
        gridIntensity: input.gridIntensity,
        crtScanlinesEnabled: input.crtScanlinesEnabled,
        crtScanlinesIntensity: input.crtScanlinesIntensity,
        halftoneEnabled: input.halftoneEnabled,
        halftoneIntensity: input.halftoneIntensity,
        lightLeakEnabled: input.lightLeakEnabled,
        lightLeakIntensity: input.lightLeakIntensity,
        chromaticAberrationEnabled: input.chromaticAberrationEnabled,
        chromaticAberrationIntensity: input.chromaticAberrationIntensity,
        filmGrainEnabled: input.filmGrainEnabled,
        filmGrainIntensity: input.filmGrainIntensity,
        audioPulseEnabled: input.audioPulseEnabled,
        audioPulseIntensity: input.audioPulseIntensity,
        keywordPunchEnabled: input.keywordPunchEnabled,
        keywordPunchIntensity: input.keywordPunchIntensity,
      },
      composition: {
        variant: input.frameVariant,
        bgColor: input.frameBgColor,
        bezelRadiusMultiplier: input.bezelRadiusMultiplier,
        layout: input.layout,
        cardMode: input.cardMode,
        customScale: input.customScale,
        customAspectRatio: input.customAspectRatio,
        customPositionY: input.customPositionY,
        customBorderRadius: input.customBorderRadius,
        customBorderEnabled: input.customBorderEnabled,
        customBorderWidth: input.customBorderWidth,
        customBorderColor: input.customBorderColor,
        customBorderStyle: input.customBorderStyle,
        customShadowEnabled: input.customShadowEnabled,
        customShadowBlur: input.customShadowBlur,
        customShadowOpacity: input.customShadowOpacity,
        customBackdrop: input.customBackdrop,
        customBackdropColor: input.customBackdropColor,
        customBackdropGradient: input.customBackdropGradient,
        splitGap: input.splitGap,
        splitTopFocalX: input.splitTopFocalX,
        splitTopFocalY: input.splitTopFocalY,
        splitBottomFocalX: input.splitBottomFocalX,
        splitBottomFocalY: input.splitBottomFocalY,
        splitLeftFocalX: input.splitLeftFocalX,
        splitLeftFocalY: input.splitLeftFocalY,
        splitRightFocalX: input.splitRightFocalX,
        splitRightFocalY: input.splitRightFocalY,
      },
      overlay: {
        watermarkEnabled: input.watermarkEnabled ?? false,
        watermarkOpacity: wmOpacityPercent,
        watermarkPosition: normalizedWatermarkPos,
        watermarkSize: wmSizePercent,
        watermarkAssetId,
        watermarkFilename: input.watermarkFilename,
        watermark: {
          enabled: input.watermarkEnabled ?? false,
          assetId: watermarkAssetId,
          position: normalizedWatermarkPos,
          size: wmSizeNormalized,
          opacity: wmOpacityNormalized,
        },
        progressBarEnabled: input.progressBarEnabled,
        progressBarColor: input.progressBarColor,
        progressBarPosition: input.progressBarPosition,
      },
      motion: {
        codeBlockEnabled: input.codeBlockEnabled,
        codeBlockCode: input.codeBlockCode,
        codeBlockLanguage: input.codeBlockLanguage,
        codeBlockPosition: input.codeBlockPosition,
        codeBlockLinesPerPage: input.codeBlockLinesPerPage,
        numberCounterEnabled: input.numberCounterEnabled,
        numberCounterStart: input.numberCounterStart,
        numberCounterEnd: input.numberCounterEnd,
        numberCounterPrefix: input.numberCounterPrefix,
        numberCounterSuffix: input.numberCounterSuffix,
        tickerEnabled: input.tickerEnabled,
        tickerText: input.tickerText,
        tickerDirection: input.tickerDirection,
        tickerPosition: input.tickerPosition,
      },
      videoMotion: input.videoMotion,
    },
    assets: {
      media: mediaAssets,
      transitions: Array.from(new Set((input.transitionOverlays || []).map((t) => t.assetId))),
      sfx: Array.from(new Set((input.soundEffects || []).map((s) => s.assetId))),
    },
  });

  return project;
}

/**
 * Resolves whether existing project media should be preserved or cleared when loading a CreativeProject.
 *
 * Rules:
 * 1. If Creative JSON has NO media reference -> preserve the currently loaded video.
 * 2. If Creative JSON references media that matches the currently loaded video -> preserve/reuse current video.
 * 3. If Creative JSON references a different media asset and that asset is NOT currently loaded/available ->
 *    clear the current video rather than showing the wrong footage.
 * 4. Never assume "video_main" means "whatever video is currently loaded".
 */
export function resolveCreativeProjectMedia(
  project: CreativeProject,
  currentMediaFile: { name: string; size?: number; type?: string } | null,
  currentSrtFile?: { name: string } | null,
): MediaResolutionResult {
  const mediaAssets = project.assets?.media ?? [];
  const referencedAssets = mediaAssets.filter((m) => m && (m.type === 'video' || m.type === 'audio' || !m.type));

  // Check if beats reference any specific media asset IDs that aren't in assets.media
  const beatMediaIds = new Set<string>();
  project.beats.forEach((b) => {
    if (b.media) {
      if (Array.isArray(b.media)) {
        b.media.forEach((m) => m.assetId && beatMediaIds.add(m.assetId));
      } else if (b.media.assetId) {
        beatMediaIds.add(b.media.assetId);
      }
    }
  });

  const hasMediaReferences = referencedAssets.length > 0 || beatMediaIds.size > 0;

  // Case 1: Creative JSON has NO media reference at all -> preserve existing media
  if (!hasMediaReferences) {
    return {
      action: 'preserve',
      reason: 'No media reference in Creative JSON; preserving currently loaded workspace media.',
    };
  }

  // If no media is currently loaded in the workspace, nothing to preserve or clear
  if (!currentMediaFile) {
    return {
      action: 'none',
      reason: 'No media currently loaded in workspace.',
    };
  }

  const currentFileName = currentMediaFile.name.toLowerCase();
  const currentBaseName = currentFileName.replace(/\.[^/.]+$/, '');

  // Helper to check if an asset matches the currently loaded media
  const matchesCurrentMedia = (asset: CreativeMediaAsset): boolean => {
    if (asset.name) {
      const assetName = asset.name.toLowerCase();
      const assetBaseName = assetName.replace(/\.[^/.]+$/, '');
      if (assetName === currentFileName || assetBaseName === currentBaseName) {
        return true;
      }
    }
    if (asset.id && asset.id !== 'video_main') {
      const assetId = asset.id.toLowerCase();
      const assetIdBase = assetId.replace(/\.[^/.]+$/, '');
      if (assetId === currentFileName || assetIdBase === currentBaseName) {
        return true;
      }
    }
    return false;
  };

  // Check if any declared media asset matches current file
  const matchingAsset = referencedAssets.find(matchesCurrentMedia);
  if (matchingAsset) {
    return {
      action: 'preserve',
      reason: `Referenced media "${matchingAsset.name || matchingAsset.id}" matches current video "${currentMediaFile.name}".`,
      matchedAsset: matchingAsset,
    };
  }

  // Check if input SRT or file name matches
  if (project.input && 'fileName' in project.input && typeof project.input.fileName === 'string') {
    const srtFileName = project.input.fileName.toLowerCase();
    const srtBaseName = srtFileName.replace(/\.[^/.]+$/, '');
    if (
      srtFileName === currentFileName ||
      srtBaseName === currentBaseName ||
      (currentSrtFile && srtFileName === currentSrtFile.name.toLowerCase())
    ) {
      return {
        action: 'preserve',
        reason: `Input file reference "${project.input.fileName}" matches current media or SRT.`,
      };
    }
  }

  // Case 3: Creative JSON references a different media asset that is not loaded -> clear current video
  const targetAssetName = referencedAssets[0]?.name || referencedAssets[0]?.id || Array.from(beatMediaIds)[0] || 'referenced media';
  return {
    action: 'clear',
    reason: `Creative JSON references media "${targetAssetName}" which does not match current loaded video "${currentMediaFile.name}".`,
    requiredAssetName: targetAssetName,
  };
}

/**
 * Converts an SRT text string into CreativeBeats and word-level Captions.
 */
export function convertSrtToCreativeBeats(
  srtText: string,
  fps = DEFAULT_FPS,
): { beats: CreativeBeat[]; captions: Caption[] } {
  const { captions: rawCaptions } = parseSrt({ input: srtText });
  const wordCaptions = ensureWordLevelCaptions(rawCaptions);
  const beats = convertCaptionsToCreativeBeats(wordCaptions, fps);
  return { beats, captions: wordCaptions };
}
