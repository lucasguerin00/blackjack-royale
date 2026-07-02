import { Card, Outcome } from '../models/card.model';
import { handValue, isBlackjack } from './cards';

/**
 * Résultat du règlement d'une main : issue face au croupier et gain total
 * (mise incluse) à recréditer au joueur.
 * @export
 * @interface Settlement
 */
export interface Settlement {
  /** Issue de la main. */
  readonly outcome: Outcome;
  /** Gain total à recréditer (mise comprise). 0 en cas de perte. */
  readonly payout: number;
}

/**
 * Paramètres purs nécessaires au règlement d'une main.
 * @export
 * @interface SettleParams
 */
export interface SettleParams {
  /** Cartes de la main du joueur. */
  readonly playerCards: readonly Card[];
  /** Cartes du croupier (main complète, carte cachée révélée). */
  readonly dealerCards: readonly Card[];
  /** Mise engagée sur la main. */
  readonly bet: number;
  /** La main est issue d'une séparation (un 21 n'est alors pas un blackjack). */
  readonly fromSplit: boolean;
  /** La main a été abandonnée. */
  readonly surrendered: boolean;
  /** Multiplicateur de gain d'un blackjack (1.5 en 3:2, 1.2 en 6:5). */
  readonly bjMultiplier: number;
}

/**
 * Indique si le croupier doit tirer une carte selon la règle de table.
 * Le croupier tire tant qu'il est sous 17 ; sur un 17 souple il tire uniquement
 * si la règle « hit soft 17 » est active.
 * @export
 * @param {readonly Card[]} cards - Cartes actuelles du croupier.
 * @param {boolean} hitSoft17 - Règle H17 (true) vs S17 (false).
 * @return {boolean} Vrai si le croupier doit tirer.
 */
export function dealerShouldHit(cards: readonly Card[], hitSoft17: boolean): boolean {
  const value = handValue(cards);
  if (value.total < 17) return true;
  return value.total === 17 && value.soft && hitSoft17;
}

/**
 * Règle une main du joueur face au croupier et calcule le gain à recréditer.
 * Fonction pure : toute la logique d'argent du blackjack est centralisée ici.
 * @export
 * @param {SettleParams} params
 * @return {Settlement}
 */
export function settleHand(params: SettleParams): Settlement {
  const dealerBlackjack = isBlackjack(params.dealerCards);
  const dealerTotal = handValue(params.dealerCards).total;
  const playerTotal = handValue(params.playerCards).total;
  const playerBlackjack =
    !params.fromSplit && params.playerCards.length === 2 && playerTotal === 21;

  if (params.surrendered) return { outcome: 'loss', payout: params.bet / 2 };
  if (playerTotal > 21) return { outcome: 'loss', payout: 0 };
  if (playerBlackjack && dealerBlackjack) return { outcome: 'push', payout: params.bet };
  if (playerBlackjack) {
    return { outcome: 'bj', payout: params.bet + params.bet * params.bjMultiplier };
  }
  if (dealerBlackjack) return { outcome: 'loss', payout: 0 };
  if (dealerTotal > 21 || playerTotal > dealerTotal)
    return { outcome: 'win', payout: params.bet * 2 };
  if (playerTotal < dealerTotal) return { outcome: 'loss', payout: 0 };
  return { outcome: 'push', payout: params.bet };
}
