/**
 * Gravure « outremer » (tranchée) : blanc pur, noir pur, un bleu outremer franc. Aucun gris de papier.
 * Les bordures sont noires : chaque carte est un cadre net. Contrastes : docs/PROPOSITIONS_COULEURS.md.
 */
import type { Theme } from '../types';

export const palette = {
  // Blanc : la couleur dominante.
  blanc: '#FFFFFF',
  blancPresse: '#EDEDED', // surface pressée, pistes
  // Noir.
  noir: '#000000', // texte, gravures, bordures, bouton principal (21:1)
  noirVoile: '#4A4A4A', // texte secondaire (8,9:1)
  noirPale: '#7A7A7A', // décor, icônes inactives (4,3:1)
  // Outremer : le seul rehaut.
  outremer: '#1A3FD9', // (7,6:1 sur le blanc)
  outremerSombre: '#102A9E',
  outremerPale: '#E3E8FF',
} as const;

export const outremer: Theme = {
  scheme: 'light',
  bg: palette.blanc, card: palette.blanc, raised: palette.blancPresse,
  text: palette.noir, muted: palette.noirVoile, faint: palette.noirPale,
  border: palette.noir, borderStrong: palette.noir,
  accent: palette.outremer, accentDeep: palette.outremerSombre, accentSoft: palette.outremerPale,
  ink: palette.noir, onInk: palette.blanc,
  partner: palette.noir, partnerSoft: palette.blancPresse,
  warn: palette.outremer, warnSoft: palette.outremerPale,
  danger: palette.outremer, dangerSoft: palette.outremerPale,
};
