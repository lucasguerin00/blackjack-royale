import { computed, effect, inject, Injectable, signal, Signal, untracked } from '@angular/core';
import { Venue, VENUES } from '../models/venue.model';
import { PersistenceService } from './persistence.service';
import { ProgressionService } from './progression.service';

const KEY_PEAK = 'bj_peak_bankroll';

/**
 * Progression de carrière : déblocage des salons par paliers de fortune.
 *
 * La règle qui donne de la valeur à l'argent : chaque salon exige une **fortune
 * record** (`peak`) pour être débloqué, et cette fortune record ne redescend
 * jamais — perdre ses jetons ne reverrouille donc aucun salon déjà atteint.
 * @export
 * @class CareerService
 */
@Injectable({ providedIn: 'root' })
export class CareerService {
  private readonly progression = inject(ProgressionService);
  private readonly store = inject(PersistenceService);

  /** Salons disponibles, du plus modeste au plus prestigieux. */
  readonly venues: readonly Venue[] = VENUES;

  // Fortune record : max entre la valeur persistée et la bankroll courante.
  private readonly _peak = signal<number>(
    Math.max(this.store.get<number>(KEY_PEAK, 0), this.progression.bankroll()),
  );
  /** Plus haute fortune jamais atteinte (débloque les salons définitivement). */
  readonly peak = this._peak.asReadonly();

  /** Salon sélectionné pour jouer (lu par la table le moment venu). */
  readonly current = signal<Venue | null>(null);

  /** Nombre de salons débloqués. */
  readonly unlockedCount: Signal<number> = computed(
    () => this.venues.filter((v) => this.peak() >= v.minBankroll).length,
  );

  /** Prochain salon à débloquer (`null` si tous le sont déjà). */
  readonly nextVenue: Signal<Venue | null> = computed(
    () => this.venues.find((v) => this.peak() < v.minBankroll) ?? null,
  );

  constructor() {
    // Cliquet : dès que la bankroll dépasse le record, on le relève et le persiste.
    effect(() => {
      const bankroll = this.progression.bankroll();
      if (bankroll > untracked(this._peak)) {
        this._peak.set(bankroll);
        this.store.set(KEY_PEAK, bankroll);
      }
    });
  }

  /** Vrai si le salon est débloqué (fortune record ≥ seuil). */
  isUnlocked(venue: Venue): boolean {
    return this.peak() >= venue.minBankroll;
  }

  /** Mémorise le salon choisi avant de rejoindre la table. */
  select(venue: Venue): void {
    this.current.set(venue);
  }
}
