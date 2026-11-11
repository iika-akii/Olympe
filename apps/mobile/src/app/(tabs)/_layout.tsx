import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import type { IconName } from '../../components/ui';
import { useTheme } from '../../theme';

const icon = (name: IconName) => ({ color, size }: { color: ColorValue; size: number }) => <Ionicons name={name} size={size} color={typeof color === 'number' || color == null ? undefined : color} />;

export default function TabLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.card, borderTopColor: t.border },
        headerStyle: { backgroundColor: t.card },
        headerTintColor: t.text,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Olympe', headerTitle: "Aujourd'hui", tabBarIcon: icon('sunny-outline') }} />
      <Tabs.Screen name="entrainement" options={{ title: 'Entraînement', tabBarIcon: icon('barbell-outline') }} />
      <Tabs.Screen name="forger" options={{ title: 'Forger', tabBarIcon: icon('hammer-outline') }} />
      <Tabs.Screen name="cuisine" options={{ title: 'Cuisine', headerTitle: 'Ma semaine', tabBarIcon: icon('restaurant-outline') }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil', tabBarIcon: icon('person-outline') }} />
    </Tabs>
  );
}
