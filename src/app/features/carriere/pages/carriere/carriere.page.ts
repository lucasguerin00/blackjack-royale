import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Venue } from '../../../../core/models/venue.model';
import { CareerService } from '../../../../core/services/career.service';
import { ProfileService } from '../../../../core/services/profile.service';
import { ProgressionService } from '../../../../core/services/progression.service';
import { VenueCard } from '../../components/venue-card/venue-card';

/**
 * Écran Carrière (smart) : l'ascension du joueur, du tripot au palace. Compose
 * un bandeau de fortune (avec progression vers le prochain salon) et la timeline
 * des salons, dont le déblocage dépend de la fortune record.
 * @export
 * @class CarrierePage
 */
@Component({
  selector: 'app-carriere',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Avatar, Button, VenueCard],
  templateUrl: './carriere.page.html',
})
export class CarrierePage {
  private readonly career = inject(CareerService);
  private readonly profileSvc = inject(ProfileService);
  private readonly progSvc = inject(ProgressionService);
  private readonly router = inject(Router);

  /** État exposé au template. */
  protected readonly profile = this.profileSvc.profile;
  protected readonly level = computed(() => this.progSvc.progression().level);
  protected readonly bankroll = this.progSvc.bankroll;
  protected readonly peak = this.career.peak;
  protected readonly venues = this.career.venues;
  protected readonly unlockedCount = this.career.unlockedCount;

  /** Prochain salon à débloquer (`null` si l'empire est complet). */
  protected readonly next: Signal<Venue | null> = this.career.nextVenue;

  /** Progression vers le prochain seuil (0–100). */
  protected readonly nextProgress: Signal<number> = computed(() => {
    const next = this.next();
    return next ? Math.min(100, (this.peak() / next.minBankroll) * 100) : 100;
  });

  /** Jetons restants avant le prochain salon. */
  protected readonly nextRemaining: Signal<number> = computed(() => {
    const next = this.next();
    return next ? Math.max(0, next.minBankroll - this.peak()) : 0;
  });

  /** Vrai si un salon est débloqué. */
  protected isUnlocked(venue: Venue): boolean {
    return this.career.isUnlocked(venue);
  }

  /** Retourne au lobby. */
  protected back(): void {
    this.router.navigate(['/']);
  }

  /** Rejoint un salon : mémorise le choix puis ouvre la table. */
  protected enter(venue: Venue): void {
    this.career.select(venue);
    this.router.navigate(['/classique']);
  }

  /** Formate un nombre avec séparateurs de milliers (fr-FR). */
  protected fmt(n: number): string {
    return n.toLocaleString('fr-FR');
  }
}
