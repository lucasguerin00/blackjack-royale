import { Injectable, computed, inject, signal } from '@angular/core';
import { Settings, defaultSettings } from '../models/game.model';
import { PersistenceService } from './persistence.service';

const KEY = 'bj_settings';

/**
 * Réglages du jeu et règles de table, persistés.
 * On fusionne avec les valeurs par défaut pour rester compatible
 * quand on ajoute de nouveaux réglages plus tard.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly store = inject(PersistenceService);

  private readonly _settings = signal<Settings>({
    ...defaultSettings(),
    ...this.store.get<Partial<Settings>>(KEY, {}),
  });
  readonly settings = this._settings.asReadonly();

  /** Durée d'une animation de distribution (ms) selon la vitesse choisie. */
  readonly dealMs = computed(
    () => ({ slow: 620, normal: 400, fast: 220 })[this._settings().speed],
  );

  /** Multiplicateur de gain d'un blackjack naturel (1.5 pour 3:2, 1.2 pour 6:5). */
  readonly bjMultiplier = computed(() => (this._settings().blackjackPays === '3:2' ? 1.5 : 1.2));

  update(patch: Partial<Settings>): void {
    this._settings.update((s) => ({ ...s, ...patch }));
    this.store.set(KEY, this._settings());
  }

  reset(): void {
    this._settings.set(defaultSettings());
    this.store.set(KEY, this._settings());
  }
}
