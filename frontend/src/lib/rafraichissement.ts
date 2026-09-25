/**
 * Chargement du tableau du formateur (GET /api/tableau) : immédiat, puis
 * renouvelé à intervalle régulier pour que les présences marquées entre-temps
 * apparaissent sans action du formateur (issue #23).
 * Renvoie une fonction d'arrêt, appelée quand le formateur quitte l'écran.
 */
export function planifierChargementTableau(
  charger: () => unknown,
  intervalleMs: number
): () => void {
  void charger();
  const minuterie = setInterval(() => void charger(), intervalleMs);
  return () => clearInterval(minuterie);
}
