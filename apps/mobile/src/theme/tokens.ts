/**
 * Tokens de l'interface. Toute la couleur passe par ici : une palette = un jeu de valeurs pour les rôles de `Theme`.
 * Palettes disponibles : `gravure` (par défaut), `doom`, `raven`. Voir docs/DIRECTION_ARTISTIQUE.md
 * et docs/PROPOSITIONS_COULEURS.md.
 */
import { palettes, type PaletteName } from './palettes';
import type { Theme } from './types';

export type { Theme } from './types';
export { palettes, type PaletteName } from './palettes';

/** La palette active. Changer de palette = changer ce nom. */
export const ACTIVE_PALETTE: PaletteName = 'gravure';

export const theme: Theme = palettes[ACTIVE_PALETTE];

/**
 * Grenze Gotisch : gothique lisible, pour les titres seulement (la touche néo-gothique).
 * Barlow : texte courant. Barlow Condensed : libellés en capitales.
 */
export const fonts = { display: 'GrenzeGotisch', text: 'Barlow', label: 'BarlowCondensed' } as const;

export const radius = { sm: 3, md: 5 } as const;
/** Cible tactile minimale (une main, en rayon). */
export const TOUCH = 48;
