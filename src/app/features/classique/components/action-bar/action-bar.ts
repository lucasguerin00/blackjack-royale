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
 * Barre d'actions de la phase de jeu : tirer, rester, et — selon le contexte —
 * doubler, séparer, abandonner. Affiche aussi le conseil de stratégie de base.
 * @export
 * @class ActionBar
 */
@Component({
  selector: 'app-action-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button],
  templateUrl: './action-bar.html',
})
export class ActionBar {
  /** Le double est autorisé sur la main active. */
  readonly canDouble: InputSignal<boolean> = input(false);
  /** La séparation est autorisée sur la main active. */
  readonly canSplit: InputSignal<boolean> = input(false);
  /** L'abandon est autorisé sur la main active. */
  readonly canSurrender: InputSignal<boolean> = input(false);
  /** Conseil de stratégie de base (chaîne vide si aucun). */
  readonly hint: InputSignal<string> = input('');

  /** Tirer une carte. */
  readonly hit: OutputEmitterRef<void> = output<void>();
  /** Rester. */
  readonly stand: OutputEmitterRef<void> = output<void>();
  /** Doubler. */
  readonly double: OutputEmitterRef<void> = output<void>();
  /** Séparer. */
  readonly split: OutputEmitterRef<void> = output<void>();
  /** Abandonner. */
  readonly surrender: OutputEmitterRef<void> = output<void>();
}
