import { Injectable, inject, signal } from '@angular/core';
import { Progression } from '../models/game.model';
import { PersistenceService } from './persistence.service';

const KEY_PROG = 'bj_progression';
const KEY_BANK = 'bj_bankroll';

@Injectable({ providedIn: 'root' })
export class ProgressionService {
  private readonly store = inject(PersistenceService);

  private readonly _prog = signal<Progression>(
    this.store.get<Progression>(KEY_PROG, { level: 1, xp: 0, comps: 0 }),
  );
  private readonly _bankroll = signal<number>(this.store.get<number>(KEY_BANK, 1000));

  readonly progression = this._prog.asReadonly();
  readonly bankroll = this._bankroll.asReadonly();

  /** XP nécessaire pour passer le niveau `level`. Paliers croissants. */
  xpForLevel(level: number): number {
    return 100 + (level - 1) * 60;
  }

  /** Ajoute de l'XP (et la moitié en comps). Retourne true si un niveau est gagné. */
  addXp(amount: number): boolean {
    let leveledUp = false;
    this._prog.update((p) => {
      const next: Progression = {
        ...p,
        xp: p.xp + amount,
        comps: p.comps + Math.round(amount / 2),
      };
      while (next.xp >= this.xpForLevel(next.level)) {
        next.xp -= this.xpForLevel(next.level);
        next.level++;
        leveledUp = true;
      }
      return next;
    });
    this.store.set(KEY_PROG, this._prog());
    return leveledUp;
  }

  setBankroll(value: number): void {
    this._bankroll.set(value);
    this.store.set(KEY_BANK, value);
  }
}
