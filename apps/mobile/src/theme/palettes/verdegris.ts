/**
 * Gravure « vert-de-gris » (claire) : le papier et l'encre de Gravure, le rouge remplacé par la patine du cuivre.
 * Trois couleurs : papier (dominant), encre, vert-de-gris. Contrastes : docs/PROPOSITIONS_COULEURS.md.
 */
import type { Theme } from '../types';
import { palette as gravure } from './gravure';

export const palette = {
  ...gravure,
  vert: '#2E6B5E', // rehaut (5,4:1 sur le papier)
  vertSombre: '#1F4D43', // texte sur fond vert pâle (7,6:1)
  vertPale: '#DCE8E3',
} as const;

export const verdegris: Theme = {
  scheme: 'light',
  bg: palette.papier, card: palette.papierClair, raised: palette.papierOmbre,
  text: palette.encre, muted: palette.encreVoile, faint: palette.encrePale,
  border: palette.filet, borderStrong: palette.encrePale,
  accent: palette.vert, accentDeep: palette.vertSombre, accentSoft: palette.vertPale,
  ink: palette.encre, onInk: palette.papierClair,
  partner: palette.encre, partnerSoft: palette.papierOmbre,
  warn: palette.vert, warnSoft: palette.vertPale,
  danger: palette.vert, dangerSoft: palette.vertPale,
};
