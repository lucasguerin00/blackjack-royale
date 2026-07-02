import { Card } from '../models/card.model';
import { handValue, rankValue } from './cards';

/**
 * Stratégie de base — 6 jeux, croupier reste sur 17, double après split autorisé.
 * Codes : H tirer · S rester · D doubler(sinon tirer) · Ds doubler(sinon rester) · P séparer
 * Colonnes croupier : 2 3 4 5 6 7 8 9 10 A
 */
export type StrategyCode = 'H' | 'S' | 'D' | 'Ds' | 'P';
export type StrategyTable = 'hard' | 'soft' | 'pairs';

export const COLS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

export const HARD: Record<number, StrategyCode[]> = {
  8: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  9: ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
  10: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'],
  11: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'],
  12: ['H', 'H', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  13: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  14: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  15: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  16: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  17: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
};

export const SOFT: Record<number, StrategyCode[]> = {
  13: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
  14: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
  15: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
  16: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
  17: ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
  18: ['S', 'Ds', 'Ds', 'Ds', 'Ds', 'S', 'S', 'H', 'H', 'H'],
  19: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  20: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
};

export const PAIRS: Record<number, StrategyCode[]> = {
  2: ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
  3: ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
  4: ['H', 'H', 'H', 'P', 'P', 'H', 'H', 'H', 'H', 'H'],
  5: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'],
  6: ['P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H', 'H'],
  7: ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
  8: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  9: ['P', 'P', 'P', 'P', 'P', 'S', 'P', 'P', 'S', 'S'],
  10: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  11: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
};

export interface Advice {
  code: StrategyCode;
  table: StrategyTable;
  /** Clé de ligne (total dur/souple, ou valeur de la paire). */
  row: number;
  /** Index de colonne (0..9). */
  col: number;
}

export function dealerColumn(upcard: Card): number {
  let v = rankValue(upcard.rank);
  if (v === 11) return 9;
  if (v > 10) v = 10;
  return v - 2;
}

/** Coup optimal pour la main donnée + coordonnées de la case à surligner. */
export function recommend(
  hand: readonly Card[],
  upcard: Card,
  canDouble: boolean,
  canSplit: boolean,
): Advice {
  const col = dealerColumn(upcard);
  const v = handValue(hand);

  if (hand.length === 2 && rankValue(hand[0].rank) === rankValue(hand[1].rank)) {
    const key = rankValue(hand[0].rank);
    const code = PAIRS[key][col];
    if (!(code === 'P' && !canSplit)) {
      return { code, table: 'pairs', row: key, col };
    }
  }

  if (v.soft && v.total >= 13 && v.total <= 20) {
    return { code: SOFT[v.total][col], table: 'soft', row: v.total, col };
  }

  const t = Math.min(Math.max(v.total, 8), 17);
  return { code: HARD[t][col], table: 'hard', row: t, col };
}

export function actionLabel(code: StrategyCode, canDouble: boolean): string {
  switch (code) {
    case 'H':
      return 'Tirer';
    case 'S':
      return 'Rester';
    case 'P':
      return 'Séparer';
    case 'D':
      return canDouble ? 'Doubler' : 'Tirer';
    case 'Ds':
      return canDouble ? 'Doubler' : 'Rester';
  }
}
