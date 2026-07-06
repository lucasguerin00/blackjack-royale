import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { Card } from '../../../core/models/card.model';
import { isRed } from '../../../core/engine';

/**
 * Type d'animation d'entrée d'une carte.
 * @export
 */
export type CardAnimation = 'deal' | 'flip' | 'none';

/**
 * Carte à jouer, présentational et réutilisable (croupier, joueur, futurs modes).
 * Affiche soit une carte face visible, soit un dos de carte.
 * @export
 * @class PlayingCard
 */
@Component({
  selector: 'app-playing-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './playing-card.html',
  styleUrl: './playing-card.scss',
})
export class PlayingCard {
  /** Carte à afficher (ignorée si `faceDown`). */
  readonly card: InputSignal<Card | null> = input<Card | null>(null);
  /** Affiche le dos de la carte. */
  readonly faceDown: InputSignal<boolean> = input(false);
  /** Animation d'entrée jouée à l'insertion. */
  readonly animation: InputSignal<CardAnimation> = input<CardAnimation>('deal');
  /** Décalage d'entrée en millisecondes (pour échelonner une distribution). */
  readonly delayMs: InputSignal<number> = input<number>(0);

  /** Vrai si la carte est d'une couleur rouge (cœur/carreau). */
  protected readonly red: Signal<boolean> = computed(() => {
    const card = this.card();
    return !!card && isRed(card.suit);
  });
}
