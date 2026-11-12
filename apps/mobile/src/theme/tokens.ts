/**
 * Direction artistique « Gravure » : un livre de mythologie gravé, encre noire sur papier, rehauts de rouge.
 * Trois couleurs, pas une de plus : le papier (dominant), l'encre, le rouge sang.
 * Voir docs/DIRECTION_ARTISTIQUE.md.
 */

/** Les trois couleurs et leurs nuances. Les noms décrivent la matière, jamais l'usage. */
export const palette = {
  // Papier : la couleur dominante.
  papier: '#F4EFE6', // fond
  papierClair: '#FBF8F2', // cartes
  papierOmbre: '#E8E1D4', // surface pressée, pistes
  filet: '#D3CABA', // bordures
  // Encre.
  encre: '#17130F', // texte, gravures, bouton principal
  encreVoile: '#5B5348', // texte secondaire (6,6:1 sur le papier)
  encrePale: '#988F82', // décor, icônes inactives : jamais un texte à lire
  // Rouge sang : le seul rehaut.
  sang: '#B3122B',
  sangSombre: '#8A0E21',
  sangPale: '#F2DCD9',
} as const;

/** Rôles sémantiques. Les écrans ne lisent que ces clés. */
export interface Theme {
  bg: string; card: string; raised: string; text: string; muted: string; faint: string;
  border: string; borderStrong: string;
  /** Rehaut : sélection, repère du jour, liens. */
  accent: string; accentDeep: string; accentSoft: string;
  /** Aplat d'encre : action principale, présence de la compagne. */
  ink: string; onInk: string;
  partner: string; partnerSoft: string;
  warn: string; warnSoft: string;
  danger: string; dangerSoft: string;
}

export const theme: Theme = {
  bg: palette.papier, card: palette.papierClair, raised: palette.papierOmbre,
  text: palette.encre, muted: palette.encreVoile, faint: palette.encrePale,
  border: palette.filet, borderStrong: palette.encrePale,
  accent: palette.sang, accentDeep: palette.sangSombre, accentSoft: palette.sangPale,
  ink: palette.encre, onInk: palette.papierClair,
  // Trois couleurs seulement : ce qui concerne la compagne se dit à l'encre, l'alerte au rouge.
  partner: palette.encre, partnerSoft: palette.papierOmbre,
  warn: palette.sang, warnSoft: palette.sangPale,
  danger: palette.sang, dangerSoft: palette.sangPale,
};

/**
 * Grenze Gotisch : gothique lisible, pour les titres seulement (la touche néo-gothique).
 * Barlow : texte courant. Barlow Condensed : libellés en capitales.
 */
export const fonts = { display: 'GrenzeGotisch', text: 'Barlow', label: 'BarlowCondensed' } as const;

export const radius = { sm: 3, md: 5 } as const;
/** Cible tactile minimale (une main, en rayon). */
export const TOUCH = 48;
