import type {
  CreativeProject,
} from './types.js';
import {
  DEFAULT_FPS,
  getMaxProjectFrames,
} from './defaults.js';
import {
  isRegisteredSfxAsset,
  isRegisteredTransitionAsset,
  normalizeAnimationVariant,
  normalizeCompositionLayout,
  normalizeFontPresetName,
  normalizeFrameVariant,
  normalizeVideoMotionType,
  SUPPORTED_ANIMATION_VARIANTS,
  SUPPORTED_COMPOSITION_LAYOUTS,
  SUPPORTED_FRAME_VARIANTS,
  SUPPORTED_GRADIENT_OVERLAY_DIRECTIONS,
  SUPPORTED_VIDEO_MOTION_TYPES,
  SUPPORTED_WATERMARK_POSITIONS,
  VALID_GRADIENT_OVERLAY_DIRECTIONS,
  VALID_INPUT_MODES,
  normalizeWatermarkPosition,
} from './schema.js';

export type ValidationError = {
  path: string;
  message: string;
  code: string;
};

export type ValidationResult<T> = {
  isValid: boolean;
  errors: ValidationError[];
  data?: T;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateTransitionPlacement(
  transition: unknown,
  pathPrefix: string,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!isPlainObject(transition)) {
    errors.push({
      path: pathPrefix,
      message: 'Transition placement must be an object',
      code: 'INVALID_TRANSITION',
    });
    return errors;
  }

  if (typeof transition.assetId !== 'string' || !transition.assetId.trim()) {
    errors.push({
      path: `${pathPrefix}.assetId`,
      message: 'Transition assetId is required and must be a non-empty string',
      code: 'MISSING_TRANSITION_ASSET_ID',
    });
  } else if (!isRegisteredTransitionAsset(transition.assetId.trim())) {
    errors.push({
      path: `${pathPrefix}.assetId`,
      message: `Unknown transition assetId '${transition.assetId}'. Must be a registered transition asset (e.g. 'flash', 'film_burn').`,
      code: 'UNKNOWN_TRANSITION_ASSET_ID',
    });
  }

  if (typeof transition.startFrame !== 'number' || transition.startFrame < 0 || !Number.isFinite(transition.startFrame)) {
    errors.push({
      path: `${pathPrefix}.startFrame`,
      message: 'Transition startFrame must be a non-negative finite number',
      code: 'INVALID_TRANSITION_START_FRAME',
    });
  }

  if (typeof transition.durationInFrames !== 'number' || transition.durationInFrames <= 0 || !Number.isFinite(transition.durationInFrames)) {
    errors.push({
      path: `${pathPrefix}.durationInFrames`,
      message: 'Transition durationInFrames must be a positive finite number',
      code: 'INVALID_TRANSITION_DURATION',
    });
  }

  if (transition.opacity !== undefined) {
    if (typeof transition.opacity !== 'number' || transition.opacity < 0 || transition.opacity > 1 || !Number.isFinite(transition.opacity)) {
      errors.push({
        path: `${pathPrefix}.opacity`,
        message: 'Transition opacity must be a number between 0.0 and 1.0',
        code: 'INVALID_TRANSITION_OPACITY',
      });
    }
  }

  return errors;
}

export function validateSfxPlacement(
  sfx: unknown,
  pathPrefix: string,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!isPlainObject(sfx)) {
    errors.push({
      path: pathPrefix,
      message: 'SFX placement must be an object',
      code: 'INVALID_SFX',
    });
    return errors;
  }

  if (typeof sfx.assetId !== 'string' || !sfx.assetId.trim()) {
    errors.push({
      path: `${pathPrefix}.assetId`,
      message: 'SFX assetId is required and must be a non-empty string',
      code: 'MISSING_SFX_ASSET_ID',
    });
  } else if (!isRegisteredSfxAsset(sfx.assetId.trim())) {
    errors.push({
      path: `${pathPrefix}.assetId`,
      message: `Unknown SFX assetId '${sfx.assetId}'. Must be a registered sound effect asset (e.g. 'impact', 'vine_boom').`,
      code: 'UNKNOWN_SFX_ASSET_ID',
    });
  }

  if (typeof sfx.startFrame !== 'number' || sfx.startFrame < 0 || !Number.isFinite(sfx.startFrame)) {
    errors.push({
      path: `${pathPrefix}.startFrame`,
      message: 'SFX startFrame must be a non-negative finite number',
      code: 'INVALID_SFX_START_FRAME',
    });
  }

  if (sfx.volume !== undefined) {
    if (typeof sfx.volume !== 'number' || sfx.volume < 0 || sfx.volume > 1 || !Number.isFinite(sfx.volume)) {
      errors.push({
        path: `${pathPrefix}.volume`,
        message: 'SFX volume must be a number between 0.0 and 1.0',
        code: 'INVALID_SFX_VOLUME',
      });
    }
  }

  return errors;
}

function isValidColorString(color: unknown): boolean {
  if (typeof color !== 'string') return false;
  const trimmed = color.trim();
  if (!trimmed) return false;
  return (
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed) ||
    /^rgba?\s*\(/.test(trimmed) ||
    /^hsla?\s*\(/.test(trimmed) ||
    /^[a-zA-Z]+$/.test(trimmed)
  );
}

export function validateEffectsSettings(
  effects: unknown,
  pathPrefix: string,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!isPlainObject(effects)) {
    errors.push({
      path: pathPrefix,
      message: 'Effects settings must be an object',
      code: 'INVALID_EFFECTS_SETTINGS',
    });
    return errors;
  }

  if (effects.gradientOverlayEnabled !== undefined && typeof effects.gradientOverlayEnabled !== 'boolean') {
    errors.push({
      path: `${pathPrefix}.gradientOverlayEnabled`,
      message: 'gradientOverlayEnabled must be a boolean',
      code: 'INVALID_GRADIENT_OVERLAY_ENABLED',
    });
  }

  if (effects.gradientOverlayColor !== undefined) {
    if (typeof effects.gradientOverlayColor !== 'string' || !isValidColorString(effects.gradientOverlayColor)) {
      errors.push({
        path: `${pathPrefix}.gradientOverlayColor`,
        message: 'gradientOverlayColor must be a valid color string (e.g. #000000)',
        code: 'INVALID_GRADIENT_OVERLAY_COLOR',
      });
    }
  }

  if (effects.gradientOverlayOpacity !== undefined) {
    if (
      typeof effects.gradientOverlayOpacity !== 'number' ||
      !Number.isFinite(effects.gradientOverlayOpacity) ||
      effects.gradientOverlayOpacity < 0 ||
      effects.gradientOverlayOpacity > 1
    ) {
      errors.push({
        path: `${pathPrefix}.gradientOverlayOpacity`,
        message: 'gradientOverlayOpacity must be a number between 0.0 and 1.0',
        code: 'INVALID_GRADIENT_OVERLAY_OPACITY',
      });
    }
  }

  if (effects.gradientOverlayStrength !== undefined) {
    if (
      typeof effects.gradientOverlayStrength !== 'number' ||
      !Number.isFinite(effects.gradientOverlayStrength) ||
      effects.gradientOverlayStrength < 0 ||
      effects.gradientOverlayStrength > 1
    ) {
      errors.push({
        path: `${pathPrefix}.gradientOverlayStrength`,
        message: 'gradientOverlayStrength must be a number between 0.0 and 1.0',
        code: 'INVALID_GRADIENT_OVERLAY_STRENGTH',
      });
    }
  }

  if (effects.gradientOverlayDirection !== undefined) {
    if (
      typeof effects.gradientOverlayDirection !== 'string' ||
      !VALID_GRADIENT_OVERLAY_DIRECTIONS.has(effects.gradientOverlayDirection)
    ) {
      errors.push({
        path: `${pathPrefix}.gradientOverlayDirection`,
        message: `Unsupported gradientOverlayDirection '${effects.gradientOverlayDirection}'. Supported directions: ${SUPPORTED_GRADIENT_OVERLAY_DIRECTIONS.join(', ')}`,
        code: 'UNSUPPORTED_GRADIENT_OVERLAY_DIRECTION',
      });
    }
  }

  return errors;
}

export function validateOverlaySettings(
  overlay: unknown,
  pathPrefix: string,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (overlay === undefined || overlay === null) return errors;

  if (!isPlainObject(overlay)) {
    errors.push({
      path: pathPrefix,
      message: 'Overlay settings must be an object',
      code: 'INVALID_OVERLAY_SETTINGS',
    });
    return errors;
  }

  // Helper to validate position
  const checkPosition = (pos: unknown, path: string) => {
    if (pos !== undefined) {
      if (typeof pos !== 'string' || !normalizeWatermarkPosition(pos)) {
        errors.push({
          path,
          message: `Unsupported watermark position '${pos}'. Supported positions: ${SUPPORTED_WATERMARK_POSITIONS.join(', ')}`,
          code: 'UNSUPPORTED_WATERMARK_POSITION',
        });
      }
    }
  };

  // Helper to validate opacity
  const checkOpacity = (op: unknown, path: string) => {
    if (op !== undefined) {
      if (
        typeof op !== 'number' ||
        !Number.isFinite(op) ||
        op < 0 ||
        op > 100
      ) {
        errors.push({
          path,
          message: 'Watermark opacity must be a finite number between 0.0 and 1.0 (or 0 to 100)',
          code: 'INVALID_WATERMARK_OPACITY',
        });
      }
    }
  };

  // Helper to validate size
  const checkSize = (sz: unknown, path: string) => {
    if (sz !== undefined) {
      if (
        typeof sz !== 'number' ||
        !Number.isFinite(sz) ||
        sz <= 0 ||
        sz > 100
      ) {
        errors.push({
          path,
          message: 'Watermark size must be a positive finite number (e.g. 0.15 or 15)',
          code: 'INVALID_WATERMARK_SIZE',
        });
      }
    }
  };

  // Helper to validate assetId
  const checkAssetId = (aid: unknown, path: string, isEnabled?: boolean) => {
    if (aid !== undefined) {
      if (typeof aid !== 'string' || !aid.trim()) {
        errors.push({
          path,
          message: 'Watermark assetId must be a non-empty string when specified',
          code: isEnabled ? 'MISSING_WATERMARK_ASSET_ID' : 'INVALID_WATERMARK_ASSET_ID',
        });
      }
    }
  };

  // 1. Check flat properties
  if (overlay.watermarkEnabled !== undefined && typeof overlay.watermarkEnabled !== 'boolean') {
    errors.push({
      path: `${pathPrefix}.watermarkEnabled`,
      message: 'watermarkEnabled must be a boolean',
      code: 'INVALID_WATERMARK_ENABLED',
    });
  }
  checkPosition(overlay.watermarkPosition, `${pathPrefix}.watermarkPosition`);
  checkOpacity(overlay.watermarkOpacity, `${pathPrefix}.watermarkOpacity`);
  checkSize(overlay.watermarkSize, `${pathPrefix}.watermarkSize`);
  checkAssetId(overlay.watermarkAssetId, `${pathPrefix}.watermarkAssetId`, overlay.watermarkEnabled === true);

  // 2. Check structured overlay.watermark if present
  if (overlay.watermark !== undefined) {
    if (!isPlainObject(overlay.watermark)) {
      errors.push({
        path: `${pathPrefix}.watermark`,
        message: 'watermark must be an object',
        code: 'INVALID_WATERMARK_CONFIG',
      });
    } else {
      const wm = overlay.watermark as Record<string, unknown>;
      if (wm.enabled !== undefined && typeof wm.enabled !== 'boolean') {
        errors.push({
          path: `${pathPrefix}.watermark.enabled`,
          message: 'Watermark enabled must be a boolean',
          code: 'INVALID_WATERMARK_ENABLED',
        });
      }
      checkPosition(wm.position, `${pathPrefix}.watermark.position`);
      checkOpacity(wm.opacity, `${pathPrefix}.watermark.opacity`);
      checkSize(wm.size, `${pathPrefix}.watermark.size`);
      checkAssetId(wm.assetId, `${pathPrefix}.watermark.assetId`, wm.enabled === true);
    }
  }

  return errors;
}

export function validateBeat(
  beat: unknown,
  index: number,
  projectDurationInFrames: number,
  maxProjectFrames: number,
): ValidationError[] {
  const errors: ValidationError[] = [];
  const pathPrefix = `beats[${index}]`;

  if (!isPlainObject(beat)) {
    errors.push({
      path: pathPrefix,
      message: 'Beat must be an object',
      code: 'INVALID_BEAT',
    });
    return errors;
  }

  if (typeof beat.id !== 'string' || !beat.id.trim()) {
    errors.push({
      path: `${pathPrefix}.id`,
      message: 'Beat id is required and must be a non-empty string',
      code: 'MISSING_BEAT_ID',
    });
  }

  if (typeof beat.type !== 'string' || !beat.type.trim()) {
    errors.push({
      path: `${pathPrefix}.type`,
      message: 'Beat type (semantic role) is required and must be a non-empty string',
      code: 'MISSING_BEAT_TYPE',
    });
  }

  const startFrame = beat.startFrame;
  const endFrame = beat.endFrame;

  if (typeof startFrame !== 'number' || !Number.isFinite(startFrame) || startFrame < 0) {
    errors.push({
      path: `${pathPrefix}.startFrame`,
      message: 'Beat startFrame must be a non-negative finite number',
      code: 'INVALID_BEAT_START_FRAME',
    });
  }

  if (typeof endFrame !== 'number' || !Number.isFinite(endFrame) || endFrame <= 0) {
    errors.push({
      path: `${pathPrefix}.endFrame`,
      message: 'Beat endFrame must be a positive finite number',
      code: 'INVALID_BEAT_END_FRAME',
    });
  }

  if (typeof startFrame === 'number' && typeof endFrame === 'number') {
    if (endFrame <= startFrame) {
      errors.push({
        path: `${pathPrefix}`,
        message: `Beat endFrame (${endFrame}) must be greater than startFrame (${startFrame})`,
        code: 'INVALID_BEAT_FRAME_RANGE',
      });
    }
    if (endFrame > maxProjectFrames) {
      errors.push({
        path: `${pathPrefix}.endFrame`,
        message: `Beat endFrame (${endFrame}) exceeds maximum allowed project duration (${maxProjectFrames} frames / 5 minutes)`,
        code: 'BEAT_EXCEEDS_MAX_DURATION',
      });
    }
    if (endFrame > projectDurationInFrames) {
      errors.push({
        path: `${pathPrefix}.endFrame`,
        message: `Beat endFrame (${endFrame}) exceeds project durationInFrames (${projectDurationInFrames})`,
        code: 'BEAT_EXCEEDS_PROJECT_DURATION',
      });
    }
  }

  if (!isPlainObject(beat.content) || typeof beat.content.text !== 'string') {
    errors.push({
      path: `${pathPrefix}.content`,
      message: 'Beat content must be an object containing a text string',
      code: 'INVALID_BEAT_CONTENT',
    });
  } else if (beat.content.words !== undefined) {
    if (!Array.isArray(beat.content.words)) {
      errors.push({
        path: `${pathPrefix}.content.words`,
        message: 'Beat content words must be an array',
        code: 'INVALID_BEAT_WORDS',
      });
    } else {
      beat.content.words.forEach((word: unknown, wIdx: number) => {
        if (!isPlainObject(word)) {
          errors.push({
            path: `${pathPrefix}.content.words[${wIdx}]`,
            message: 'Beat word must be an object',
            code: 'INVALID_BEAT_WORD',
          });
          return;
        }
        if (typeof word.text !== 'string') {
          errors.push({
            path: `${pathPrefix}.content.words[${wIdx}].text`,
            message: 'Beat word text must be a string',
            code: 'INVALID_BEAT_WORD_TEXT',
          });
        }
        if (typeof word.startMs !== 'number' || !Number.isFinite(word.startMs) || word.startMs < 0) {
          errors.push({
            path: `${pathPrefix}.content.words[${wIdx}].startMs`,
            message: 'Beat word startMs must be a non-negative finite number',
            code: 'INVALID_BEAT_WORD_START_MS',
          });
        }
        if (typeof word.endMs !== 'number' || !Number.isFinite(word.endMs) || word.endMs <= 0) {
          errors.push({
            path: `${pathPrefix}.content.words[${wIdx}].endMs`,
            message: 'Beat word endMs must be a positive finite number',
            code: 'INVALID_BEAT_WORD_END_MS',
          });
        }
        if (typeof word.startMs === 'number' && typeof word.endMs === 'number' && word.endMs <= word.startMs) {
          errors.push({
            path: `${pathPrefix}.content.words[${wIdx}]`,
            message: `Beat word endMs (${word.endMs}) must be greater than startMs (${word.startMs})`,
            code: 'INVALID_BEAT_WORD_RANGE',
          });
        }
      });
    }
  }

  // Validate visual overrides if present
  if (beat.visual !== undefined) {
    if (!isPlainObject(beat.visual)) {
      errors.push({
        path: `${pathPrefix}.visual`,
        message: 'Beat visual overrides must be an object',
        code: 'INVALID_BEAT_VISUAL',
      });
    } else {
      if (
        beat.visual.animation !== undefined &&
        typeof beat.visual.animation === 'string' &&
        !normalizeAnimationVariant(beat.visual.animation)
      ) {
        errors.push({
          path: `${pathPrefix}.visual.animation`,
          message: `Unsupported animation variant '${beat.visual.animation}' in beat visual overrides. Supported variants: ${SUPPORTED_ANIMATION_VARIANTS.join(', ')}`,
          code: 'UNSUPPORTED_ANIMATION_VARIANT',
        });
      }
      if (beat.visual.videoMotion !== undefined) {
        if (!isPlainObject(beat.visual.videoMotion)) {
          errors.push({
            path: `${pathPrefix}.visual.videoMotion`,
            message: 'Beat videoMotion must be an object',
            code: 'INVALID_BEAT_VIDEO_MOTION',
          });
        } else if (
          beat.visual.videoMotion.type !== undefined &&
          typeof beat.visual.videoMotion.type === 'string' &&
          !normalizeVideoMotionType(beat.visual.videoMotion.type)
        ) {
          errors.push({
            path: `${pathPrefix}.visual.videoMotion.type`,
            message: `Unsupported videoMotion type '${beat.visual.videoMotion.type}'. Supported types: ${SUPPORTED_VIDEO_MOTION_TYPES.join(', ')}`,
            code: 'UNSUPPORTED_VIDEO_MOTION_TYPE',
          });
        }
      }
      if (beat.visual.composition !== undefined) {
        if (!isPlainObject(beat.visual.composition)) {
          errors.push({
            path: `${pathPrefix}.visual.composition`,
            message: 'Beat composition must be an object',
            code: 'INVALID_BEAT_COMPOSITION',
          });
        } else {
          if (
            beat.visual.composition.layout !== undefined &&
            typeof beat.visual.composition.layout === 'string' &&
            !normalizeCompositionLayout(beat.visual.composition.layout)
          ) {
            errors.push({
              path: `${pathPrefix}.visual.composition.layout`,
              message: `Unsupported composition layout '${beat.visual.composition.layout}'. Supported layouts: ${SUPPORTED_COMPOSITION_LAYOUTS.join(', ')}`,
              code: 'UNSUPPORTED_COMPOSITION_LAYOUT',
            });
          }
          if (
            beat.visual.composition.variant !== undefined &&
            typeof beat.visual.composition.variant === 'string' &&
            !normalizeFrameVariant(beat.visual.composition.variant)
          ) {
            errors.push({
              path: `${pathPrefix}.visual.composition.variant`,
              message: `Unsupported frame variant '${beat.visual.composition.variant}'. Supported variants: ${SUPPORTED_FRAME_VARIANTS.join(', ')}`,
              code: 'UNSUPPORTED_FRAME_VARIANT',
            });
          }
        }
      }
      if (beat.visual.typography !== undefined && isPlainObject(beat.visual.typography)) {
        if (
          beat.visual.typography.presetName !== undefined &&
          typeof beat.visual.typography.presetName === 'string' &&
          !normalizeFontPresetName(beat.visual.typography.presetName)
        ) {
          errors.push({
            path: `${pathPrefix}.visual.typography.presetName`,
            message: `Unknown font preset '${beat.visual.typography.presetName}'`,
            code: 'UNKNOWN_FONT_PRESET',
          });
        }
      }
      if (beat.visual.effects !== undefined) {
        errors.push(...validateEffectsSettings(beat.visual.effects, `${pathPrefix}.visual.effects`));
      }
      if (beat.visual.overlay !== undefined) {
        errors.push(...validateOverlaySettings(beat.visual.overlay, `${pathPrefix}.visual.overlay`));
      }
    }
  }

  // Validate beat transition
  if (beat.transition !== undefined && beat.transition !== null) {
    errors.push(...validateTransitionPlacement(beat.transition, `${pathPrefix}.transition`));
  }

  // Validate beat SFX (can be single object or array)
  if (beat.sfx !== undefined && beat.sfx !== null) {
    if (Array.isArray(beat.sfx)) {
      beat.sfx.forEach((sfxItem, sfxIndex) => {
        errors.push(...validateSfxPlacement(sfxItem, `${pathPrefix}.sfx[${sfxIndex}]`));
      });
    } else {
      errors.push(...validateSfxPlacement(beat.sfx, `${pathPrefix}.sfx`));
    }
  }

  // Validate beat media reference if present
  if (beat.media !== undefined && beat.media !== null) {
    if (!isPlainObject(beat.media) || typeof beat.media.assetId !== 'string' || !beat.media.assetId.trim()) {
      errors.push({
        path: `${pathPrefix}.media`,
        message: 'Beat media reference must be an object with a non-empty assetId string',
        code: 'INVALID_BEAT_MEDIA_REF',
      });
    }
  }

  return errors;
}

export function validateCreativeProject(data: unknown): ValidationResult<CreativeProject> {
  const errors: ValidationError[] = [];

  if (!isPlainObject(data)) {
    return {
      isValid: false,
      errors: [
        {
          path: '',
          message: 'Creative project document must be a non-null object',
          code: 'INVALID_ROOT',
        },
      ],
    };
  }

  // 1. Version check
  if (typeof data.version !== 'number' || data.version <= 0 || !Number.isInteger(data.version)) {
    errors.push({
      path: 'version',
      message: 'Creative project version must be a positive integer',
      code: 'INVALID_VERSION',
    });
  }

  // 2. ID check
  if (typeof data.id !== 'string' || !data.id.trim()) {
    errors.push({
      path: 'id',
      message: 'Project id is required and must be a non-empty string',
      code: 'MISSING_PROJECT_ID',
    });
  }

  // 3. Name check
  if (data.name !== undefined && typeof data.name !== 'string') {
    errors.push({
      path: 'name',
      message: 'Project name must be a string',
      code: 'INVALID_PROJECT_NAME',
    });
  }

  // 4. FPS check
  const fps = typeof data.fps === 'number' && data.fps > 0 ? data.fps : DEFAULT_FPS;
  if (data.fps !== undefined && (typeof data.fps !== 'number' || data.fps <= 0 || !Number.isFinite(data.fps))) {
    errors.push({
      path: 'fps',
      message: 'Project fps must be a positive finite number',
      code: 'INVALID_FPS',
    });
  }

  // 5. Duration check (5-minute maximum = 300 seconds * fps)
  const maxProjectFrames = getMaxProjectFrames(fps);
  if (typeof data.durationInFrames !== 'number' || data.durationInFrames <= 0 || !Number.isFinite(data.durationInFrames)) {
    errors.push({
      path: 'durationInFrames',
      message: 'Project durationInFrames must be a positive finite number',
      code: 'INVALID_DURATION',
    });
  } else if (data.durationInFrames > maxProjectFrames) {
    errors.push({
      path: 'durationInFrames',
      message: `Project duration (${data.durationInFrames} frames) exceeds the maximum allowed 5-minute limit (${maxProjectFrames} frames at ${fps} fps)`,
      code: 'PROJECT_DURATION_EXCEEDS_5_MINUTES',
    });
  }

  const projectDurationInFrames = typeof data.durationInFrames === 'number' && data.durationInFrames > 0
    ? data.durationInFrames
    : maxProjectFrames;

  // 6. Input mode check
  if (!isPlainObject(data.input)) {
    errors.push({
      path: 'input',
      message: 'Project input configuration is required and must be an object',
      code: 'MISSING_INPUT',
    });
  } else {
    if (typeof data.input.mode !== 'string' || !VALID_INPUT_MODES.has(data.input.mode)) {
      errors.push({
        path: 'input.mode',
        message: `Invalid input mode '${data.input.mode}'. Supported modes: 'idea', 'srt', 'transcript', 'text'`,
        code: 'INVALID_INPUT_MODE',
      });
    }
    if (data.input.sourceLanguage !== undefined && (typeof data.input.sourceLanguage !== 'string' || !data.input.sourceLanguage.trim())) {
      errors.push({
        path: 'input.sourceLanguage',
        message: 'input.sourceLanguage must be a non-empty string when specified',
        code: 'INVALID_SOURCE_LANGUAGE',
      });
    }
    if (data.input.outputLanguage !== undefined && (typeof data.input.outputLanguage !== 'string' || !data.input.outputLanguage.trim())) {
      errors.push({
        path: 'input.outputLanguage',
        message: 'input.outputLanguage must be a non-empty string when specified',
        code: 'INVALID_OUTPUT_LANGUAGE',
      });
    }
  }

  // 7. Global settings check
  if (!isPlainObject(data.globalSettings)) {
    errors.push({
      path: 'globalSettings',
      message: 'Project globalSettings is required and must be an object',
      code: 'MISSING_GLOBAL_SETTINGS',
    });
  } else {
    const gs = data.globalSettings;
    if (
      gs.animation !== undefined &&
      typeof gs.animation === 'string' &&
      !normalizeAnimationVariant(gs.animation)
    ) {
      errors.push({
        path: 'globalSettings.animation',
        message: `Unsupported global animation variant '${gs.animation}'. Supported variants: ${SUPPORTED_ANIMATION_VARIANTS.join(', ')}`,
        code: 'UNSUPPORTED_ANIMATION_VARIANT',
      });
    }
    if (isPlainObject(gs.typography)) {
      if (
        gs.typography.presetName !== undefined &&
        typeof gs.typography.presetName === 'string' &&
        !normalizeFontPresetName(gs.typography.presetName)
      ) {
        errors.push({
          path: 'globalSettings.typography.presetName',
          message: `Unknown font preset '${gs.typography.presetName}'`,
          code: 'UNKNOWN_FONT_PRESET',
        });
      }
    }
    if (isPlainObject(gs.composition)) {
      if (
        gs.composition.layout !== undefined &&
        typeof gs.composition.layout === 'string' &&
        !normalizeCompositionLayout(gs.composition.layout)
      ) {
        errors.push({
          path: 'globalSettings.composition.layout',
          message: `Unsupported composition layout '${gs.composition.layout}'. Supported layouts: ${SUPPORTED_COMPOSITION_LAYOUTS.join(', ')}`,
          code: 'UNSUPPORTED_COMPOSITION_LAYOUT',
        });
      }
      if (
        gs.composition.variant !== undefined &&
        typeof gs.composition.variant === 'string' &&
        !normalizeFrameVariant(gs.composition.variant)
      ) {
        errors.push({
          path: 'globalSettings.composition.variant',
          message: `Unsupported frame variant '${gs.composition.variant}'. Supported variants: ${SUPPORTED_FRAME_VARIANTS.join(', ')}`,
          code: 'UNSUPPORTED_FRAME_VARIANT',
        });
      }
    }
    if (isPlainObject(gs.videoMotion)) {
      if (
        gs.videoMotion.type !== undefined &&
        typeof gs.videoMotion.type === 'string' &&
        !normalizeVideoMotionType(gs.videoMotion.type)
      ) {
        errors.push({
          path: 'globalSettings.videoMotion.type',
          message: `Unsupported videoMotion type '${gs.videoMotion.type}'. Supported types: ${SUPPORTED_VIDEO_MOTION_TYPES.join(', ')}`,
          code: 'UNSUPPORTED_VIDEO_MOTION_TYPE',
        });
      }
    }
    if (gs.effects !== undefined) {
      errors.push(...validateEffectsSettings(gs.effects, 'globalSettings.effects'));
    }
    if (gs.overlay !== undefined) {
      errors.push(...validateOverlaySettings(gs.overlay, 'globalSettings.overlay'));
    }
  }

  // 8. Beats check
  if (!Array.isArray(data.beats)) {
    errors.push({
      path: 'beats',
      message: 'Project beats must be an array',
      code: 'INVALID_BEATS',
    });
  } else {
    const seenBeatIds = new Set<string>();
    let previousBeat: {
      id: string;
      startFrame: number;
      endFrame: number;
      content?: {
        text?: string;
        words?: Array<{ text?: string; startMs?: number; endMs?: number }>;
      };
    } | null = null;

    data.beats.forEach((beat, index) => {
      const beatErrors = validateBeat(beat, index, projectDurationInFrames, maxProjectFrames);
      errors.push(...beatErrors);

      if (isPlainObject(beat) && typeof beat.id === 'string' && beat.id.trim()) {
        if (seenBeatIds.has(beat.id)) {
          errors.push({
            path: `beats[${index}].id`,
            message: `Duplicate beat ID '${beat.id}' found`,
            code: 'DUPLICATE_BEAT_ID',
          });
        }
        seenBeatIds.add(beat.id);
      }

      // Check sequential ordering, non-overlap, and duplicate content with previous beat
      if (
        isPlainObject(beat) &&
        typeof beat.startFrame === 'number' &&
        typeof beat.endFrame === 'number' &&
        Number.isFinite(beat.startFrame) &&
        Number.isFinite(beat.endFrame)
      ) {
        if (previousBeat !== null) {
          // Check for overlapping beats (next.startFrame < previous.endFrame)
          if (beat.startFrame < previousBeat.endFrame) {
            const overlapDuration = previousBeat.endFrame - beat.startFrame;
            const prevId = previousBeat.id || `beats[${index - 1}]`;
            const currentId = (typeof beat.id === 'string' && beat.id) || `beats[${index}]`;
            errors.push({
              path: `beats[${index}].startFrame`,
              message: `Overlapping beats detected: '${prevId}' (ends at frame ${previousBeat.endFrame}) overlaps with '${currentId}' (starts at frame ${beat.startFrame}) by ${overlapDuration} frames. Adjacent beats must be strictly sequential (next.startFrame >= previous.endFrame).`,
              code: 'OVERLAPPING_BEATS',
            });
          }

          // Check for duplicate source words / duplicate content in adjacent beats
          if (previousBeat.content && isPlainObject(beat.content)) {
            const prevText = typeof previousBeat.content.text === 'string' ? previousBeat.content.text.trim() : '';
            const currText = typeof (beat.content as Record<string, unknown>).text === 'string'
              ? ((beat.content as Record<string, unknown>).text as string).trim()
              : '';

            // Duplicate exact text check
            if (prevText && currText && prevText === currText) {
              const prevId = previousBeat.id || `beats[${index - 1}]`;
              const currentId = (typeof beat.id === 'string' && beat.id) || `beats[${index}]`;
              errors.push({
                path: `beats[${index}].content.text`,
                message: `Duplicate beat content detected: '${currentId}' duplicates the exact text of adjacent beat '${prevId}': "${currText}"`,
                code: 'DUPLICATE_BEAT_CONTENT',
              });
            }

            // Duplicate word timestamps / words check if words arrays are provided
            const prevWords = Array.isArray(previousBeat.content.words) ? previousBeat.content.words : [];
            const currWords = Array.isArray((beat.content as Record<string, unknown>).words)
              ? ((beat.content as Record<string, unknown>).words as Array<Record<string, unknown>>)
              : [];
            if (prevWords.length > 0 && currWords.length > 0) {
              const prevWordIntervals = prevWords
                .filter((w) => typeof w.startMs === 'number' && typeof w.endMs === 'number')
                .map((w) => ({ text: String(w.text || '').trim(), startMs: w.startMs as number, endMs: w.endMs as number }));

              for (let wIdx = 0; wIdx < currWords.length; wIdx++) {
                const cw = currWords[wIdx];
                if (typeof cw.startMs === 'number' && typeof cw.endMs === 'number') {
                  const matchingWord = prevWordIntervals.find(
                    (pw) => pw.startMs === cw.startMs && pw.endMs === cw.endMs
                  );
                  if (matchingWord) {
                    const prevId = previousBeat.id || `beats[${index - 1}]`;
                    const currentId = (typeof beat.id === 'string' && beat.id) || `beats[${index}]`;
                    errors.push({
                      path: `beats[${index}].content.words[${wIdx}]`,
                      message: `Duplicate word detected: '${currentId}' word "${cw.text ?? matchingWord.text}" (${cw.startMs}ms–${cw.endMs}ms) duplicates word from adjacent beat '${prevId}'`,
                      code: 'DUPLICATE_BEAT_WORDS',
                    });
                    break;
                  }
                }
              }
            }
          }
        }

        previousBeat = {
          id: typeof beat.id === 'string' ? beat.id : `beats[${index}]`,
          startFrame: beat.startFrame,
          endFrame: beat.endFrame,
          content: isPlainObject(beat.content)
            ? (beat.content as { text?: string; words?: Array<{ text?: string; startMs?: number; endMs?: number }> })
            : undefined,
        };
      }
    });
  }

  // 9. Assets references check (if provided)
  if (data.assets !== undefined) {
    if (!isPlainObject(data.assets)) {
      errors.push({
        path: 'assets',
        message: 'Project assets must be an object',
        code: 'INVALID_ASSETS',
      });
    } else {
      if (Array.isArray(data.assets.transitions)) {
        data.assets.transitions.forEach((transId: unknown, idx: number) => {
          if (typeof transId !== 'string' || !isRegisteredTransitionAsset(transId)) {
            errors.push({
              path: `assets.transitions[${idx}]`,
              message: `Unknown transition assetId '${transId}' in referenced transitions`,
              code: 'UNKNOWN_TRANSITION_ASSET_ID',
            });
          }
        });
      }
      if (Array.isArray(data.assets.sfx)) {
        data.assets.sfx.forEach((sfxId: unknown, idx: number) => {
          if (typeof sfxId !== 'string' || !isRegisteredSfxAsset(sfxId)) {
            errors.push({
              path: `assets.sfx[${idx}]`,
              message: `Unknown SFX assetId '${sfxId}' in referenced sound effects`,
              code: 'UNKNOWN_SFX_ASSET_ID',
            });
          }
        });
      }
      if (Array.isArray(data.assets.media)) {
        data.assets.media.forEach((mediaItem: unknown, idx: number) => {
          if (!isPlainObject(mediaItem) || typeof mediaItem.id !== 'string' || !mediaItem.id.trim()) {
            errors.push({
              path: `assets.media[${idx}]`,
              message: 'Media asset must be an object with a non-empty id',
              code: 'INVALID_MEDIA_ASSET',
            });
          }
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? (data as CreativeProject) : undefined,
  };
}

export function parseCreativeProject(jsonString: string): ValidationResult<CreativeProject> {
  try {
    const parsed = JSON.parse(jsonString);
    return validateCreativeProject(parsed);
  } catch (err) {
    return {
      isValid: false,
      errors: [
        {
          path: '',
          message: err instanceof Error ? `JSON syntax error: ${err.message}` : 'Invalid JSON string',
          code: 'JSON_SYNTAX_ERROR',
        },
      ],
    };
  }
}

export function serializeCreativeProject(project: CreativeProject, pretty = true): string {
  return pretty ? JSON.stringify(project, null, 2) : JSON.stringify(project);
}

export type WatermarkResolutionResult = {
  status: 'resolved' | 'missing' | 'none';
  assetId?: string;
  name?: string;
  warning?: string;
};

/**
 * Resolves whether a referenced watermark asset is available in workspace.
 */
export function resolveCreativeProjectWatermark(
  project: CreativeProject,
  availableWatermark?: { id?: string; name?: string; file?: File | null } | null,
): WatermarkResolutionResult {
  const globalOverlay = project.globalSettings?.overlay;
  const watermarkObj = globalOverlay && isPlainObject(globalOverlay.watermark) ? (globalOverlay.watermark as Record<string, unknown>) : null;
  const isEnabled = watermarkObj ? (watermarkObj.enabled as boolean) : globalOverlay?.watermarkEnabled;
  const targetAssetId = (watermarkObj?.assetId as string) || globalOverlay?.watermarkAssetId;

  if (!isEnabled && !targetAssetId) {
    return { status: 'none' };
  }

  // Find declared watermark in assets.media
  const declaredAsset = project.assets?.media?.find(
    (m: { id?: string; name?: string; type?: string }) => m && m.type === 'image' && (m.id === targetAssetId || (!targetAssetId && m.id?.startsWith('watermark'))),
  );

  const assetId = targetAssetId || declaredAsset?.id || 'watermark_01';
  const assetName = declaredAsset?.name || 'watermark image';

  if (availableWatermark && (availableWatermark.file || availableWatermark.name)) {
    if (
      availableWatermark.id === assetId ||
      (availableWatermark.name && declaredAsset?.name && availableWatermark.name.toLowerCase() === declaredAsset.name.toLowerCase())
    ) {
      return {
        status: 'resolved',
        assetId,
        name: assetName,
      };
    }
  }

  return {
    status: 'missing',
    assetId,
    name: assetName,
    warning: `Referenced watermark asset "${assetName}" (${assetId}) was not found in local workspace. Watermark settings preserved; you can upload an image in Style → Overlay.`,
  };
}

