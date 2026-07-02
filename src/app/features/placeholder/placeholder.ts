import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Button } from 'primeng/button';

/**
 * Écran générique « mode en construction », piloté par les data de route.
 * @export
 * @class Placeholder
 */
@Component({
  selector: 'app-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button],
  template: `
    <!-- Retour au lobby -->
    <div class="mx-auto flex max-w-[1500px] px-[18px] pt-3.5">
      <p-button label="← Accueil" severity="secondary" [text]="true" (onClick)="back()" />
    </div>

    <!-- Message « bientôt disponible » -->
    <div class="mx-auto max-w-[620px] px-5 py-16 text-center">
      <div class="text-7xl">{{ icon }}</div>
      <h1 class="my-3 text-4xl font-bold text-amber-400">{{ mode }}</h1>
      <p class="mb-6 text-emerald-200/70">
        Ce mode est en construction. Il arrive très bientôt ! 🚧
      </p>
      <p-button label="Retour au menu" (onClick)="back()" />
    </div>
  `,
})
export class Placeholder {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** Nom du mode (donnée de route). */
  protected readonly mode = this.route.snapshot.data['mode'] ?? 'Mode';
  /** Émoji du mode (donnée de route). */
  protected readonly icon = this.route.snapshot.data['icon'] ?? '🚧';

  /** Retourne au lobby. */
  protected back(): void {
    this.router.navigate(['/']);
  }
}
