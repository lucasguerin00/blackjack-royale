import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { ProfileService } from '../../../../core/services/profile.service';
import { ProfileEditor } from '../../components/profile-editor/profile-editor';

/**
 * Écran Profil (smart). Compose l'éditeur dumb et relaie ses intentions
 * (nom, avatar, titre) vers le `ProfileService`.
 * @export
 * @class ProfilPage
 */
@Component({
  selector: 'app-profil',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, ProfileEditor],
  templateUrl: './profil.page.html',
})
export class ProfilPage {
  private readonly profileSvc = inject(ProfileService);
  private readonly router = inject(Router);

  /** Profil courant exposé au template. */
  protected readonly profile = this.profileSvc.profile;
  /** Palette d'avatars proposée par le service. */
  protected readonly avatars = this.profileSvc.avatars;
  /** Titres proposés par le service. */
  protected readonly titles = this.profileSvc.titles;

  /** Retourne au lobby. */
  protected back(): void {
    this.router.navigate(['/']);
  }

  /** Enregistre le nouveau nom (le service valide/tronque). */
  protected onName(name: string): void {
    this.profileSvc.setName(name);
  }

  /** Applique l'avatar sélectionné. */
  protected onAvatar(avatar: string): void {
    this.profileSvc.setAvatar(avatar);
  }

  /** Applique le titre sélectionné. */
  protected onTitle(title: string): void {
    this.profileSvc.setTitle(title);
  }
}
