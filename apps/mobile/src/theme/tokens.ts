/**
 * Direction artistique « Palestre » : statues grecques sorties de l'ombre, éclairées par la braise,
 * sous des arcs néo-gothiques. Source unique des couleurs, polices et mesures.
 * Voir docs/DIRECTION_ARTISTIQUE.md.
 */

/** Matières. Les noms décrivent la matière, jamais l'usage. */
export const palette = {
  nuit: '#0B0A09', // fond : l'ombre d'où sortent les statues
  pierre: '#161412', // cartes
  pierreClaire: '#221F1B', // surface pressée
  joint: '#2E2A25', // bordures
  jointFort: '#4D463D', // contours des contrôles
  marbre: '#F2ECE1', // texte principal
  marbreVoile: '#ADA598', // texte secondaire
  marbreOmbre: '#70695F', // décor, icônes inactives : jamais un texte à lire
  braise: '#FF6B3D', // accent : action, sélection
  braiseClaire: '#FFB46E',
  braiseSombre: '#A8371C',
  egee: '#8CC4FF', // ce qui concerne la compagne
  ambre: '#F5C451', // avertissements
  carmin: '#FF5D7A', // danger
} as const;

/** Rôles sémantiques. Les écrans ne lisent que ces clés. */
export interface Theme {
  bg: string; card: string; raised: string; text: string; muted: string; faint: string;
  border: string; borderStrong: string;
  accent: string; accentBright: string; accentDeep: string; accentSoft: string; onAccent: string;
  partner: string; partnerSoft: string;
  warn: string; warnSoft: string;
  danger: string; dangerSoft: string;
}

export const theme: Theme = {
  bg: palette.nuit, card: palette.pierre, raised: palette.pierreClaire,
  text: palette.marbre, muted: palette.marbreVoile, faint: palette.marbreOmbre,
  border: palette.joint, borderStrong: palette.jointFort,
  accent: palette.braise, accentBright: palette.braiseClaire, accentDeep: palette.braiseSombre, accentSoft: '#2A150D', onAccent: '#1A0B05',
  partner: palette.egee, partnerSoft: '#101D2B',
  warn: palette.ambre, warnSoft: '#2A210C',
  danger: palette.carmin, dangerSoft: '#2D1017',
};

export const gradients = {
  /** Bouton principal : de la flamme claire à la braise. */
  braise: [palette.braiseClaire, palette.braise] as const,
  /** Raccord entre une statue et le contenu : l'ombre remonte. */
  ombre: ['rgba(11, 10, 9, 0)', 'rgba(11, 10, 9, 0.85)', palette.nuit] as const,
};

/**
 * Grenze Gotisch : gothique lisible, pour les titres seulement (la touche néo-gothique).
 * Barlow : texte courant. Barlow Condensed : libellés en capitales, façon maillot.
 */
export const fonts = { display: 'GrenzeGotisch', text: 'Barlow', label: 'BarlowCondensed' } as const;

export const radius = { sm: 3, md: 5 } as const;
/** Cible tactile minimale (une main, en rayon). */
export const TOUCH = 48;
