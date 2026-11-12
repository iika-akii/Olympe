import Ionicons from '@expo/vector-icons/Ionicons';
import { START_WEIGHT_KG, formatNumber, localISODate, summarizeProgress } from '@olympe/core';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useData } from '../data/store';
import { useTheme } from '../theme';
import { Body, Button, Card, Row, Stepper } from './ui';

/** Pesée du matin : la valeur de la veille est déjà là, il reste à l'ajuster et à valider. */
export function WeighInCard({ onOpenTracking }: { onOpenTracking?: () => void }) {
  const { repos, version, refresh } = useData();
  const t = useTheme();
  const today = localISODate(new Date());
  const { saved, last, trendKg } = useMemo(() => {
    const all = repos.weighIns.all();
    const summary = summarizeProgress({ weighIns: all, goalKg: repos.settings.getGoalKg(), today });
    return { saved: all.find((w) => w.date === today) ?? null, last: all.at(-1) ?? null, trendKg: summary.trendKg };
  }, [repos, today, version]);

  const [kg, setKg] = useState(saved?.kg ?? last?.kg ?? START_WEIGHT_KG);
  useEffect(() => { setKg(saved?.kg ?? last?.kg ?? START_WEIGHT_KG); }, [saved?.kg, last?.kg]);

  const save = () => {
    repos.weighIns.set({ date: today, kg });
    refresh();
  };

  // Sur « Aujourd'hui », une pesée déjà faite tient en une ligne qui ouvre le suivi.
  if (saved && onOpenTracking) {
    return (
      <Card onPress={onOpenTracking}>
        <Row style={{ flexWrap: 'nowrap', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Body bold>{formatNumber(saved.kg)} kg ce matin</Body>
            {trendKg !== null && <Body muted>Moyenne sur 7 jours : {formatNumber(trendKg)} kg</Body>}
          </View>
          <Ionicons name="chevron-forward" size={18} color={t.faint} />
        </Row>
      </Card>
    );
  }

  return (
    <Card>
      <Stepper label="Poids du matin" value={kg} onChange={setKg} step={0.1} unit="kg" min={30} />
      <Body muted>
        {saved
          ? `Enregistrée ce matin : ${formatNumber(saved.kg)} kg${trendKg === null ? '' : ` · moyenne sur 7 jours : ${formatNumber(trendKg)} kg`}`
          : 'À jeun, au réveil. On juge sur la moyenne de la semaine, jamais sur une pesée.'}
      </Body>
      <Button label={saved ? 'Corriger la pesée' : 'Enregistrer la pesée'} icon="scale-outline" variant={saved ? 'secondary' : 'primary'} onPress={save} />
    </Card>
  );
}
