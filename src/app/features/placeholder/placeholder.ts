import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

/** Écran générique « mode en construction », piloté par les data de route. */
@Component({
  selector: 'app-placeholder',
  imports: [RouterLink],
  template: `
    <div class="topnav"><a class="retour" routerLink="/">← Accueil</a></div>
    <div class="ph">
      <div class="ic">{{ icon }}</div>
      <h1>{{ mode }}</h1>
      <p>Ce mode est en construction. Il arrive très bientôt ! 🚧</p>
      <a class="btn" routerLink="/">Retour au menu</a>
    </div>
  `,
  styles: [
    `
      .ph {
        text-align: center;
        padding: 70px 20px;
        max-width: 620px;
        margin: 0 auto;
      }
      .ph .ic {
        font-size: 76px;
      }
      .ph h1 {
        font-size: 34px;
        color: var(--or);
        margin: 10px 0;
      }
      .ph p {
        color: #a9d8bd;
        margin-bottom: 24px;
      }
    `,
  ],
})
export class Placeholder {
  private readonly route = inject(ActivatedRoute);
  protected readonly mode = this.route.snapshot.data['mode'] ?? 'Mode';
  protected readonly icon = this.route.snapshot.data['icon'] ?? '🚧';
}
