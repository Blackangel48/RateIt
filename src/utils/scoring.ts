/**
 * Arrondit une note au grain le plus proche.
 * Ex : roundToGrain(7.3, 0.5) → 7.5
 */
export function roundToGrain(value: number, grain: number): number {
  return Math.round(value / grain) * grain;
}

/**
 * Calcule la moyenne pondérée des critères.
 * Retourne null si aucun critère noté.
 */
export function computeAverageScore(
  scores: { score: number; weight?: number }[]
): number | null {
  if (scores.length === 0) return null;

  const totalWeight = scores.reduce((sum, s) => sum + (s.weight ?? 1), 0);
  const weightedSum = scores.reduce(
    (sum, s) => sum + s.score * (s.weight ?? 1),
    0
  );

  return weightedSum / totalWeight;
}

/**
 * Normalise une note d'un barème source vers un barème cible.
 * Ex : normalizeScore(8, 10, 20) → 16
 */
export function normalizeScore(
  score: number,
  fromMax: number,
  toMax: number
): number {
  return (score / fromMax) * toMax;
}

/**
 * Formate un score pour l'affichage.
 * Ex : formatScore(8.5, 10) → "8.5 / 10"
 *      formatScore(null, 10) → "—"
 */
export function formatScore(
  score: number | null | undefined,
  max: number
): string {
  if (score == null) return '—';
  return `${score} / ${max}`;
}
