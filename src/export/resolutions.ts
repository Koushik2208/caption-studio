// ExportPage's Resolution dropdown, wired to renderMedia's real `scale`
// option server-side (multiplies the fixed 1080x1920 composition, per
// CLAUDE.md's non-negotiable base resolution - not a separate composition
// size).
export const RESOLUTION_OPTIONS = ['1080p (Full HD)', '4K (Ultra HD)', '720p (Fast Render)'] as const;

export type ResolutionOption = (typeof RESOLUTION_OPTIONS)[number];

export const RESOLUTION_SCALE: Record<ResolutionOption, number> = {
  '1080p (Full HD)': 1,
  '4K (Ultra HD)': 2,
  '720p (Fast Render)': 2 / 3,
};
