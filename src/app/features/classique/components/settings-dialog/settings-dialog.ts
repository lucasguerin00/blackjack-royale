import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Divider } from 'primeng/divider';
import { SelectButton } from 'primeng/selectbutton';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Settings } from '../../../../core/models/game.model';

/** Option d'un bouton de sélection segmenté. */
interface Option<T> {
  readonly label: string;
  readonly value: T;
}

/**
 * Modale de réglages du jeu et des règles de table (PrimeNG). Dumb : reçoit les
 * réglages courants et émet chaque modification partielle vers la page.
 * @export
 * @class SettingsDialog
 */
@Component({
  selector: 'app-settings-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Dialog, Divider, SelectButton, ToggleSwitch],
  templateUrl: './settings-dialog.html',
})
export class SettingsDialog {
  /** Visibilité de la modale (liaison bidirectionnelle). */
  readonly visible: InputSignal<boolean> = input.required<boolean>();
  /** Réglages courants. */
  readonly settings: InputSignal<Settings> = input.required<Settings>();

  /** Émis pour synchroniser la visibilité (`[(visible)]`). */
  readonly visibleChange: OutputEmitterRef<boolean> = output<boolean>();
  /** Émis à chaque modification d'un réglage. */
  readonly changed: OutputEmitterRef<Partial<Settings>> = output<Partial<Settings>>();

  protected readonly speedOptions: Option<Settings['speed']>[] = [
    { label: 'Lente', value: 'slow' },
    { label: 'Normale', value: 'normal' },
    { label: 'Rapide', value: 'fast' },
  ];
  protected readonly deckOptions: Option<number>[] = [1, 2, 4, 6, 8].map((n) => ({
    label: `${n}`,
    value: n,
  }));
  protected readonly payoutOptions: Option<Settings['blackjackPays']>[] = [
    { label: '3:2', value: '3:2' },
    { label: '6:5', value: '6:5' },
  ];
  protected readonly dealerOptions: Option<boolean>[] = [
    { label: 'Reste (S17)', value: false },
    { label: 'Tire (H17)', value: true },
  ];
  protected readonly splitOptions: Option<number>[] = [1, 2, 3].map((n) => ({
    label: `${n}`,
    value: n,
  }));
}
