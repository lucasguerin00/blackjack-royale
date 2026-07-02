import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { Card } from 'primeng/card';
import { Chip } from 'primeng/chip';
import { Tag } from 'primeng/tag';
import { handValue } from '../../../../core/engine';
import { PlayingCard } from '../../../../shared/ui/playing-card/playing-card';
import { Hand } from '../../models/hand.model';

/** Sévérités de tag PrimeNG utilisées pour les verdicts. */
type TagSeverity = 'success' | 'secondary' | 'danger';

/**
 * Une main du joueur (p-card) : cartes, total (repère « souple »), mise et, en
 * fin de manche, le verdict. La main active et l'issue pilotent la mise en valeur.
 * @export
 * @class PlayerHand
 */
@Component({
  selector: 'app-player-hand',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Card, Chip, Tag, PlayingCard],
  templateUrl: './player-hand.html',
})
export class PlayerHand {
  /** Main à afficher. */
  readonly hand: InputSignal<Hand> = input.required<Hand>();
  /** La main est celle en cours de jeu. */
  readonly active: InputSignal<boolean> = input(false);

  /** Total de la main. */
  protected readonly total: Signal<number> = computed(() => handValue(this.hand().cards).total);
  /** La main est souple (As compté 11). */
  protected readonly soft: Signal<boolean> = computed(() => handValue(this.hand().cards).soft);

  /** Libellé du verdict de fin de manche. */
  protected readonly verdict: Signal<string> = computed(() => {
    const hand = this.hand();
    switch (hand.outcome) {
      case 'bj':
        return 'BLACKJACK';
      case 'win':
        return 'GAGNÉ';
      case 'push':
        return 'ÉGALITÉ';
      case 'loss':
        return hand.surrendered ? 'ABANDON' : 'PERDU';
      default:
        return '';
    }
  });

  /** Sévérité PrimeNG du tag de verdict selon l'issue. */
  protected readonly verdictSeverity: Signal<TagSeverity> = computed(() => {
    switch (this.hand().outcome) {
      case 'bj':
      case 'win':
        return 'success';
      case 'loss':
        return 'danger';
      default:
        return 'secondary';
    }
  });

  /** Classes Tailwind de mise en valeur selon l'état (active / issue). */
  protected readonly stateClass: Signal<string> = computed(() => {
    const outcome = this.hand().outcome;
    if (outcome === 'win' || outcome === 'bj') {
      return 'ring-2 ring-emerald-400 shadow-[0_0_26px_-6px] shadow-emerald-400';
    }
    if (outcome === 'loss') return 'opacity-70 ring-2 ring-red-500';
    if (outcome === 'push') return 'ring-2 ring-stone-300';
    if (this.active()) return 'ring-2 ring-amber-400 shadow-[0_0_24px_-4px] shadow-amber-400';
    return '';
  });
}
