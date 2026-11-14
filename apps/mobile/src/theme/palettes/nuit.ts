/**
 * Gravure « nuit » (sombre) : Gravure retournée. L'encre devient le fond, le papier devient le texte, le rouge s'éclaircit.
 * Trois couleurs : encre (dominante), papier, rouge sang. Contrastes : docs/PROPOSITIONS_COULEURS.md.
 * Limite : les gravures, dessinées pour l'encre sur papier, s'y affichent en négatif.
 */
import type { Theme } from '../types';

export const palette = {
  // Encre : la couleur dominante.
  encre: '#17130F', // fond
  encreCarte: '#211C17', // cartes
  encrePresse: '#2C261F', // surface pressée, pistes
  encreFilet: '#3D352C', // bordures
  encreTerne: '#8F8577', // décor, icônes inactives (5,1:1)
  // Papier : le texte et l'aplat.
  papier: '#F4EFE6', // texte, gravures, bouton principal (16,1:1)
  papierVoile: '#BDB3A3', // texte secondaire (8,2:1 sur une carte)
  // Rouge sang, éclairci pour le fond sombre.
  sang: '#F0566A', // (5,5:1 sur le fond, 5,0:1 sur une carte)
  sangClair: '#F59AA5',
  sangOmbre: '#3E1A1D',
} as const;

export const nuit: Theme = {
  scheme: 'dark',
  bg: palette.encre, card: palette.encreCarte, raised: palette.encrePresse,
  text: palette.papier, muted: palette.papierVoile, faint: palette.encreTerne,
  border: palette.encreFilet, borderStrong: palette.encreTerne,
  accent: palette.sang, accentDeep: palette.sangClair, accentSoft: palette.sangOmbre,
  ink: palette.papier, onInk: palette.encre,
  partner: palette.papier, partnerSoft: palette.encrePresse,
  warn: palette.sang, warnSoft: palette.sangOmbre,
  danger: palette.sang, dangerSoft: palette.sangOmbre,
};
