import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Splash } from '../components/Splash';
import { DataProvider } from '../data/store';
import { fonts, useAppFonts, useTheme } from '../theme';

export default function RootLayout() {
  const t = useTheme();
  const fontsReady = useAppFonts();
  if (!fontsReady) return <Splash />;

  const navigationTheme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: t.bg, card: t.bg, text: t.text, border: t.border, primary: t.accent, notification: t.accent },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <DataProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: t.bg },
            headerTintColor: t.accent,
            headerTitleStyle: { fontFamily: fonts.display, fontWeight: '600', fontSize: 22, color: t.text },
            headerTitleAlign: 'center',
            headerShadowVisible: false,
            contentStyle: { backgroundColor: t.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="recette/[id]" options={{ title: 'Recette' }} />
          <Stack.Screen name="courses" options={{ title: 'Liste de courses' }} />
          <Stack.Screen name="plaisir" options={{ title: 'Adapter un plat' }} />
          <Stack.Screen name="suivi" options={{ title: 'Suivi' }} />
        </Stack>
      </DataProvider>
    </ThemeProvider>
  );
}
