import { useFonts } from 'expo-font';
import { directions } from './directions';

/**
 * Chargement à l'exécution (compatible Expo Go) des polices des trois directions artistiques,
 * pour pouvoir en changer sans relancer l'app. Toutes les graisses d'une famille sont déclarées
 * dans le même appel : une famille ne se charge qu'une fois (expo-font, SDK 58).
 */
const ALL = Object.values(directions).flatMap((d) => d.fontFiles).map((f) => ({
  fontFamily: f.family,
  fontDefinitions: f.files.map((x) => ({ path: x.path, weight: x.weight, style: x.style })),
}));

export function useAppFonts(): boolean {
  const [loaded, error] = useFonts(ALL as Parameters<typeof useFonts>[0]);
  // En cas d'échec de chargement, l'app reste utilisable avec la police du système.
  return loaded || error !== null;
}
