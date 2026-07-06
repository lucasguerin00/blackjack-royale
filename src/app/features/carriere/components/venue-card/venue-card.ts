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
import { Venue } from '../../../../core/models/venue.model';

/** Chiffres romains par rang (index = tier). */
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

/**
 * Carte d'un salon dans la timeline de Carrière (dumb). Affiche les enjeux, le
 * verrou et la progression vers le déblocage ; met en avant le prochain palier.
 * @export
 * @class VenueCard
 */
@Component({
  selector: 'app-venue-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './venue-card.html',
  styleUrl: './venue-card.scss',
})
export class VenueCard {
  /** Salon à présenter. */
  readonly venue: InputSignal<Venue> = input.required<Venue>();
  /** Le salon est débloqué (jouable). */
  readonly unlocked: InputSignal<boolean> = input.required<boolean>();
  /** C'est le prochain salon à débloquer (mise en avant). */
  readonly isNext: InputSignal<boolean> = input(false);
  /** Fortune record du joueur (pour la jauge de progression). */
  readonly peak: InputSignal<number> = input.required<number>();

  /** Demande de rejoindre ce salon. */
  readonly enter: OutputEmitterRef<void> = output<void>();

  /** Rang en chiffres romains. */
  protected readonly roman: Signal<string> = computed(
    () => ROMAN[this.venue().tier] ?? `${this.venue().tier}`,
  );

  /** Progression vers le seuil de déblocage (0–100). */
  protected readonly progress: Signal<number> = computed(() => {
    const seuil = this.venue().minBankroll;
    return seuil ? Math.min(100, (this.peak() / seuil) * 100) : 100;
  });

  /** Jetons restants avant déblocage. */
  protected readonly remaining: Signal<number> = computed(() =>
    Math.max(0, this.venue().minBankroll - this.peak()),
  );

  /** Formate un nombre avec séparateurs de milliers (fr-FR). */
  protected fmt(n: number): string {
    return n.toLocaleString('fr-FR');
  }
}
