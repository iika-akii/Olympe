import {
  DAY_TEMPLATES, NUTRITION_TARGETS, START_WEIGHT_KG, addDays, compareDeficits, decideAdjustment, formatDayLong, formatNumber,
  healthAverages, localISODate, summarizeProgress, weightTrend, type AdjustmentDecision,
} from '@olympe/core';
import { useMemo } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { WeighInCard } from '../components/WeighInCard';
import { WeightChart } from '../components/WeightChart';
import { Banner, Body, Card, NumberField, Row, Screen, SectionTitle, Stat, Stepper, text } from '../components/ui';
import { useData } from '../data/store';
import { useTheme } from '../theme';

const VERDICT: Record<AdjustmentDecision['action'], string> = {
  insufficient_data: 'Trop tôt pour décider',
  hold: 'Ne change rien',
  lower: 'Baisse un peu les féculents',
  raise: 'Remonte un peu les féculents',
};

const signed = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${formatNumber(Math.abs(v))}`;

export default function Suivi() {
  const { repos, version, refresh } = useData();
  const t = useTheme();
  const { width } = useWindowDimensions();
  const today = localISODate(new Date());

  const data = useMemo(() => {
    const weighIns = repos.weighIns.all();
    const goalKg = repos.settings.getGoalKg();
    const template = DAY_TEMPLATES.find((x) => x.id === repos.settings.getDayTemplateId()) ?? DAY_TEMPLATES[0]!;
    const plannedKcal = template.slots.reduce((s, x) => s + x.kcal, 0);
    const summary = summarizeProgress({ weighIns, goalKg, today, startKg: weighIns[0]?.kg ?? START_WEIGHT_KG });
    const averages = healthAverages(repos.health.listBetween(addDays(today, -6), today), today);
    return {
      goalKg,
      plannedKcal,
      summary,
      averages,
      points: weightTrend(weighIns),
      decision: decideAdjustment({ weighIns, currentKcalTarget: plannedKcal, targets: NUTRITION_TARGETS }),
      deficits: compareDeficits(summary.dailyDeficitKcal, averages.expenditureKcal, plannedKcal),
      todayHealth: repos.health.get(today),
    };
  }, [repos, today, version]);

  const { summary, decision, deficits, averages, todayHealth } = data;
  const setHealth = (patch: { steps?: number | undefined; expenditureKcal?: number | undefined }) => {
    const next = { ...todayHealth, ...patch };
    repos.health.set({
      date: today,
      source: 'manual',
      ...(next.steps === undefined ? {} : { steps: next.steps }),
      ...(next.expenditureKcal === undefined ? {} : { expenditureKcal: next.expenditureKcal }),
    });
    refresh();
  };

  return (
    <Screen>
      <SectionTitle>Pesée du matin</SectionTitle>
      <WeighInCard />

      <SectionTitle>Évolution</SectionTitle>
      <Card>
        <WeightChart points={data.points} goalKg={data.goalKg} width={width - 32 - 30} />
      </Card>
      <Row style={{ gap: 8 }}>
        <Stat label="Moyenne 7 jours" value={summary.trendKg === null ? '—' : formatNumber(summary.trendKg)} unit="kg" tone="accent" />
        <Stat label="Depuis le départ" value={summary.lostKg === null ? '—' : signed(-summary.lostKg)} unit="kg" />
        <Stat label="Reste" value={summary.remainingKg === null ? '—' : formatNumber(summary.remainingKg)} unit="kg" />
      </Row>

      <SectionTitle>Faut-il changer quelque chose ?</SectionTitle>
      <Card tone="accent">
        <Text style={[text.heading, { color: t.text }]}>{VERDICT[decision.action]}</Text>
        <Body>{decision.reason}</Body>
        {decision.action === 'insufficient_data' && summary.weeklyLossKg !== null && (
          <Body muted>
            Rythme provisoire sur 4 semaines : {signed(-summary.weeklyLossKg)} kg par semaine. Le verdict tombe après 3 semaines de pesées (3 par semaine au moins).
          </Body>
        )}
        {decision.deltaKcal !== 0 && (
          <Body bold>
            {signed(decision.deltaKcal)} kcal par jour, soit {signed(decision.riceRawGramsPerDayDelta)} g de riz cru.
          </Body>
        )}
        {summary.etaDate && <Body muted>À ce rythme, objectif atteint vers le {formatDayLong(summary.etaDate).split(' ').slice(1).join(' ')} {summary.etaDate.slice(0, 4)}.</Body>}
        {summary.goalReached && <Body bold>Objectif atteint.</Body>}
      </Card>
      <Body muted>Rythme visé : 0,4 à 0,5 kg par semaine. Sous 0,3 on baisse, au-dessus de 0,7 on remonte pour protéger le muscle.</Body>

      <SectionTitle>Mon objectif</SectionTitle>
      <Card>
        <Stepper label="Poids visé" value={data.goalKg} onChange={(v) => { repos.settings.setGoalKg(v); refresh(); }} step={0.5} unit="kg" min={40} />
      </Card>

      <SectionTitle>Activité du jour</SectionTitle>
      <Card>
        <Row style={{ flexWrap: 'nowrap', gap: 10, alignItems: 'flex-start' }}>
          <NumberField label="Pas" unit="pas" value={todayHealth?.steps} onChange={(steps) => setHealth({ steps })} />
          <NumberField label="Dépense du bracelet" unit="kcal" value={todayHealth?.expenditureKcal} onChange={(expenditureKcal) => setHealth({ expenditureKcal })} />
        </Row>
        <Body muted>
          Sur 7 jours : {averages.steps === null ? 'aucun pas saisi' : `${averages.steps} pas par jour`}
          {averages.expenditureKcal === null ? '' : ` · ${averages.expenditureKcal} kcal dépensées par jour`}.
        </Body>
      </Card>

      <SectionTitle>Mon déficit</SectionTitle>
      <Card>
        <View style={{ gap: 6 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Body bold>D'après la balance</Body>
            <Text style={[text.number, { color: t.accent, fontWeight: '600' }]}>{deficits.scaleKcal === null ? '—' : `${deficits.scaleKcal} kcal / jour`}</Text>
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <Body muted>D'après le bracelet</Body>
            <Text style={[text.number, { color: t.muted }]}>{deficits.braceletKcal === null ? '—' : `${deficits.braceletKcal} kcal / jour`}</Text>
          </Row>
        </View>
        <Body muted>
          La balance fait foi. Le bracelet estime ta dépense ; on la compare à ton plan ({data.plannedKcal} kcal), sans jamais l'ajouter à ton budget.
        </Body>
        {deficits.gapKcal !== null && Math.abs(deficits.gapKcal) >= 150 && (
          <Banner icon="information-circle-outline">
            {deficits.gapKcal > 0
              ? `Le bracelet annonce ${deficits.gapKcal} kcal de déficit de plus que la balance : il surestime ta dépense, ou tu manges au-delà du plan.`
              : `La balance montre ${-deficits.gapKcal} kcal de déficit de plus que le bracelet : il sous-estime ta dépense, ou tu manges moins que le plan.`}
          </Banner>
        )}
      </Card>
    </Screen>
  );
}
