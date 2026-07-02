import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';

/** Une pièce de confetti (position, timing, symbole). */
interface ConfettiPiece {
  readonly left: number;
  readonly delay: number;
  readonly dur: number;
  readonly emoji: string;
}

/**
 * Pluie de confettis affichée lors d'une victoire. Dumb : un simple booléen
 * `active` déclenche l'animation.
 * @export
 * @class ConfettiOverlay
 */
@Component({
  selector: 'app-confetti-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confetti-overlay.html',
  styleUrl: './confetti-overlay.scss',
})
export class ConfettiOverlay {
  /** Déclenche l'animation de confettis. */
  readonly active: InputSignal<boolean> = input(false);

  /** Pièces de confetti pré-calculées (positions et timings variés). */
  protected readonly pieces: ConfettiPiece[] = Array.from({ length: 26 }, (_, i) => ({
    left: (i * 37 + 13) % 100,
    delay: (i % 10) * 55,
    dur: 950 + (i % 6) * 170,
    emoji: ['🎉', '✨', '💛', '🃏', '💎', '🎊'][i % 6],
  }));
}
