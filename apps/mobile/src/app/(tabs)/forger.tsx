import { Hero } from '../../components/Hero';
import { Body, Card, Screen } from '../../components/ui';

export default function Forger() {
  return (
    <Screen hero={<Hero engraving="forge" kicker="Olympe" title="Forger" />}>
      <Card>
        <Body bold>À venir</Body>
        <Body muted>Cet onglet sera défini avec toi plus tard dans la feuille de route d'Olympe.</Body>
      </Card>
    </Screen>
  );
}
