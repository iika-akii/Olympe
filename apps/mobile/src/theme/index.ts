import { theme, type Theme } from './tokens';

export * from './tokens';
export { useAppFonts } from './fonts';

/** Le thème de la palette active (`ACTIVE_PALETTE` dans tokens.ts). */
export function useTheme(): Theme {
  return theme;
}
