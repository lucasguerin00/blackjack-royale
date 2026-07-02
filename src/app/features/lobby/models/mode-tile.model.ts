/**
 * Tuile de mode de jeu affichée dans le lobby.
 * @export
 * @interface ModeTile
 */
export interface ModeTile {
  /** Émoji illustrant le mode. */
  readonly icon: string;
  /** Nom du mode. */
  readonly name: string;
  /** Description courte. */
  readonly desc: string;
  /** Route associée. */
  readonly path: string;
  /** Le mode est jouable (sinon « bientôt »). */
  readonly available: boolean;
}
