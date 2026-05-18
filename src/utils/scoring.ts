/**
 * Nombre de décimales significatives d'un nombre.
 * Ex : decimals(0.1) → 1 | decimals(0.25) → 2 | decimals(1) → 0
 */
function decimals(n: number): number {
  const str = n.toString();
  const dot = str.indexOf('.');
  return dot === -1 ? 0 : str.length - dot - 1;
}

/**
 * Arrondit une note au grain le plus proche, sans impureté flottante.
 * Ex : roundToGrain(7.3, 0.1) → 7.3  (pas 7.300000000000001)
 *      roundToGrain(6.81, 0.1) → 6.8
 */
export function roundToGrain(value: number, grain: number): number {
  const precision = decimals(grain);
  const factor = Math.pow(10, precision);
  return Math.round(Math.round(value / grain) * grain * factor) / factor;
}

/**
 * Calcule la moyenne pondérée des critères, sans impureté flottante.
 * Retourne null si aucun critère noté.
 */
export function computeAverageScore(
  scores: { score: number; weight?: number }[],
  grain = 0.5
): number | null {
  if (scores.length === 0) return null;
  const totalWeight = scores.reduce((sum, s) => sum + (s.weight ?? 1), 0);
  const weightedSum = scores.reduce((sum, s) => sum + s.score * (s.weight ?? 1), 0);
  return roundToGrain(weightedSum / totalWeight, grain);
}

/**
 * Normalise une note d'un barème source vers un barème cible.
 * Ex : normalizeScore(8, 10, 20) → 16
 */
export function normalizeScore(score: number, fromMax: number, toMax: number): number {
  return roundToGrain((score / fromMax) * toMax, 0.01);
}

/**
 * Formate un score pour l'affichage.
 * Ex : formatScore(8.5, 10) → "8.5/10"
 *      formatScore(null, 10) → "—"
 */
export function formatScore(score: number | null | undefined, max: number): string {
  if (score == null) return '—';
  return `${score}/${max}`;
}
