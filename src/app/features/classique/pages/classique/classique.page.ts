import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Chip } from 'primeng/chip';
import { Toast } from 'primeng/toast';
import { ClassiqueGame } from '../../services/classique-game';
import { ActionBar } from '../../components/action-bar/action-bar';
import { BetControls } from '../../components/bet-controls/bet-controls';
import { ConfettiOverlay } from '../../components/confetti-overlay/confetti-overlay';
import { DealerHand } from '../../components/dealer-hand/dealer-hand';
import { PlayerHand } from '../../components/player-hand/player-hand';
import { SettingsDialog } from '../../components/settings-dialog/settings-dialog';

/**
 * Page du mode Classique (smart).
 *
 * Orchestre la table de blackjack : fournit le service moteur `ClassiqueGame`,
 * expose son état aux composants de présentation et relaie leurs intentions.
 * Ne porte aucune logique de jeu (déléguée au moteur) — uniquement la
 * composition de l'UI et l'état purement visuel (ouverture de la modale).
 *
 * @export
 * @class ClassiquePage
 */
@Component({
  selector: 'app-classique',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ClassiqueGame, MessageService],
  imports: [
    Button,
    Chip,
    Toast,
    DealerHand,
    PlayerHand,
    BetControls,
    ActionBar,
    SettingsDialog,
    ConfettiOverlay,
  ],
  templateUrl: './classique.page.html',
})
export class ClassiquePage {
  /** Moteur de jeu, fourni au niveau de la page (état lié à son cycle de vie). */
  protected readonly game: ClassiqueGame = inject(ClassiqueGame);

  private readonly router: Router = inject(Router);

  /** Visibilité de la modale de réglages (état purement visuel). */
  protected readonly showSettings: WritableSignal<boolean> = signal(false);

  /** Valeurs de jetons proposées pour la mise. */
  protected readonly chips: number[] = [50, 100, 500, 1000];

  /** Retourne au lobby. */
  protected goHome(): void {
    this.router.navigate(['/']);
  }
}
