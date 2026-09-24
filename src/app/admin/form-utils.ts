import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Validateur de groupe : `end` ('YYYY-MM', optionnel) ne doit pas précéder `start`. Les chaînes se comparent directement. */
export const endAfterStart: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const { start, end } = (group as FormGroup).getRawValue() as { start: string; end: string };
  return start && end && end < start ? { endBeforeStart: true } : null;
};

/**
 * Validateur d'unicité du champ « ordre ».
 * `others()` renvoie les autres éléments (l'élément en cours d'édition exclu) ;
 * l'erreur porte le nom de l'élément qui utilise déjà cette valeur.
 */
export function uniqueOrder(others: () => { order: number; label: string }[]): ValidatorFn {
  return (control) => {
    const clash = others().find((o) => o.order === control.value);
    return clash ? { orderTaken: clash.label } : null;
  };
}

/** Plus petite valeur d'ordre libre au-dessus des valeurs existantes. */
export function nextFreeOrder(orders: number[]): number {
  return Math.max(0, ...orders) + 1;
}
