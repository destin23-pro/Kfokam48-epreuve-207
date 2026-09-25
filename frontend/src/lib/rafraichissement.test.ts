import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { planifierChargementTableau } from './rafraichissement';

// Issue #23 : deux étudiants marquent leur présence presque en même temps ;
// le formateur n'en voit qu'un, car son tableau n'est chargé qu'une fois.
describe('Tableau du formateur (issue #23)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('recharge le tableau toutes les 5 secondes : une présence marquée après le premier chargement apparaît', () => {
    const charger = vi.fn();
    planifierChargementTableau(charger, 5000);
    expect(charger).toHaveBeenCalledTimes(1); // chargement immédiat : l'étudiant A

    vi.advanceTimersByTime(5000); // l'étudiant B a marqué sa présence entre-temps
    expect(charger).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(5000);
    expect(charger).toHaveBeenCalledTimes(3);
  });

  it("arrête le rechargement quand le formateur quitte l'écran", () => {
    const charger = vi.fn();
    const arreter = planifierChargementTableau(charger, 5000);
    vi.advanceTimersByTime(5000);
    arreter();
    vi.advanceTimersByTime(20000);
    expect(charger).toHaveBeenCalledTimes(2);
  });
});
