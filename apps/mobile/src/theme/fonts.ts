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
        { path: require('@expo-google-fonts/cinzel/600SemiBold/Cinzel_600SemiBold.ttf'), weight: 600, style: 'normal' },
        { path: require('@expo-google-fonts/cinzel/700Bold/Cinzel_700Bold.ttf'), weight: 700, style: 'normal' },
      ],
    },
    {
      fontFamily: fonts.text,
      fontDefinitions: [
        { path: require('@expo-google-fonts/jost/400Regular/Jost_400Regular.ttf'), weight: 400, style: 'normal' },
        { path: require('@expo-google-fonts/jost/400Regular_Italic/Jost_400Regular_Italic.ttf'), weight: 400, style: 'italic' },
        { path: require('@expo-google-fonts/jost/500Medium/Jost_500Medium.ttf'), weight: 500, style: 'normal' },
        { path: require('@expo-google-fonts/jost/600SemiBold/Jost_600SemiBold.ttf'), weight: 600, style: 'normal' },
        { path: require('@expo-google-fonts/jost/700Bold/Jost_700Bold.ttf'), weight: 700, style: 'normal' },
      ],
    },
  ]);
  // En cas d'échec de chargement, l'app reste utilisable avec la police du système.
  return loaded || error !== null;
}
