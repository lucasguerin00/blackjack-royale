import { Injectable, inject, signal } from '@angular/core';
import { Profile } from '../models/game.model';
import { PersistenceService } from './persistence.service';

const KEY = 'bj_profile';
const AVATARS = ['🙂', '😎', '🤠', '🧐', '🤑', '🦈', '🐉', '👑', '🎩', '🍀', '💎', '🔥'];
// Titres décoratifs sélectionnables dans l'écran Profil (purement cosmétiques).
const TITLES = ['Débutant', 'Habitué', 'Flambeur', 'Requin', 'High Roller', 'Compteur', 'Légende'];

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly store = inject(PersistenceService);

  private readonly _profile = signal<Profile>(
    this.store.get<Profile>(KEY, { name: 'Joueur', avatar: '🙂', title: 'Débutant' }),
  );
  readonly profile = this._profile.asReadonly();
  readonly avatars = AVATARS;
  readonly titles = TITLES;

  setName(name: string): void {
    const clean = name.trim().slice(0, 20);
    if (!clean) return;
    this._profile.update((p) => ({ ...p, name: clean }));
    this.persist();
  }

  /** Sélectionne un avatar précis (sélecteur de l'écran Profil). */
  setAvatar(avatar: string): void {
    // On ignore toute valeur hors de la palette connue.
    if (!AVATARS.includes(avatar)) return;
    this._profile.update((p) => ({ ...p, avatar }));
    this.persist();
  }

  cycleAvatar(): void {
    this._profile.update((p) => {
      const i = AVATARS.indexOf(p.avatar);
      return { ...p, avatar: AVATARS[(i + 1) % AVATARS.length] };
    });
    this.persist();
  }

  setTitle(title: string): void {
    this._profile.update((p) => ({ ...p, title }));
    this.persist();
  }

  private persist(): void {
    this.store.set(KEY, this._profile());
  }
}
