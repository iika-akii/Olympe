import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fragment, useCallback } from 'react';
import { Splash } from '../components/Splash';
import { DataProvider, useData } from '../data/store';
import { LookProvider, useAppFonts, useDirection, useLookChoice, useTheme, type LookId } from '../theme';

export default function RootLayout() {
  const fontsReady = useAppFonts();
  if (!fontsReady) return <Splash />;
  return (
    <DataProvider>
      <SavedLook />
    </DataProvider>
  );
}

/** L'apparence choisie dans Profil est mémorisée dans la base. */
function SavedLook() {
  const { repos } = useData();
  const save = useCallback((id: LookId) => repos.settings.setLook(id), [repos]);
  return (
    <LookProvider initial={repos.settings.getLook()} onChange={save}>
      <Navigation />
    </LookProvider>
  );
}

function Navigation() {
  const t = useTheme();
  const d = useDirection();
  const { id } = useLookChoice();
  const base = t.scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: { ...base.colors, background: t.bg, card: t.bg, text: t.text, border: t.border, primary: t.accent, notification: t.accent },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      {/* Changer d'apparence remonte toute l'interface : chaque style relit la nouvelle direction. */}
      <Fragment key={id}>
        <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: t.bg },
            headerTintColor: t.accent,
            headerTitleStyle: { ...d.type.headerTitle, color: t.text } as never,
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
      </Fragment>
    </ThemeProvider>
  );
}
