/**
 * Direction artistique « Temple de nuit » : nef gothique, marbre antique, or et flamme.
 * Source unique des couleurs, de la typographie et des mesures. Aucun écran ne code une couleur en dur.
 * Voir docs/DIRECTION_ARTISTIQUE.md.
 */

/** Matières. Les noms décrivent la matière, jamais l'usage. */
export const palette = {
  nyx: '#08070D', // nuit : fond de l'app
  crypte: '#110F1A', // pierre sombre : cartes
  voute: '#1A1728', // pierre éclairée : surfaces en relief, pressées
  ligne: '#2A2640', // joint de pierre : bordures
  ligneForte: '#453E6B', // bordures des contrôles
  marbre: '#F2EDE3', // texte principal
  veine: '#A8A2B8', // texte secondaire (7,7:1 sur crypte)
  cendre: '#6E6982', // décor, icônes inactives (3,6:1 : jamais pour un texte à lire)
  or: '#E9BE62', // laurier : accent, sélection, données de l'utilisateur
  orClair: '#F8DD9A',
  orSombre: '#A27A28',
  flamme: '#FF7A3D', // torche : attention, énergie
  ether: '#A891FF', // éther : la compagne, lueur d'ambiance
  sang: '#FF5D73', // danger, action destructive
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
  bg: palette.nyx, card: palette.crypte, raised: palette.voute,
  text: palette.marbre, muted: palette.veine, faint: palette.cendre,
  border: palette.ligne, borderStrong: palette.ligneForte,
  accent: palette.or, accentBright: palette.orClair, accentDeep: palette.orSombre, accentSoft: '#241D12', onAccent: palette.nyx,
  partner: palette.ether, partnerSoft: '#1C1735',
  warn: palette.flamme, warnSoft: '#2A170F',
  danger: palette.sang, dangerSoft: '#2B1119',
};

/** Dégradés de marque : réservés aux moments forts (bouton principal, anneau du jour, emblème). */
export const gradients = {
  or: [palette.orClair, palette.or, '#C99A3C'] as const,
  flamme: [palette.flamme, palette.or, palette.orClair] as const,
  aurore: ['rgba(126, 99, 255, 0.20)', 'rgba(126, 99, 255, 0.06)', 'rgba(8, 7, 13, 0)'] as const,
};

/** Cinzel : capitales d'inscription romaine. Jost : géométrique, lisible en cuisine et en rayon. */
export const fonts = { display: 'Cinzel', text: 'Jost' } as const;

/** Pierre taillée : angles presque vifs, jamais de pilule. */
export const radius = { sm: 2, md: 4 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
/** Cible tactile minimale (une main, en rayon). */
export const TOUCH = 48;
