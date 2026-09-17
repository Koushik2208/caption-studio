import type { CardAspectRatio } from './types';

export type CardDimensions = {
  cardWidth: number;
  cardHeight: number;
  cardLeft: number;
  cardTop: number;
};

/**
 * Computes exact card dimensions and centered/offset position inside any canvas.
 * Guaranteed to fit within composition boundaries while preserving aspect ratio.
 */
export const getCardDimensions = (
  aspectRatio: CardAspectRatio = '9:16',
  scale: number = 0.85,
  positionY: number = 0.5,
  compositionWidth: number,
  compositionHeight: number,
): CardDimensions => {
  const clampedScale = Math.min(1, Math.max(0.4, scale));
  const clampedPosY = Math.min(1, Math.max(0, positionY));

  let targetRatio: number;
  switch (aspectRatio) {
    case '4:5':
      targetRatio = 4 / 5;
      break;
    case '1:1':
      targetRatio = 1 / 1;
      break;
    case '16:9':
      targetRatio = 16 / 9;
      break;
    case '9:16':
    default:
      targetRatio = 9 / 16;
      break;
  }

  const maxWidth = compositionWidth * clampedScale;
  const maxHeight = compositionHeight * clampedScale;

  let cardWidth: number;
  let cardHeight: number;

  if (maxWidth / maxHeight > targetRatio) {
    // Height constrained
    cardHeight = maxHeight;
    cardWidth = cardHeight * targetRatio;
  } else {
    // Width constrained
    cardWidth = maxWidth;
    cardHeight = cardWidth / targetRatio;
  }

  const cardLeft = (compositionWidth - cardWidth) / 2;
  const cardTop = (compositionHeight - cardHeight) * clampedPosY;

  return {
    cardWidth,
    cardHeight,
    cardLeft,
    cardTop,
  };
};
