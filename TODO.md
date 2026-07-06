# 🃏 Blackjack Royale — Roadmap

> Todo list d'améliorations, reconstruite le **2026-07-02** en analysant le code réel.
> Direction validée : **améliorer l'appli → multijoueur → déploiement**.
> Coche au fur et à mesure. Effort indicatif : 🟢 rapide · 🟡 moyen · 🔴 gros morceau.

L'appli est en ligne : https://github.com/lucasguerin00/blackjack-royale

## ✅ Fait le 2026-07-06

- **Écran Statistiques** (`/stats`) : sélecteur session / all-time, taux de victoire + jauge,
  net & rendement, grille de KPI (mains, V/D/égalités, blackjacks, séries, EV perdue), état vide,
  reset par portée. Page smart + dumb `StatsPanel`.
- **Écran Profil** (`/profil`) : aperçu live, édition du nom (fini le `prompt()`), sélecteur
  d'avatar et de titre. Page smart + dumb `ProfileEditor` ; `ProfileService.setAvatar` + liste de titres.
- Tuiles Statistiques & Profil **débloquées** dans le lobby, routes branchées.

## ✅ Fait le 2026-07-02

- Table complète : **split multi-mains, assurance, abandon, double**, écran de réglages.
- **Bankroll unifiée** sur `ProgressionService` (fin de la double source de vérité).
- Animations (distribution, flip croupier, confettis) + **sons** synthétisés (Web Audio).
- **Outillage pro** : ESLint 9 + Prettier, PrimeNG 20 + Tailwind v4 + thème Casino.
- **Refactor architecture** : smart/dumb, `OnPush`, moteur pur (`core/engine/table.ts`) + service
  `ClassiqueGame`, dumbs (playing-card, dealer/player-hand, bet-controls, action-bar, settings-dialog).
- **UI PrimeNG** : p-card, p-avatar, p-progressbar, p-tag, p-chip, p-toast, p-divider, p-dialog…
- Lobby + placeholder migrés en PrimeNG/Tailwind ; `styles.scss` réduit au fond feutré.

> Reste en cours : vérif visuelle finale, puis déploiement et multijoueur.

---

## Phase 0 — Fondations & qualité (à faire en premier)

- [x] 🟢 **Unifier la bankroll.** Fait : `ClassiqueGame` lit/écrit directement
      `ProgressionService.bankroll` ([classique-game.ts:42](src/app/features/classique/services/classique-game.ts#L42)) —
      source de vérité unique partagée avec le lobby.
- [ ] 🟡 **Tests unitaires du moteur** (`cards`, `shoe`, `strategy`) — code pur, idéal à tester :
      valeur de main, As souple/dur, blackjack, table de stratégie, remélange du sabot.
- [ ] 🟢 **Corriger le README** (actuellement le template Angular CLI par défaut) : décrire le vrai projet,
      les modes, comment lancer, la stack.
- [ ] 🟡 **CI GitHub Actions** : `lint` + `build` + `test` à chaque push sur `main`.
- [ ] 🟢 **Prettier + ESLint** configurés et lancés dans la CI.

## Phase 1 — Gameplay solo complet

- [x] 🟡 **Split (séparation de paires).** Fait : mains multiples gérées par `ClassiqueGame`.
- [x] 🟡 **Assurance** quand le croupier montre un As. Fait.
- [x] 🟢 **Abandon (surrender)**. Fait.
- [x] 🟢 **Animations de distribution** + son (flip de carte, jetons). Fait (Web Audio + confettis).
- [x] 🟢 **Remplacer `prompt()`** pour l'édition du nom. Fait : le bouton « modifier » du lobby
      ouvre l'écran Profil (`/profil`), plus aucun `prompt()`.
- [x] 🟢 **Écran de réglages** : nombre de jeux, règle croupier (S17/H17), payout (3:2 / 6:5). Fait.

## Phase 2 — Étoffer les modes (aujourd'hui placeholders)

- [x] 🟡 **Statistiques** : écran réel branché sur `StatsService` (session / all-time, winrate,
      net & rendement, séries, EV perdue, état vide, reset). Fait le 2026-07-06.
- [x] 🟢 **Profil** : avatar, nom éditable, titre. Fait le 2026-07-06 (écran `/profil`).
- [ ] 🟡 **Comptage** : `hiLo()` est déjà écrit ([cards.ts:40](src/app/core/engine/cards.ts#L40)).
      Entraîneur Hi-Lo, drills notés, jauge de « true count ».
- [ ] 🟡 **Coach & Probas** : `recommend()` donne déjà le coup optimal
      ([strategy.ts:68](src/app/core/engine/strategy.ts#L68)). Afficher EV perdue et conseils en direct.
- [ ] 🔴 **Carrière** : tables à paliers, prestige, comps, ambiance casino.
- [ ] 🔴 **Roguelike** : runs, jokers/reliques, boss dealers.

## Phase 3 — 🚀 Déploiement (mettre l'appli en ligne tôt)

- [ ] 🟢 **Choisir l'hébergeur** : Vercel / Netlify / Cloudflare Pages / GitHub Pages (SPA statique Angular).
- [ ] 🟢 **Build de prod** (`ng build`) + config de déploiement auto depuis GitHub.
- [ ] 🟢 **PWA** : installable, jouable hors-ligne (parfait pour un jeu solo).
- [ ] 🟢 **Domaine custom** (optionnel).

## Phase 4 — 🌐 Multijoueur (le gros morceau)

> La couche `PersistenceService` est déjà pensée comme un « port » à remplacer
> ([persistence.service.ts:3](src/app/core/services/persistence.service.ts#L3)) — c'est là qu'on branche le cloud.

- [ ] 🔴 **Choisir le backend.** Reco : **Supabase** (auth + Postgres + Realtime, généreux en gratuit)
      ou serveur WebSocket maison (Node + Socket.IO) pour plus de contrôle.
- [ ] 🟡 **Auth & comptes** : migrer profil/progression/stats du localStorage vers le cloud.
- [ ] 🔴 **RNG côté serveur.** Aujourd'hui le sabot est tiré côté client avec `Math.random()`
      ([shoe.ts:25](src/app/core/engine/shoe.ts#L25)) — inacceptable en multi (tricherie).
      Le tirage et la logique de manche doivent être **autoritatifs côté serveur**.
- [ ] 🔴 **Tables temps réel** : lobby de salons, rejoindre/créer une table, sièges, tours synchronisés.
- [ ] 🟡 **Chat / emotes** à la table.
- [ ] 🟡 **Classements** (leaderboards) et parties classées.
- [ ] 🟢 **Anti-triche de base** : validation serveur des mises et des coups.

---

### Idées bonus
- [ ] Thèmes de table / dos de cartes déblocables.
- [ ] Défis quotidiens.
- [ ] i18n (FR/EN) — l'UI est en français aujourd'hui.
- [ ] Accessibilité (navigation clavier, ARIA sur la table).
