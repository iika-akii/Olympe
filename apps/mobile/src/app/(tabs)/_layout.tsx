import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { StyleSheet, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { IconName } from '../../components/ui';
import { fonts, useTheme } from '../../theme';

/** Icône d'onglet : pleine et surmontée d'un trait de braise quand l'onglet est actif. */
const icon = (outline: IconName, filled: IconName) => ({ color, focused }: { color: ColorValue; size: number; focused: boolean }) => (
  <View style={styles.icon}>
    <View style={[styles.marker, focused && { backgroundColor: color }]} />
    <Ionicons name={focused ? filled : outline} size={22} color={typeof color === 'string' ? color : undefined} />
  </View>
);

export default function TabLayout() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        // Pas de barre de titre : la statue de chaque onglet monte jusqu'en haut de l'écran.
        headerShown: false,
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.faint,
        // Hauteur explicite (la barre ajoute elle-même la marge basse du système) : par défaut, l'étiquette est rognée.
        tabBarStyle: { backgroundColor: t.bg, borderTopColor: t.border, borderTopWidth: 1, height: 64 + insets.bottom },
        tabBarLabelStyle: { fontFamily: fonts.text, fontWeight: '600', fontSize: 11, lineHeight: 15 },
        sceneStyle: { backgroundColor: t.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Olympe', tabBarIcon: icon('flame-outline', 'flame') }} />
      <Tabs.Screen name="entrainement" options={{ title: 'Entraînement', tabBarIcon: icon('barbell-outline', 'barbell') }} />
      <Tabs.Screen name="forger" options={{ title: 'Forger', tabBarIcon: icon('hammer-outline', 'hammer') }} />
      <Tabs.Screen name="cuisine" options={{ title: 'Cuisine', tabBarIcon: icon('restaurant-outline', 'restaurant') }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil', tabBarIcon: icon('person-outline', 'person') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: { alignItems: 'center', justifyContent: 'center', width: 44 },
  marker: { position: 'absolute', top: -5, width: 22, height: 2, backgroundColor: 'transparent' },
});
