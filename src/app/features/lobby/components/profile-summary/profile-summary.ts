import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
} from '@angular/core';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ProgressBar } from 'primeng/progressbar';
import { Profile } from '../../../../core/models/game.model';

/** Statistique affichée dans le bandeau (valeur + libellé). */
interface EcoStat {
  readonly value: number;
  readonly label: string;
}

/**
 * Bandeau de profil du lobby : avatar, nom éditable, titre, barre d'XP et
 * statistiques (fortune, niveau, comps). Dumb : émet les intentions vers la page.
 * @export
 * @class ProfileSummary
 */
@Component({
  selector: 'app-profile-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Avatar, Button, Card, ProgressBar],
  templateUrl: './profile-summary.html',
})
export class ProfileSummary {
  /** Profil du joueur. */
  readonly profile: InputSignal<Profile> = input.required<Profile>();
  /** Niveau courant. */
  readonly level: InputSignal<number> = input.required<number>();
  /** XP dans le niveau courant. */
  readonly xp: InputSignal<number> = input.required<number>();
  /** XP nécessaire pour passer le niveau. */
  readonly xpNeeded: InputSignal<number> = input.required<number>();
  /** Jetons « comps » accumulés. */
  readonly comps: InputSignal<number> = input.required<number>();
  /** Fortune (bankroll). */
  readonly bankroll: InputSignal<number> = input.required<number>();
  /** Progression de la barre d'XP (0–100). */
  readonly xpPercent: InputSignal<number> = input.required<number>();

  /** Demande de changement d'avatar. */
  readonly avatarCycled: OutputEmitterRef<void> = output<void>();
  /** Demande d'édition du nom. */
  readonly nameEdited: OutputEmitterRef<void> = output<void>();

  /** Statistiques affichées à droite du bandeau. */
  protected readonly stats: Signal<EcoStat[]> = computed(() => [
    { value: this.bankroll(), label: 'FORTUNE' },
    { value: this.level(), label: 'NIVEAU' },
    { value: this.comps(), label: 'COMPS' },
  ]);
}
