import { useFonts } from 'expo-font';
import { fonts } from './tokens';

/**
 * Chargement à l'exécution (compatible Expo Go). Toutes les graisses d'une famille sont déclarées
 * dans le même appel : une famille ne se charge qu'une fois (expo-font, SDK 58).
 */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts([
    {
      fontFamily: fonts.display,
      fontDefinitions: [
        { path: require('@expo-google-fonts/grenze-gotisch/600SemiBold/GrenzeGotisch_600SemiBold.ttf'), weight: 600, style: 'normal' },
      ],
    },
    {
      fontFamily: fonts.text,
      fontDefinitions: [
        { path: require('@expo-google-fonts/barlow/400Regular/Barlow_400Regular.ttf'), weight: 400, style: 'normal' },
        { path: require('@expo-google-fonts/barlow/500Medium/Barlow_500Medium.ttf'), weight: 500, style: 'normal' },
        { path: require('@expo-google-fonts/barlow/600SemiBold/Barlow_600SemiBold.ttf'), weight: 600, style: 'normal' },
      ],
    },
    {
      fontFamily: fonts.label,
      fontDefinitions: [
        { path: require('@expo-google-fonts/barlow-condensed/600SemiBold/BarlowCondensed_600SemiBold.ttf'), weight: 600, style: 'normal' },
      ],
    },
  ]);
  // En cas d'échec de chargement, l'app reste utilisable avec la police du système.
  return loaded || error !== null;
}
