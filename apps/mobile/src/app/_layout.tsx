import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DataProvider } from '../data/store';
import { useTheme } from '../theme';

export default function RootLayout() {
  const t = useTheme();
  return (
    <DataProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.card },
          headerTintColor: t.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="recette/[id]" options={{ title: 'Recette' }} />
        <Stack.Screen name="courses" options={{ title: 'Liste de courses' }} />
        <Stack.Screen name="plaisir" options={{ title: 'Adapter un plat' }} />
      </Stack>
    </DataProvider>
  );
}
