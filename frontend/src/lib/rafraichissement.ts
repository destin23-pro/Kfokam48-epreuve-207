/**
 * Chargement du tableau du formateur (GET /api/tableau).
 * Comportement actuel : un seul chargement, jamais renouvelé.
 * Renvoie une fonction d'arrêt.
 */
export function planifierChargementTableau(
  charger: () => unknown,
  _intervalleMs: number
): () => void {
  void charger();
  return () => {};
}
