import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { SelectButton } from 'primeng/selectbutton';
import { Stats } from '../../../../core/models/game.model';
import { StatsService } from '../../../../core/services/stats.service';
import { StatsPanel } from '../../components/stats-panel/stats-panel';

/** Portée temporelle des statistiques affichées. */
type Scope = 'session' | 'all';

/** Option du sélecteur de portée. */
interface ScopeOption {
  readonly label: string;
  readonly value: Scope;
}

/**
 * Écran Statistiques (smart). Bascule entre la session courante et le cumul
 * all-time, relaie la portée choisie au panneau dumb et pilote la remise à zéro.
 * @export
 * @class StatsPage
 */
@Component({
  selector: 'app-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Button, SelectButton, StatsPanel],
  templateUrl: './stats.page.html',
})
export class StatsPage {
  private readonly statsSvc = inject(StatsService);
  private readonly router = inject(Router);

  /** Portée sélectionnée (session par défaut). */
  protected readonly scope: WritableSignal<Scope> = signal<Scope>('session');
  /** Options proposées au sélecteur segmenté. */
  protected readonly scopeOptions: ScopeOption[] = [
    { label: 'Session', value: 'session' },
    { label: 'Depuis toujours', value: 'all' },
  ];

  /** Statistiques de la portée active, exposées au panneau. */
  protected readonly stats: Signal<Stats> = computed(() =>
    this.scope() === 'session' ? this.statsSvc.session() : this.statsSvc.all(),
  );

  /** Vrai tant qu'aucune main n'a été jouée dans la portée active. */
  protected readonly empty: Signal<boolean> = computed(() => this.stats().hands === 0);

  /** Retourne au lobby. */
  protected back(): void {
    this.router.navigate(['/']);
  }

  /** Ouvre le mode Classique (invitation depuis l'état vide). */
  protected play(): void {
    this.router.navigate(['/classique']);
  }

  /** Remet à zéro la portée actuellement affichée. */
  protected reset(): void {
    if (this.scope() === 'session') this.statsSvc.resetSession();
    else this.statsSvc.resetAll();
  }
}
