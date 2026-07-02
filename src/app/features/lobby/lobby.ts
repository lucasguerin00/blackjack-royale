import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../core/services/profile.service';
import { ProgressionService } from '../../core/services/progression.service';

interface ModeTile {
  icon: string;
  name: string;
  desc: string;
  path: string;
  available: boolean;
}

@Component({
  selector: 'app-lobby',
  imports: [RouterLink],
  templateUrl: './lobby.html',
  styleUrl: './lobby.scss',
})
export class Lobby {
  protected readonly profileSvc = inject(ProfileService);
  private readonly progSvc = inject(ProgressionService);

  protected readonly profile = this.profileSvc.profile;
  protected readonly prog = this.progSvc.progression;
  protected readonly bankroll = this.progSvc.bankroll;
  protected readonly xpNeeded = computed(() => this.progSvc.xpForLevel(this.prog().level));
  protected readonly xpPercent = computed(() =>
    Math.min(100, (this.prog().xp / this.xpNeeded()) * 100),
  );

  protected readonly modes: ModeTile[] = [
    { icon: '🎴', name: 'Classique', desc: 'Le blackjack pur, sans fioritures.', path: '/classique', available: true },
    { icon: '🎰', name: 'Carrière', desc: 'Tables à paliers, prestige, jetons, IA et ambiance casino.', path: '/carriere', available: false },
    { icon: '🕵️', name: 'Comptage', desc: 'Entraîneur Hi-Lo, drills notés et jauge de suspicion.', path: '/comptage', available: false },
    { icon: '🧠', name: 'Coach & Probas', desc: 'Probabilités en direct, EV perdue, analyse.', path: '/coach', available: false },
    { icon: '🃏', name: 'Roguelike', desc: 'Runs, Jokers et reliques, boss dealers.', path: '/roguelike', available: false },
    { icon: '📊', name: 'Statistiques', desc: 'KPI, session vs all-time.', path: '/stats', available: false },
    { icon: '🙂', name: 'Profil', desc: 'Avatar, nom, titre, réglages.', path: '/profil', available: false },
  ];

  protected editName(): void {
    const name = prompt('Ton nom de joueur :', this.profile().name);
    if (name) this.profileSvc.setName(name);
  }
}
