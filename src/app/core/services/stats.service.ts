import { Injectable, inject, signal } from '@angular/core';
import { Outcome } from '../models/card.model';
import { Stats, emptyStats } from '../models/game.model';
import { PersistenceService } from './persistence.service';

const KEY_SESSION = 'bj_stats_session';
const KEY_ALL = 'bj_stats_all';

/**
 * Statistiques en deux portées :
 *  - session : remise à zéro à la demande (entre deux « réinitialiser »)
 *  - all     : cumul permanent
 */
@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly store = inject(PersistenceService);

  private readonly _session = signal<Stats>(this.store.get<Stats>(KEY_SESSION, emptyStats()));
  private readonly _all = signal<Stats>(this.store.get<Stats>(KEY_ALL, emptyStats()));

  readonly session = this._session.asReadonly();
  readonly all = this._all.asReadonly();

  /** Enregistre le résultat d'UNE main dans les deux portées. */
  recordHand(result: Outcome, wager: number, evLost = 0): void {
    this.apply((s) => {
      const n: Stats = { ...s };
      n.hands++;
      n.wagered += wager;
      n.evLost += evLost;
      if (result === 'win' || result === 'bj') {
        n.wins++;
        n.streak++;
        if (n.streak > n.bestStreak) n.bestStreak = n.streak;
      }
      if (result === 'bj') n.blackjacks++;
      if (result === 'loss') {
        n.losses++;
        n.streak = 0;
      }
      if (result === 'push') n.pushes++;
      return n;
    });
  }

  /** Enregistre le net d'une manche (pour meilleur gain / pire perte / net cumulé). */
  recordNet(net: number): void {
    this.apply((s) => ({
      ...s,
      net: s.net + net,
      bestWin: Math.max(s.bestWin, net),
      worstLoss: Math.min(s.worstLoss, net),
    }));
  }

  resetSession(): void {
    this._session.set(emptyStats());
    this.store.set(KEY_SESSION, emptyStats());
  }

  resetAll(): void {
    this._all.set(emptyStats());
    this.store.set(KEY_ALL, emptyStats());
  }

  private apply(fn: (s: Stats) => Stats): void {
    this._session.update(fn);
    this.store.set(KEY_SESSION, this._session());
    this._all.update(fn);
    this.store.set(KEY_ALL, this._all());
  }
}
