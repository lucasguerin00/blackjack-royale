/** Modèle d'un salon de la Carrière : un palier de jeu à débloquer. */

export interface Venue {
  /** Identifiant stable. */
  readonly id: string;
  /** Rang affiché (I, II, III…). */
  readonly tier: number;
  /** Nom du salon. */
  readonly name: string;
  /** Accroche d'ambiance. */
  readonly tagline: string;
  /** Emoji d'illustration. */
  readonly icon: string;
  /** Fortune record nécessaire pour débloquer le salon (0 = de départ). */
  readonly minBankroll: number;
  /** Mise minimale de la table. */
  readonly minBet: number;
  /** Mise maximale de la table. */
  readonly maxBet: number;
  /** Classes Tailwind littérales du dégradé de la carte (accent visuel). */
  readonly gradient: string;
  /** Classe Tailwind littérale de la lueur portée (couleur d'ombre). */
  readonly glow: string;
  /** Classe Tailwind littérale de l'accent (texte/bordure). */
  readonly accent: string;
}

/**
 * Échelle des salons, du tripot de quartier au palace royal. Chaque palier
 * relève les enjeux (mises) et exige une fortune record plus élevée : c'est ce
 * qui donne de la valeur à l'argent gagné.
 */
export const VENUES: readonly Venue[] = [
  {
    id: 'tripot',
    tier: 1,
    name: 'Le Tripot du Coin',
    tagline: 'Arrière-salle enfumée, on apprend les ficelles.',
    icon: '🎲',
    minBankroll: 0,
    minBet: 5,
    maxBet: 100,
    gradient: 'from-stone-600 to-stone-800',
    glow: 'shadow-stone-900/50',
    accent: 'text-stone-200',
  },
  {
    id: 'saloon',
    tier: 2,
    name: 'Le Saloon',
    tagline: 'Whisky, cartes usées et premiers vrais gains.',
    icon: '🤠',
    minBankroll: 2_500,
    minBet: 25,
    maxBet: 500,
    gradient: 'from-emerald-600 to-emerald-900',
    glow: 'shadow-emerald-500/40',
    accent: 'text-emerald-200',
  },
  {
    id: 'riverboat',
    tier: 3,
    name: 'Le Riverboat',
    tagline: 'Le casino flottant des joueurs qui montent.',
    icon: '🚢',
    minBankroll: 15_000,
    minBet: 100,
    maxBet: 2_500,
    gradient: 'from-sky-600 to-indigo-900',
    glow: 'shadow-sky-500/40',
    accent: 'text-sky-200',
  },
  {
    id: 'grand-casino',
    tier: 4,
    name: 'Le Grand Casino',
    tagline: 'Lustres, tapis rouge et croupiers en gants blancs.',
    icon: '🎰',
    minBankroll: 75_000,
    minBet: 500,
    maxBet: 10_000,
    gradient: 'from-fuchsia-600 to-purple-900',
    glow: 'shadow-fuchsia-500/40',
    accent: 'text-fuchsia-200',
  },
  {
    id: 'suite-vip',
    tier: 5,
    name: 'La Suite VIP',
    tagline: 'Cercle privé, champagne et mises à couper le souffle.',
    icon: '💎',
    minBankroll: 300_000,
    minBet: 2_500,
    maxBet: 50_000,
    gradient: 'from-rose-500 to-red-900',
    glow: 'shadow-rose-500/40',
    accent: 'text-rose-200',
  },
  {
    id: 'palace-royal',
    tier: 6,
    name: 'Le Palace Royal',
    tagline: 'Le sommet. Ici, les légendes misent des fortunes.',
    icon: '👑',
    minBankroll: 1_000_000,
    minBet: 10_000,
    maxBet: 250_000,
    gradient: 'from-amber-400 to-yellow-700',
    glow: 'shadow-amber-400/50',
    accent: 'text-amber-200',
  },
];
