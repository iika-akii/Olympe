import { ActivityIndicator, Image, View } from 'react-native';
import { useTheme } from '../theme';
import { STATUES } from './Hero';

/** Écran d'attente (polices, base de données). Aucune police personnalisée ici : elles ne sont pas encore chargées. */
export function Splash() {
  const t = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28, backgroundColor: t.bg }}>
      <Image source={STATUES.zeus.source} resizeMode="contain" accessible={false} style={{ width: 200 * STATUES.zeus.ratio, height: 200 }} />
      <ActivityIndicator color={t.accent} />
    </View>
  );
}
