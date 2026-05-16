// Statuts fixes V1 — IDs correspondant aux seeds
export const STATUS_IDS = {
  DONE: 1,
  IN_PROGRESS: 2,
  TODO: 3,
  DROPPED: 4,
} as const;

export const STATUS_LABELS: Record<number, string> = {
  1: 'Fini',
  2: 'En cours',
  3: 'À faire',
  4: 'Abandonné',
};

export const STATUS_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: '#EAF3DE', text: '#3B6D11' }, // vert
  2: { bg: '#FAEEDA', text: '#854F0B' }, // orange
  3: { bg: '#F1EFE8', text: '#5F5E5A' }, // gris
  4: { bg: '#FCEBEB', text: '#A32D2D' }, // rouge
};
