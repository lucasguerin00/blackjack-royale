/** Modèles persistés : profil, réglages, progression, statistiques. */

export interface Profile {
  name: string;
  avatar: string;
  title: string;
}

export interface Settings {
  sounds: boolean;
  speed: 'slow' | 'normal' | 'fast';
  theme: string;
  confetti: boolean;
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
