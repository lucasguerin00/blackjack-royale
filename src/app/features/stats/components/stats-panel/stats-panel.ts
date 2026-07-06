import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { Card } from 'primeng/card';
import { ProgressBar } from 'primeng/progressbar';
import { Stats } from '../../../../core/models/game.model';

/** Tonalité de couleur d'un indicateur (neutre, favorable, défavorable, doré). */
type Tone = 'default' | 'good' | 'bad' | 'gold';

/** Indicateur affiché dans la grille : valeur déjà formatée + libellé + tonalité. */
interface Kpi {
  readonly label: string;
  readonly value: string;
  readonly tone: Tone;
}

/**
 * Panneau de statistiques (dumb) : reçoit un objet `Stats` du domaine et en
 * dérive lui-même les indicateurs affichables (taux de victoire, rendement,
 * grille de KPI). Aucune injection, aucune dépendance service.
 * @export
 * @class StatsPanel
 */
@Component({
  selector: 'app-stats-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Card, ProgressBar],
  templateUrl: './stats-panel.html',
})
export class StatsPanel {
  /** Statistiques à présenter (portée choisie par la page : session ou cumul). */
  readonly stats: InputSignal<Stats> = input.required<Stats>();

  /** Taux de victoire en pourcentage entier (victoires / mains jouées). */
  protected readonly winrate: Signal<number> = computed(() => {
    const s = this.stats();
    return s.hands ? Math.round((s.wins / s.hands) * 100) : 0;
  });

  /** Rendement en pourcentage (net / total misé), signé. */
  protected readonly yieldPct: Signal<number> = computed(() => {
    const s = this.stats();
    return s.wagered ? Math.round((s.net / s.wagered) * 100) : 0;
  });

  /** Grille des indicateurs secondaires, dans l'ordre d'affichage. */
  protected readonly kpis: Signal<Kpi[]> = computed(() => {
    const s = this.stats();
    return [
      { label: 'Mains jouées', value: this.int(s.hands), tone: 'default' },
      { label: 'Victoires', value: this.int(s.wins), tone: 'good' },
      { label: 'Défaites', value: this.int(s.losses), tone: 'bad' },
      { label: 'Égalités', value: this.int(s.pushes), tone: 'default' },
      { label: 'Blackjacks', value: this.int(s.blackjacks), tone: 'gold' },
      { label: 'Total misé', value: this.int(s.wagered), tone: 'default' },
      { label: 'Meilleur gain', value: this.signed(s.bestWin), tone: 'good' },
      { label: 'Pire perte', value: this.signed(s.worstLoss), tone: 'bad' },
      { label: 'Série en cours', value: this.int(s.streak), tone: 'default' },
      { label: 'Meilleure série', value: this.int(s.bestStreak), tone: 'gold' },
      { label: 'EV perdue', value: this.int(Math.round(s.evLost)), tone: 'bad' },
    ];
  });

  /** Classe de couleur Tailwind associée à une tonalité. */
  protected toneClass(tone: Tone): string {
    // Mappe la sémantique métier vers la palette du thème Casino.
    switch (tone) {
      case 'good':
        return 'text-emerald-400';
      case 'bad':
        return 'text-rose-400';
      case 'gold':
        return 'text-amber-400';
      default:
        return 'text-white';
    }
  }

  /** Formate un entier avec séparateurs de milliers (fr-FR). */
  private int(n: number): string {
    return n.toLocaleString('fr-FR');
  }

  /** Formate un entier signé (préfixe `+` pour les valeurs positives). */
  private signed(n: number): string {
    return (n > 0 ? '+' : '') + n.toLocaleString('fr-FR');
  }
}
