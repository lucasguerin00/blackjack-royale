import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/lobby/pages/lobby/lobby.page').then((m) => m.LobbyPage),
    title: 'Blackjack Royale',
  },
  {
    path: 'classique',
    loadComponent: () =>
      import('./features/classique/pages/classique/classique.page').then((m) => m.ClassiquePage),
    title: 'Classique — Blackjack Royale',
  },
  {
    path: 'carriere',
    loadComponent: () => import('./features/placeholder/placeholder').then((m) => m.Placeholder),
    data: { mode: 'Carrière', icon: '🎰' },
    title: 'Carrière — Blackjack Royale',
  },
  {
    path: 'comptage',
    loadComponent: () => import('./features/placeholder/placeholder').then((m) => m.Placeholder),
    data: { mode: 'Comptage', icon: '🕵️' },
    title: 'Comptage — Blackjack Royale',
  },
  {
    path: 'coach',
    loadComponent: () => import('./features/placeholder/placeholder').then((m) => m.Placeholder),
    data: { mode: 'Coach & Probas', icon: '🧠' },
    title: 'Coach — Blackjack Royale',
  },
  {
    path: 'roguelike',
    loadComponent: () => import('./features/placeholder/placeholder').then((m) => m.Placeholder),
    data: { mode: 'Roguelike', icon: '🃏' },
    title: 'Roguelike — Blackjack Royale',
  },
  {
    path: 'stats',
    loadComponent: () => import('./features/stats/pages/stats/stats.page').then((m) => m.StatsPage),
    title: 'Statistiques — Blackjack Royale',
  },
  {
    path: 'profil',
    loadComponent: () =>
      import('./features/profil/pages/profil/profil.page').then((m) => m.ProfilPage),
    title: 'Profil — Blackjack Royale',
  },
  { path: '**', redirectTo: '' },
];
