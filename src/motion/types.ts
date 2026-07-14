export type CodeLanguage = 'python' | 'sql' | 'r' | 'bash' | 'js';
export type CodeBlockPosition = 'top' | 'center' | 'bottom';
export type TickerDirection = 'left' | 'right';
export type TickerPosition = 'top' | 'bottom';

// Shared between the CodeBlock renderer and CodeEditorModal so the language
// picker labels can't drift out of sync between the two.
export const CODE_LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  python: 'Python',
  sql: 'SQL',
  r: 'R',
  bash: 'Bash',
  js: 'JS',
};

// Lives alongside OverlaySettings/TextureOverlaySettings (src/overlay/types.ts,
// src/textures/types.ts) - same pattern: one settings object in ProjectContext
// drives the live PreviewPlayer and gets baked into the real export render.
// Each graphic is independently toggleable (unlike Frame's single-select
// variant), matching how reel-craft's motion graphics are designed to combine.
export type MotionGraphicsSettings = {
  codeBlockEnabled: boolean;
  codeBlockCode: string;
  codeBlockLanguage: CodeLanguage;
  codeBlockPosition: CodeBlockPosition;
  codeBlockLinesPerPage: number;
  numberCounterEnabled: boolean;
  numberCounterStart: number;
  numberCounterEnd: number;
  numberCounterPrefix: string;
  numberCounterSuffix: string;
  tickerEnabled: boolean;
  tickerText: string;
  tickerDirection: TickerDirection;
  tickerPosition: TickerPosition;
};
