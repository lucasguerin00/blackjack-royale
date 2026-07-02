import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { ProfileService } from '../../../../core/services/profile.service';
import { ProgressionService } from '../../../../core/services/progression.service';
import { ModeTile } from '../../models/mode-tile.model';
import { ModeTileComponent } from '../../components/mode-tile/mode-tile';
import { ProfileSummary } from '../../components/profile-summary/profile-summary';

/**
 * Page d'accueil (lobby, smart). Compose le bandeau de profil et la grille des
 * modes ; relaie les intentions du profil vers les services.
 * @export
 * @class LobbyPage
 */
@Component({
  selector: 'app-lobby',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProfileSummary, ModeTileComponent],
  templateUrl: './lobby.page.html',
})
export class LobbyPage {
  private readonly profileSvc = inject(ProfileService);
  private readonly progSvc = inject(ProgressionService);

  // État de progression exposé au template.
  protected readonly profile = this.profileSvc.profile;
  protected readonly prog = this.progSvc.progression;
  protected readonly bankroll = this.progSvc.bankroll;
  protected readonly xpNeeded = computed(() => this.progSvc.xpForLevel(this.prog().level));
  protected readonly xpPercent: Signal<number> = computed(() =>
    Math.min(100, (this.prog().xp / this.xpNeeded()) * 100),
  );

  /** Modes proposés dans le lobby (seul le Classique est jouable pour l'instant). */
  protected readonly modes: ModeTile[] = [
    {
      icon: '🎴',
      name: 'Classique',
      desc: 'Le blackjack pur, sans fioritures.',
      path: '/classique',
      available: true,
    },
    {
      icon: '🎰',
      name: 'Carrière',
      desc: 'Tables à paliers, prestige, jetons, IA et ambiance casino.',
      path: '/carriere',
      available: false,
    },
    {
      icon: '🕵️',
      name: 'Comptage',
      desc: 'Entraîneur Hi-Lo, drills notés et jauge de suspicion.',
      path: '/comptage',
      available: false,
    },
    {
      icon: '🧠',
      name: 'Coach & Probas',
      desc: 'Probabilités en direct, EV perdue, analyse.',
      path: '/coach',
      available: false,
    },
    {
      icon: '🃏',
      name: 'Roguelike',
      desc: 'Runs, Jokers et reliques, boss dealers.',
      path: '/roguelike',
      available: false,
    },
    {
      icon: '📊',
      name: 'Statistiques',
      desc: 'KPI, session vs all-time.',
      path: '/stats',
      available: false,
    },
    {
      icon: '🙂',
      name: 'Profil',
      desc: 'Avatar, nom, titre, réglages.',
      path: '/profil',
      available: false,
    },
  ];

  /** Fait défiler l'avatar du joueur. */
  protected cycleAvatar(): void {
    this.profileSvc.cycleAvatar();
  }

  /** Édite le nom du joueur (invite navigateur, provisoire). */
  protected editName(): void {
    const name = prompt('Ton nom de joueur :', this.profile().name);
    if (name) this.profileSvc.setName(name);
  }
}
