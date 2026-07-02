/** Types fondamentaux du jeu de cartes. */

export const SUITS = ['♠', '♥', '♦', '♣'] as const;
export type Suit = (typeof SUITS)[number];

/** V = Valet, D = Dame, R = Roi, A = As. */
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'V', 'D', 'R', 'A'] as const;
export type Rank = (typeof RANKS)[number];

export interface Card {
  readonly rank: Rank;
  readonly suit: Suit;
}

/** Issue d'une main face au croupier. */
export type Outcome = 'win' | 'loss' | 'push' | 'bj';
