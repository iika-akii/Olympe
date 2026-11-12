import { Hero } from '../../components/Hero';
import { Banner, Body, Card, Screen } from '../../components/ui';

export default function Entrainement() {
  return (
    <Screen hero={<Hero engraving="hercule" kicker="Olympe" title="Entraînement" />}>
      <Card>
        <Body bold>Bientôt ici</Body>
        <Body muted>
          Séance du jour (upper / lower, lundi, mercredi, jeudi, vendredi), saisie charge × répétitions, minuteur de repos de 2 min
          et suggestion de progression.
        </Body>
      </Card>
      <Banner tone="accent" icon="information-circle-outline">
        Il manque ton programme détaillé (exercices, séries, répétitions, charges). En attendant, garde ton app de salle actuelle.
      </Banner>
    </Screen>
  );
}
