/** Rôles sémantiques. Les écrans ne lisent que ces clés ; une palette n'est qu'un jeu de valeurs pour elles. */
export interface Theme {
  /** Clair ou sombre : règle la barre d'état et le thème de navigation, jamais une couleur d'écran. */
  scheme: 'light' | 'dark';
  bg: string; card: string; raised: string; text: string; muted: string; faint: string;
  border: string; borderStrong: string;
  /** Rehaut : sélection, repère du jour, liens. `accentDeep` : texte sur `accentSoft`. */
  accent: string; accentDeep: string; accentSoft: string;
  /** Aplat : action principale, présence de la compagne. `onInk` : texte et coche posés sur un aplat ou sur le rehaut. */
  ink: string; onInk: string;
  partner: string; partnerSoft: string;
  warn: string; warnSoft: string;
  danger: string; dangerSoft: string;
}
