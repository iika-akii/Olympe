/**
 * « Gravure » : un livre de mythologie gravé. Lettre gothique pour les titres, quadrilobe, angles presque vifs.
 * Voir docs/DIRECTION_ARTISTIQUE.md.
 */
import type { Direction } from '../types';

const F = { display: 'GrenzeGotisch', text: 'Barlow', label: 'BarlowCondensed' } as const;
const tab = ['tabular-nums'] as const;

export const gravure: Direction = {
  name: 'gravure',
  label: 'Gravure',
  families: F,
  fontFiles: [
    { family: F.display, files: [{ path: require('@expo-google-fonts/grenze-gotisch/600SemiBold/GrenzeGotisch_600SemiBold.ttf'), weight: 600, style: 'normal' }] },
    {
      family: F.text,
      files: [
        { path: require('@expo-google-fonts/barlow/400Regular/Barlow_400Regular.ttf'), weight: 400, style: 'normal' },
        { path: require('@expo-google-fonts/barlow/500Medium/Barlow_500Medium.ttf'), weight: 500, style: 'normal' },
        { path: require('@expo-google-fonts/barlow/600SemiBold/Barlow_600SemiBold.ttf'), weight: 600, style: 'normal' },
      ],
    },
    { family: F.label, files: [{ path: require('@expo-google-fonts/barlow-condensed/600SemiBold/BarlowCondensed_600SemiBold.ttf'), weight: 600, style: 'normal' }] },
  ],
  type: {
    heroTitle: { fontFamily: F.display, fontWeight: '600', fontSize: 40, lineHeight: 44 },
    heroKicker: { fontFamily: F.label, fontWeight: '600', fontSize: 15, lineHeight: 18, letterSpacing: 3, textTransform: 'uppercase' },
    title: { fontFamily: F.display, fontWeight: '600', fontSize: 30, lineHeight: 36 },
    heading: { fontFamily: F.display, fontWeight: '600', fontSize: 22, lineHeight: 28 },
    section: { fontFamily: F.label, fontWeight: '600', fontSize: 15, lineHeight: 18, letterSpacing: 2.2, textTransform: 'uppercase' },
    body: { fontFamily: F.text, fontWeight: '400', fontSize: 16, lineHeight: 22 },
    strong: { fontFamily: F.text, fontWeight: '600', fontSize: 16, lineHeight: 22 },
    small: { fontFamily: F.text, fontWeight: '400', fontSize: 13, lineHeight: 18 },
    label: { fontFamily: F.label, fontWeight: '600', fontSize: 13, lineHeight: 16, letterSpacing: 1.4, textTransform: 'uppercase' },
    number: { fontFamily: F.text, fontWeight: '500', fontSize: 16, lineHeight: 22, fontVariant: [...tab] },
    button: { fontFamily: F.label, fontWeight: '600', fontSize: 17, lineHeight: 20, letterSpacing: 1.6, textTransform: 'uppercase' },
    badge: { fontFamily: F.label, fontWeight: '600', fontSize: 13, lineHeight: 16, letterSpacing: 1, textTransform: 'uppercase' },
    banner: { fontFamily: F.text, fontWeight: '500', fontSize: 15, lineHeight: 21 },
    chip: { fontFamily: F.text, fontWeight: '600', fontSize: 14, lineHeight: 20, textAlign: 'center' },
    statValue: { fontFamily: F.text, fontWeight: '600', fontSize: 22, lineHeight: 26, fontVariant: [...tab] },
    statUnit: { fontFamily: F.text, fontWeight: '400', fontSize: 13 },
    stepValue: { fontFamily: F.text, fontWeight: '600', fontSize: 24, fontVariant: [...tab] },
    fieldInput: { fontFamily: F.text, fontWeight: '500', fontSize: 18, fontVariant: [...tab] },
    tabLabel: { fontFamily: F.text, fontWeight: '600', fontSize: 11, lineHeight: 15 },
    headerTitle: { fontFamily: F.display, fontWeight: '600', fontSize: 22 },
    step: { fontFamily: F.display, fontWeight: '600', fontSize: 20, lineHeight: 24 },
  },
  shape: {
    sm: 3, md: 5, button: 5, chip: 5, buttonBorder: 1,
    card: { borderRadius: 5, borderWidth: 1 },
    sectionLine: { height: 1 },
  },
  ornament: 'quadrilobe',
  hero: 'gravure',
  // Proportions : largeur / hauteur de chaque fichier, telles que scripts/prepare-engravings.py les affiche.
  images: {
    adam: { source: require('../../../assets/gravures/adam.webp'), ratio: 1440 / 634 },
    ange: { source: require('../../../assets/gravures/ange.webp'), ratio: 1440 / 891 },
    hercule: { source: require('../../../assets/gravures/hercule.webp'), ratio: 1040 / 625 },
    forge: { source: require('../../../assets/gravures/forge.webp'), ratio: 1440 / 878 },
    bacchus: { source: require('../../../assets/gravures/bacchus.webp'), ratio: 1161 / 1037 },
    phaeton: { source: require('../../../assets/gravures/phaeton.webp'), ratio: 900 / 923 },
  },
  credit: 'Gravures : Metropolitan Museum of Art (Open Access) et Wikimedia Commons, domaine public.',
};
