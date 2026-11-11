import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../theme';
import { Emblem } from './ornaments';

/** Écran d'attente (polices, base de données). N'utilise aucune police personnalisée : elles ne sont pas encore là. */
export function Splash() {
  const t = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, backgroundColor: t.bg }}>
      <Emblem size={112} />
      <ActivityIndicator color={t.accent} />
    </View>
  );
}
