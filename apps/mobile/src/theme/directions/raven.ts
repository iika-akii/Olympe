/**
 * « Raven » : un recueil de poèmes noirs. Romain ancien en italique pour les titres, capitales lapidaires,
 * texte en romain de lecture, formes arrondies et croissant de lune en guise de puce.
 * Images : Gustave Doré, « Le Corbeau » d'Edgar Poe (1884). Voir docs/DA_DOOM_RAVEN.md.
 */
import type { Direction } from '../types';

const F = { display: 'IMFellEnglish', text: 'Spectral', label: 'Cinzel' } as const;
const tab = ['tabular-nums'] as const;

export const raven: Direction = {
  name: 'raven',
  label: 'Raven',
  families: F,
  fontFiles: [
    {
      family: F.display,
      files: [
        { path: require('@expo-google-fonts/im-fell-english/400Regular/IMFellEnglish_400Regular.ttf'), weight: 400, style: 'normal' },
        { path: require('@expo-google-fonts/im-fell-english/400Regular_Italic/IMFellEnglish_400Regular_Italic.ttf'), weight: 400, style: 'italic' },
      ],
    },
    {
      family: F.text,
      files: [
        { path: require('@expo-google-fonts/spectral/400Regular/Spectral_400Regular.ttf'), weight: 400, style: 'normal' },
        { path: require('@expo-google-fonts/spectral/500Medium/Spectral_500Medium.ttf'), weight: 500, style: 'normal' },
        { path: require('@expo-google-fonts/spectral/600SemiBold/Spectral_600SemiBold.ttf'), weight: 600, style: 'normal' },
      ],
    },
    {
      family: F.label,
      files: [
        { path: require('@expo-google-fonts/cinzel/600SemiBold/Cinzel_600SemiBold.ttf'), weight: 600, style: 'normal' },
        { path: require('@expo-google-fonts/cinzel/700Bold/Cinzel_700Bold.ttf'), weight: 700, style: 'normal' },
      ],
    },
  ],
  type: {
    heroTitle: { fontFamily: F.display, fontWeight: '400', fontStyle: 'italic', fontSize: 46, lineHeight: 52, textAlign: 'center' },
    heroKicker: { fontFamily: F.label, fontWeight: '600', fontSize: 13, lineHeight: 16, letterSpacing: 4, textTransform: 'uppercase', textAlign: 'center' },
    title: { fontFamily: F.display, fontWeight: '400', fontStyle: 'italic', fontSize: 34, lineHeight: 40 },
    heading: { fontFamily: F.display, fontWeight: '400', fontSize: 24, lineHeight: 30 },
    section: { fontFamily: F.label, fontWeight: '600', fontSize: 14, lineHeight: 18, letterSpacing: 2.6, textTransform: 'uppercase' },
    body: { fontFamily: F.text, fontWeight: '400', fontSize: 16, lineHeight: 24 },
    strong: { fontFamily: F.text, fontWeight: '600', fontSize: 16, lineHeight: 24 },
    small: { fontFamily: F.text, fontWeight: '400', fontSize: 13, lineHeight: 19 },
    label: { fontFamily: F.label, fontWeight: '600', fontSize: 11.5, lineHeight: 16, letterSpacing: 0.8, textTransform: 'uppercase' },
    number: { fontFamily: F.text, fontWeight: '500', fontSize: 16, lineHeight: 22, fontVariant: [...tab] },
    button: { fontFamily: F.label, fontWeight: '700', fontSize: 15, lineHeight: 20, letterSpacing: 2, textTransform: 'uppercase' },
    badge: { fontFamily: F.label, fontWeight: '600', fontSize: 11, lineHeight: 16, letterSpacing: 1.2, textTransform: 'uppercase' },
    banner: { fontFamily: F.text, fontWeight: '500', fontSize: 15, lineHeight: 22 },
    chip: { fontFamily: F.text, fontWeight: '600', fontSize: 14, lineHeight: 20, textAlign: 'center' },
    statValue: { fontFamily: F.display, fontWeight: '400', fontSize: 30, lineHeight: 34, fontVariant: [...tab] },
    statUnit: { fontFamily: F.text, fontWeight: '400', fontSize: 13 },
    stepValue: { fontFamily: F.text, fontWeight: '600', fontSize: 24, fontVariant: [...tab] },
    fieldInput: { fontFamily: F.text, fontWeight: '500', fontSize: 18, fontVariant: [...tab] },
    tabLabel: { fontFamily: F.text, fontWeight: '600', fontSize: 11, lineHeight: 15 },
    headerTitle: { fontFamily: F.display, fontWeight: '400', fontStyle: 'italic', fontSize: 24 },
    step: { fontFamily: F.display, fontWeight: '400', fontStyle: 'italic', fontSize: 24, lineHeight: 26 },
  },
  shape: {
    sm: 8, md: 14, button: 999, chip: 999, buttonBorder: 1,
    card: { borderRadius: 14, borderWidth: 1 },
    sectionLine: { height: 1 },
  },
  ornament: 'croissant',
  hero: 'raven',
  images: {
    adam: { source: require('../../../assets/raven/aujourdhui.webp'), ratio: 1440 / 880 },
    hercule: { source: require('../../../assets/raven/entrainement.webp'), ratio: 1440 / 880 },
    forge: { source: require('../../../assets/raven/forger.webp'), ratio: 1440 / 880 },
    bacchus: { source: require('../../../assets/raven/cuisine.webp'), ratio: 1440 / 880 },
    ange: { source: require('../../../assets/raven/profil.webp'), ratio: 1440 / 880 },
    phaeton: { source: require('../../../assets/raven/attente.webp'), ratio: 1 },
  },
  credit: 'Images : Gustave Doré, illustrations du « Corbeau » d’Edgar Poe (1884), Wikimedia Commons, domaine public.',
};
