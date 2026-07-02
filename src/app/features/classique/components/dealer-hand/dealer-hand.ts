import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { Card as PrimeCard } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { Card } from '../../../../core/models/card.model';
import { PlayingCard } from '../../../../shared/ui/playing-card/playing-card';

/**
 * Zone du croupier (p-card) : libellé, total (masqué tant que la carte cachée
 * n'est pas révélée) et cartes. La première carte est retournée face cachée.
 * @export
 * @class DealerHand
 */
@Component({
  selector: 'app-dealer-hand',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrimeCard, Tag, PlayingCard],
  templateUrl: './dealer-hand.html',
})
export class DealerHand {
  /** Cartes du croupier. */
  readonly cards: InputSignal<Card[]> = input.required<Card[]>();
  /** La carte cachée est révélée. */
  readonly revealed: InputSignal<boolean> = input(false);
  /** Total de la main du croupier (affiché une fois révélé). */
  readonly value: InputSignal<number> = input(0);
}
