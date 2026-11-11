import { theme, type Theme } from './tokens';

export * from './tokens';
export { useAppFonts } from './fonts';

/**
 * Thème unique, sombre : la DA « Temple de nuit » n'a pas de version claire.
 * Le hook reste le point d'accès des écrans, pour pouvoir réintroduire un second thème sans les toucher.
 */
export function useTheme(): Theme {
  return theme;
}
