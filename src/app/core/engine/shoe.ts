import { Card, RANKS, SUITS } from '../models/card.model';

/**
 * Sabot de plusieurs jeux de 52 cartes.
 * Se remélange automatiquement quand la pénétration devient trop élevée.
 */
export class Shoe {
  private cards: Card[] = [];

  constructor(private readonly decks = 6) {
    this.shuffle();
  }

  shuffle(): void {
    this.cards = [];
    for (let d = 0; d < this.decks; d++) {
      for (const suit of SUITS) {
        for (const rank of RANKS) {
          this.cards.push({ rank, suit });
        }
      }
    }
    // Fisher–Yates
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw(): Card {
    if (this.cards.length < this.decks * 52 * 0.22) {
      this.shuffle();
    }
    return this.cards.pop()!;
  }

  get remaining(): number {
    return this.cards.length;
  }

  /** Proportion du sabot déjà distribuée (0 → 1). */
  get penetration(): number {
    return 1 - this.cards.length / (this.decks * 52);
  }
}
