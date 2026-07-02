/** Modèles persistés : profil, réglages, progression, statistiques. */

export interface Profile {
  name: string;
  avatar: string;
  title: string;
}

export type BlackjackPayout = '3:2' | '6:5';

export interface Settings {
  sounds: boolean;
  speed: 'slow' | 'normal' | 'fast';
  theme: string;
  confetti: boolean;
  /** Nombre de jeux dans le sabot. */
  decks: number;
  /** Le croupier tire sur 17 souple (H17) plutôt que de rester (S17). */
  dealerHitsSoft17: boolean;
  /** Paiement d'un blackjack naturel. */
  blackjackPays: BlackjackPayout;
  /** Doubler après une séparation autorisé. */
  doubleAfterSplit: boolean;
  /** Abandon tardif autorisé (première décision d'une main de 2 cartes). */
  surrender: boolean;
  /** Nombre maximum de séparations (3 ⇒ jusqu'à 4 mains). */
  maxSplits: number;
}

export function defaultSettings(): Settings {
  return {
    sounds: true,
    speed: 'normal',
    theme: 'classic',
    confetti: true,
    decks: 6,
    dealerHitsSoft17: false,
    blackjackPays: '3:2',
    doubleAfterSplit: true,
    surrender: true,
    maxSplits: 3,
  };
}

export interface Progression {
  level: number;
  xp: number;
  comps: number;
}

export interface Stats {
  hands: number;
  wins: number;
  losses: number;
  pushes: number;
  blackjacks: number;
  wagered: number;
  net: number;
  bestWin: number;
  worstLoss: number;
  streak: number;
  bestStreak: number;
  evLost: number;
}

export function emptyStats(): Stats {
  return {
    hands: 0, wins: 0, losses: 0, pushes: 0, blackjacks: 0,
    wagered: 0, net: 0, bestWin: 0, worstLoss: 0,
    streak: 0, bestStreak: 0, evLost: 0,
  };
}
