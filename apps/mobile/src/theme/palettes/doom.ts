/**
 * « Doom » : métal noirci, armure verte, rouge vif. Sombre et tranché.
 * Trois couleurs : l'acier (dominant, du presque noir à l'acier poli du texte), le vert armure, le rouge.
 * Pas d'orange, volontairement. Contrastes mesurés : docs/PROPOSITIONS_COULEURS.md.
 */
import type { Theme } from '../types';

export const palette = {
  // Acier : la couleur dominante. Du métal brut au métal poli.
  acier: '#161A19', // fond
  acierCarte: '#202524', // cartes
  acierPresse: '#2B312F', // surface pressée, pistes
  acierFilet: '#3A423F', // bordures
  acierTerne: '#7F8A85', // décor, icônes inactives (4,9:1 sur le fond)
  acierVoile: '#AEB8B3', // texte secondaire (8,6:1)
  acierPoli: '#EEF1EE', // texte, gravures (15,4:1)
  // Vert armure : l'aplat.
  armure: '#8CAF52', // bouton principal, compagne (7,0:1 avec le fond posé dessus)
  armureOmbre: '#26301E', // fond doux de la compagne
  // Rouge : le seul rehaut.
  rouge: '#FF4A5E', // rehaut (5,3:1 sur le fond, 4,7:1 sur une carte)
  rougeClair: '#FF8593', // texte sur fond rouge doux (7,0:1)
  rougeOmbre: '#3A1419', // fond doux
} as const;

export const doom: Theme = {
  scheme: 'dark',
  bg: palette.acier, card: palette.acierCarte, raised: palette.acierPresse,
  text: palette.acierPoli, muted: palette.acierVoile, faint: palette.acierTerne,
  border: palette.acierFilet, borderStrong: palette.acierTerne,
  accent: palette.rouge, accentDeep: palette.rougeClair, accentSoft: palette.rougeOmbre,
  // L'aplat est vert, le texte posé dessus est l'acier du fond : la coche sur le rouge aussi (5,3:1).
  ink: palette.armure, onInk: palette.acier,
  partner: palette.armure, partnerSoft: palette.armureOmbre,
  warn: palette.rouge, warnSoft: palette.rougeOmbre,
  danger: palette.rouge, dangerSoft: palette.rougeOmbre,
};
