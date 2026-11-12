import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../theme';
import { Engraving } from './Hero';

/** Écran d'attente (polices, base de données). Aucune police personnalisée ici : elles ne sont pas encore chargées. */
export function Splash() {
  const t = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28, backgroundColor: t.bg }}>
      <Engraving name="phaeton" width={240} height={240} />
      <ActivityIndicator color={t.accent} />
    </View>
  );
}
