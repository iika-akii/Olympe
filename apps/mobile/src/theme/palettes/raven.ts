/**
 * « Raven » : plumage noir aux reflets violets, regard qui luit. Sombre et tranché.
 * Trois couleurs : la plume (dominante, noir violacé), la lueur (blanc froid), l'améthyste.
 * Contrastes mesurés : docs/PROPOSITIONS_COULEURS.md.
 */
import type { Theme } from '../types';

export const palette = {
  // Plume : la couleur dominante.
  plume: '#100D16', // fond
  plumeCarte: '#1A1622', // cartes
  plumePresse: '#252030', // surface pressée, pistes
  plumeFilet: '#342D42', // bordures
  plumeTerne: '#8A8299', // décor, icônes inactives (5,3:1 sur le fond)
  // Lueur : le texte et l'aplat.
  lueur: '#F1EEF8', // texte, gravures, bouton principal (16,8:1)
  lueurVoile: '#B7B0C6', // texte secondaire (9,2:1)
  // Améthyste : le seul rehaut.
  amethyste: '#B28CFF', // rehaut (7,4:1 sur le fond, 6,8:1 sur une carte)
  amethysteClair: '#CDB4FF', // texte sur fond violet doux (8,1:1)
  amethysteOmbre: '#2E2245', // fond doux
} as const;

export const raven: Theme = {
  scheme: 'dark',
  bg: palette.plume, card: palette.plumeCarte, raised: palette.plumePresse,
  text: palette.lueur, muted: palette.lueurVoile, faint: palette.plumeTerne,
  border: palette.plumeFilet, borderStrong: palette.plumeTerne,
  accent: palette.amethyste, accentDeep: palette.amethysteClair, accentSoft: palette.amethysteOmbre,
  ink: palette.lueur, onInk: palette.plume,
  // Même principe que la gravure : la compagne se dit par l'aplat (ici la lueur), l'alerte par le rehaut.
  partner: palette.lueur, partnerSoft: palette.plumePresse,
  warn: palette.amethyste, warnSoft: palette.amethysteOmbre,
  danger: palette.amethyste, dangerSoft: palette.amethysteOmbre,
};
