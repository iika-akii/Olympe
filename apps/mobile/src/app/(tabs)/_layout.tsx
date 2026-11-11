import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, type ColorValue } from 'react-native';
import { Emblem } from '../../components/ornaments';
import type { IconName } from '../../components/ui';
import { fonts, useTheme } from '../../theme';

/** Icône d'onglet : pleine et surmontée d'un trait d'or quand l'onglet est actif. */
const icon = (outline: IconName, filled: IconName) => ({ color, focused }: { color: ColorValue; size: number; focused: boolean }) => (
  <View style={styles.icon}>
    <View style={[styles.marker, focused && { backgroundColor: color }]} />
    <Ionicons name={focused ? filled : outline} size={22} color={typeof color === 'string' ? color : undefined} />
  </View>
);

function Wordmark() {
  const t = useTheme();
  return (
    <View style={styles.wordmark} accessibilityRole="header" accessibilityLabel="Olympe">
      <Emblem size={26} />
      <Text style={[styles.wordmarkText, { color: t.text }]}>OLYMPE</Text>
    </View>
  );
}

export default function TabLayout() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.faint,
        // Hauteur explicite (la barre ajoute elle-même la marge basse du système) : par défaut, l'étiquette est rognée.
        tabBarStyle: { backgroundColor: t.bg, borderTopColor: t.border, borderTopWidth: 1, height: 64 + insets.bottom },
        tabBarLabelStyle: { fontFamily: fonts.text, fontWeight: '600', fontSize: 11, lineHeight: 15, letterSpacing: 0.2 },
        headerStyle: { backgroundColor: t.bg, borderBottomColor: t.border, borderBottomWidth: 1 },
        headerTintColor: t.text,
        headerTitleAlign: 'center',
        headerTitleStyle: { fontFamily: fonts.display, fontWeight: '600', fontSize: 16, letterSpacing: 2.4, color: t.text },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: t.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Olympe', headerTitle: () => <Wordmark />, tabBarIcon: icon('flame-outline', 'flame') }} />
      <Tabs.Screen name="entrainement" options={{ title: 'Entraînement', tabBarIcon: icon('barbell-outline', 'barbell') }} />
      <Tabs.Screen name="forger" options={{ title: 'Forger', tabBarIcon: icon('hammer-outline', 'hammer') }} />
      <Tabs.Screen name="cuisine" options={{ title: 'Cuisine', headerTitle: 'Ma semaine', tabBarIcon: icon('restaurant-outline', 'restaurant') }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil', tabBarIcon: icon('person-outline', 'person') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: { alignItems: 'center', justifyContent: 'center', width: 44 },
  marker: { position: 'absolute', top: -9, width: 22, height: 2, backgroundColor: 'transparent' },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wordmarkText: { fontFamily: fonts.display, fontWeight: '700', fontSize: 18, letterSpacing: 5 },
});
