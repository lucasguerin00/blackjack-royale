import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Préréglage de thème PrimeNG « Casino ».
 *
 * Base Aura, couleur primaire redéfinie en or (palette `amber`) pour coller à
 * l'identité feutre/or de l'application. Le rendu sombre est activé via le
 * sélecteur `.app-dark` (voir `providePrimeNG` dans `app.config.ts` et la classe
 * posée sur `<html>` dans `index.html`).
 *
 * @export
 */
export const CasinoPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{amber.50}',
      100: '{amber.100}',
      200: '{amber.200}',
      300: '{amber.300}',
      400: '{amber.400}',
      500: '{amber.500}',
      600: '{amber.600}',
      700: '{amber.700}',
      800: '{amber.800}',
      900: '{amber.900}',
      950: '{amber.950}',
    },
  },
});
