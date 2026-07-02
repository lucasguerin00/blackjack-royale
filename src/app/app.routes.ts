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
    loadComponent: () => import('./features/placeholder/placeholder').then((m) => m.Placeholder),
    data: { mode: 'Statistiques', icon: '📊' },
    title: 'Statistiques — Blackjack Royale',
  },
  {
    path: 'profil',
    loadComponent: () => import('./features/placeholder/placeholder').then((m) => m.Placeholder),
    data: { mode: 'Profil', icon: '🙂' },
    title: 'Profil — Blackjack Royale',
  },
  { path: '**', redirectTo: '' },
];
