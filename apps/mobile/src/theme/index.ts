import { theme, type Theme } from './tokens';

export * from './tokens';
export { useAppFonts } from './fonts';

/** Thème unique, sombre : les statues sortent de l'ombre, il n'y a pas de version claire. */
export function useTheme(): Theme {
  return theme;
}
