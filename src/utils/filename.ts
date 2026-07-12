// Turns a user-typed project name into a safe download filename (no path
// separators or other characters that break Content-Disposition/filesystems).
export const toSafeFilename = (name: string, fallback = 'untitled-project'): string => {
  const cleaned = name
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned.length > 0 ? cleaned : fallback;
};

// Short, human-scannable display form of the real projectId (a UUID) -
// replaces the old hardcoded "CAP-2023-99X"/"CS-92381" placeholder strings
// with something real but still compact enough for a footer chip.
export const formatProjectId = (projectId: string): string => `CS-${projectId.slice(0, 8).toUpperCase()}`;
