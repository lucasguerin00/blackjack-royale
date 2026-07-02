import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { Button } from 'primeng/button';

/**
 * Contrôles de la phase de mise : jetons cliquables, mise en cours, effacement
 * et distribution. Purement présentational : émet les intentions vers la page.
 * @export
 * @class BetControls
 */
@Component({
  selector: 'app-bet-controls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button],
  templateUrl: './bet-controls.html',
})
export class BetControls {
  /** Valeurs de jetons proposées. */
  readonly chips: InputSignal<number[]> = input.required<number[]>();
  /** Mise en cours de constitution. */
  readonly pendingBet: InputSignal<number> = input.required<number>();
  /** Bankroll disponible. */
  readonly bankroll: InputSignal<number> = input.required<number>();

  /** Un jeton a été ajouté à la mise. */
  readonly chipAdded: OutputEmitterRef<number> = output<number>();
  /** La mise a été effacée. */
  readonly cleared: OutputEmitterRef<void> = output<void>();
  /** Distribution demandée. */
  readonly dealt: OutputEmitterRef<void> = output<void>();

  /** Couleur du jeton selon sa valeur (classes Tailwind littérales). */
  private readonly chipColors: Record<number, string> = {
    50: 'bg-red-700',
    100: 'bg-sky-800',
    500: 'bg-slate-700',
    1000: 'bg-purple-700',
  };

  /**
   * Retourne la classe de couleur d'un jeton.
   * @param {number} value - Valeur du jeton.
   * @return {string}
   */
  protected color(value: number): string {
    return this.chipColors[value] ?? 'bg-sky-800';
  }
}
