import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { InputText } from 'primeng/inputtext';
import { Profile } from '../../../../core/models/game.model';

/**
 * Éditeur de profil (dumb) : aperçu live, saisie du nom, sélecteur d'avatar et
 * de titre. Reçoit directement le type domaine `Profile` et émet chaque
 * intention de modification vers la page ; aucune injection de service.
 * @export
 * @class ProfileEditor
 */
@Component({
  selector: 'app-profile-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Avatar, Button, Card, Divider, InputText],
  templateUrl: './profile-editor.html',
})
export class ProfileEditor {
  /** Profil courant à éditer. */
  readonly profile: InputSignal<Profile> = input.required<Profile>();
  /** Palette d'avatars sélectionnables. */
  readonly avatars: InputSignal<readonly string[]> = input.required<readonly string[]>();
  /** Titres décoratifs sélectionnables. */
  readonly titles: InputSignal<readonly string[]> = input.required<readonly string[]>();

  /** Nouveau nom validé (Entrée ou bouton « Enregistrer »). */
  readonly nameChanged: OutputEmitterRef<string> = output<string>();
  /** Avatar choisi dans la palette. */
  readonly avatarChanged: OutputEmitterRef<string> = output<string>();
  /** Titre choisi dans la liste. */
  readonly titleChanged: OutputEmitterRef<string> = output<string>();
}
