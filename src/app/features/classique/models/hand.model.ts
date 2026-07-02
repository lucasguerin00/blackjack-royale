import { Card, Outcome } from '../../../core/models/card.model';

/**
 * Phase de la manche de blackjack, qui pilote l'affichage des contrôles.
 * @export
 */
export type Phase = 'bet' | 'insurance' | 'player' | 'dealer' | 'done';

/**
 * Une main du joueur. Il peut y en avoir plusieurs simultanément après une
 * séparation (split). Immuable : chaque évolution produit un nouvel objet.
 * @export
 * @interface Hand
 */
export interface Hand {
  /** Cartes composant la main. */
  readonly cards: Card[];
  /** Mise engagée sur cette main. */
  readonly bet: number;
  /** La main a été doublée. */
  readonly doubled: boolean;
  /** La main a été abandonnée. */
  readonly surrendered: boolean;
  /** La main est issue d'une séparation. */
  readonly fromSplit: boolean;
  /** Le joueur a fini de jouer cette main (rester, bust, 21, double). */
  readonly done: boolean;
  /** Issue de la main, renseignée au règlement. */
  readonly outcome?: Outcome;
  /** Gain recrédité (mise comprise), renseigné au règlement. */
  readonly payout?: number;
}
