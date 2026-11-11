import { View } from 'react-native';
import { Emblem } from '../../components/ornaments';
import { Body, Card, Screen } from '../../components/ui';

export default function Forger() {
  return (
    <Screen>
      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
        <Emblem size={104} dim />
      </View>
      <Card>
        <Body bold>À venir</Body>
        <Body muted>Cet onglet sera défini avec toi plus tard dans la feuille de route d'Olympe.</Body>
      </Card>
    </Screen>
  );
}
