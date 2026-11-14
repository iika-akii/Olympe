/**
 * « Doom » : la salle des machines. Capitales étroites et hautes, texte au dessin anguleux,
 * plaques d'acier à angles vifs et rivet en guise de puce. Images : Gustave Doré, « L'Enfer » de Dante (1861).
 * Voir docs/DA_DOOM_RAVEN.md.
 */
import type { Direction } from '../types';

const F = { display: 'Teko', text: 'ChakraPetch', label: 'TekoLabel' } as const;
const tab = ['tabular-nums'] as const;

export const doom: Direction = {
  name: 'doom',
  label: 'Doom',
  families: F,
  fontFiles: [
    {
      family: F.display,
      files: [
        { path: require('@expo-google-fonts/teko/600SemiBold/Teko_600SemiBold.ttf'), weight: 600, style: 'normal' },
        { path: require('@expo-google-fonts/teko/700Bold/Teko_700Bold.ttf'), weight: 700, style: 'normal' },
      ],
    },
    {
      family: F.text,
      files: [
        { path: require('@expo-google-fonts/chakra-petch/400Regular/ChakraPetch_400Regular.ttf'), weight: 400, style: 'normal' },
        { path: require('@expo-google-fonts/chakra-petch/500Medium/ChakraPetch_500Medium.ttf'), weight: 500, style: 'normal' },
        { path: require('@expo-google-fonts/chakra-petch/600SemiBold/ChakraPetch_600SemiBold.ttf'), weight: 600, style: 'normal' },
      ],
    },
    { family: F.label, files: [{ path: require('@expo-google-fonts/teko/500Medium/Teko_500Medium.ttf'), weight: 500, style: 'normal' }] },
  ],
  type: {
    heroTitle: { fontFamily: F.display, fontWeight: '700', fontSize: 60, lineHeight: 58, letterSpacing: 1, textTransform: 'uppercase' },
    heroKicker: { fontFamily: F.text, fontWeight: '600', fontSize: 13, lineHeight: 16, letterSpacing: 3, textTransform: 'uppercase' },
    title: { fontFamily: F.display, fontWeight: '600', fontSize: 40, lineHeight: 42, textTransform: 'uppercase' },
    heading: { fontFamily: F.display, fontWeight: '600', fontSize: 28, lineHeight: 30, letterSpacing: 0.5, textTransform: 'uppercase' },
    section: { fontFamily: F.label, fontWeight: '500', fontSize: 21, lineHeight: 22, letterSpacing: 2, textTransform: 'uppercase' },
    body: { fontFamily: F.text, fontWeight: '400', fontSize: 16, lineHeight: 23 },
    strong: { fontFamily: F.text, fontWeight: '600', fontSize: 16, lineHeight: 23 },
    small: { fontFamily: F.text, fontWeight: '400', fontSize: 13, lineHeight: 18 },
    label: { fontFamily: F.label, fontWeight: '500', fontSize: 17, lineHeight: 18, letterSpacing: 1.5, textTransform: 'uppercase' },
    number: { fontFamily: F.text, fontWeight: '500', fontSize: 16, lineHeight: 22, fontVariant: [...tab] },
    button: { fontFamily: F.display, fontWeight: '600', fontSize: 22, lineHeight: 24, letterSpacing: 2, textTransform: 'uppercase' },
    badge: { fontFamily: F.label, fontWeight: '500', fontSize: 16, lineHeight: 17, letterSpacing: 1, textTransform: 'uppercase' },
    banner: { fontFamily: F.text, fontWeight: '500', fontSize: 15, lineHeight: 21 },
    chip: { fontFamily: F.text, fontWeight: '600', fontSize: 14, lineHeight: 20, textAlign: 'center' },
    statValue: { fontFamily: F.display, fontWeight: '600', fontSize: 36, lineHeight: 36, fontVariant: [...tab] },
    statUnit: { fontFamily: F.text, fontWeight: '400', fontSize: 13 },
    stepValue: { fontFamily: F.display, fontWeight: '600', fontSize: 36, fontVariant: [...tab] },
    fieldInput: { fontFamily: F.text, fontWeight: '500', fontSize: 18, fontVariant: [...tab] },
    tabLabel: { fontFamily: F.text, fontWeight: '600', fontSize: 11, lineHeight: 15 },
    headerTitle: { fontFamily: F.display, fontWeight: '600', fontSize: 28, letterSpacing: 1, textTransform: 'uppercase' },
    step: { fontFamily: F.display, fontWeight: '600', fontSize: 28, lineHeight: 28 },
  },
  shape: {
    sm: 0, md: 2, button: 2, chip: 2, buttonBorder: 2,
    // Une plaque : angles vifs, tranche gauche épaisse.
    card: { borderRadius: 2, borderWidth: 1, borderLeftWidth: 4 },
    sectionLine: { height: 2 },
  },
  ornament: 'rivet',
  hero: 'doom',
  images: {
    adam: { source: require('../../../assets/doom/aujourdhui.webp'), ratio: 1440 / 880 },
    hercule: { source: require('../../../assets/doom/entrainement.webp'), ratio: 1440 / 880 },
    forge: { source: require('../../../assets/doom/forger.webp'), ratio: 1440 / 880 },
    bacchus: { source: require('../../../assets/doom/cuisine.webp'), ratio: 1440 / 880 },
    ange: { source: require('../../../assets/doom/profil.webp'), ratio: 1440 / 880 },
    phaeton: { source: require('../../../assets/doom/attente.webp'), ratio: 1 },
  },
  credit: 'Images : Gustave Doré, illustrations de « L’Enfer » de Dante (1861), Wikimedia Commons, domaine public.',
};
