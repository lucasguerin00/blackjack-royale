import { Card, Rank } from '../models/card.model';

/** Valeur d'un rang : figures = 10, As = 11 (ajusté plus tard si besoin). */
export function rankValue(rank: Rank): number {
  if (rank === 'A') return 11;
  if (rank === 'V' || rank === 'D' || rank === 'R') return 10;
  return parseInt(rank, 10);
}

export function isRed(suit: string): boolean {
  return suit === '♥' || suit === '♦';
}

export interface HandValue {
  /** Meilleur total <= 21 si possible. */
  total: number;
  /** Vrai s'il reste un As compté pour 11 (main « souple »). */
  soft: boolean;
}

export function handValue(cards: readonly Card[]): HandValue {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    total += rankValue(c.rank);
    if (c.rank === 'A') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return { total, soft: aces > 0 };
}

export function isBlackjack(cards: readonly Card[]): boolean {
  return cards.length === 2 && handValue(cards).total === 21;
}

/** Poids Hi-Lo d'une carte (pour le futur mode Comptage). */
export function hiLo(card: Card): number {
  const v = rankValue(card.rank);
  if (v >= 2 && v <= 6) return 1;
  if (v === 10 || v === 11) return -1;
  return 0;
}
