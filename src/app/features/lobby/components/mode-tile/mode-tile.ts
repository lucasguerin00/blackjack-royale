import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Avatar } from 'primeng/avatar';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { ModeTile } from '../../models/mode-tile.model';

/**
 * Tuile d'un mode de jeu : carte PrimeNG cliquable si le mode est disponible,
 * grisée « bientôt » sinon. Dumb, piloté par la donnée `mode`.
 * @export
 * @class ModeTileComponent
 */
@Component({
  selector: 'app-mode-tile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Avatar, Card, Tag],
  templateUrl: './mode-tile.html',
})
export class ModeTileComponent {
  /** Mode à afficher. */
  readonly mode: InputSignal<ModeTile> = input.required<ModeTile>();
}
