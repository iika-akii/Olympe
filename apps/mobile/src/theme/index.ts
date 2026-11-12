import { theme, type Theme } from './tokens';

export * from './tokens';
export { useAppFonts } from './fonts';

/** Thème unique, clair : encre sur papier. */
export function useTheme(): Theme {
  return theme;
}
