import Ionicons from '@expo/vector-icons/Ionicons';
import { addDays, formatDayLong, localISODate, planningWeekStart, weekdayName, type Reminder } from '@olympe/core';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Hero } from '../../components/Hero';
import { FreeMealRow, MealRow } from '../../components/MealRow';
import { Badge, Body, Button, Card, Row, Screen, SectionTitle, text, type IconName } from '../../components/ui';
import { SLOT_LABEL, recipeById } from '../../data/catalog';
import { useData } from '../../data/store';
import { useTheme } from '../../theme';

const REMINDER_ICON: Record<Reminder['kind'], IconName> = {
  batch: 'cube-outline',
  congeler: 'snow-outline',
  decongeler: 'thermometer-outline',
  cuire_riz_veille: 'time-outline',
};

export default function Today() {
  const { repos, version, refresh } = useData();
  const t = useTheme();
  const today = localISODate(new Date());
  const yesterday = addDays(today, -1);

  const { stored, yesterdayDinner } = useMemo(() => {
    const s = repos.plans.get(planningWeekStart(today));
    const ys = planningWeekStart(yesterday) === planningWeekStart(today) ? s : repos.plans.get(planningWeekStart(yesterday));
    const yd = ys?.plan.meals.find((m) => m.date === yesterday && m.slot === 'diner' && m.eaters.includes('partner'));
    return { stored: s, yesterdayDinner: yd };
  }, [repos, today, yesterday, version]);

  const askFeedback = yesterdayDinner && repos.ratings.get(yesterdayDinner.recipeId).partnerVerdict === 'a_tester';
  const setVerdict = (verdict: 'oui' | 'non') => {
    if (!yesterdayDinner) return;
    repos.ratings.setPartnerVerdict(yesterdayDinner.recipeId, verdict, new Date().toISOString());
    refresh();
  };

  // « mercredi 11 novembre » → sur-titre « Mercredi », titre « 11 novembre ».
  const dayAndMonth = formatDayLong(today).split(' ').slice(1).join(' ');
  const plan = stored?.plan;
  const meals = plan?.meals.filter((m) => m.date === today) ?? [];
  const free = plan?.freeMeals.filter((f) => f.date === today) ?? [];
  const reminders = plan?.reminders.filter((r) => r.date === today) ?? [];
  const order = ['petit_dej', 'dejeuner', 'collation', 'diner'] as const;

  return (
    <Screen hero={<Hero statue="hercule" kicker={weekdayName(today)} title={dayAndMonth} />}>
      {askFeedback && yesterdayDinner && (
        <Card tone="partner">
          <Row style={{ flexWrap: 'nowrap' }}>
            <Ionicons name="heart-outline" size={18} color={t.partner} />
            <Body bold style={{ flex: 1 }}>Hier soir : {recipeById(yesterdayDinner.recipeId)?.name}</Body>
          </Row>
          <Body muted>Elle a aimé ? Sa réponse décide si le plat revient dans les prochains plannings.</Body>
          <Row>
            <View style={{ flex: 1 }}><Button label="Oui" icon="thumbs-up-outline" onPress={() => setVerdict('oui')} /></View>
            <View style={{ flex: 1 }}><Button label="Non" icon="thumbs-down-outline" variant="secondary" onPress={() => setVerdict('non')} /></View>
          </Row>
        </Card>
      )}

      {!plan && (
        <Card>
          <Body bold>Pas encore de planning cette semaine</Body>
          <Body muted>Indique les soirs où ta compagne mange avec toi, puis génère la semaine.</Body>
          <Button label="Préparer ma semaine" icon="restaurant-outline" onPress={() => router.navigate('/cuisine')} />
        </Card>
      )}

      {plan && (
        <>
          <SectionTitle>Au menu</SectionTitle>
          <Card>
            {order.map((slot) => {
              const m = meals.find((x) => x.slot === slot);
              if (m) return <MealRow key={slot} meal={m} onPress={() => router.push({ pathname: '/recette/[id]', params: { id: m.recipeId, date: m.date, slot: m.slot } })} />;
              if (free.some((f) => f.slot === slot)) return <FreeMealRow key={slot} label={SLOT_LABEL[slot]} onPress={() => router.push('/plaisir')} />;
              return null;
            })}
            <Row style={{ justifyContent: 'space-between', marginTop: 4 }}>
              <Body muted>Total planifié</Body>
              <Badge label={`${plan.dailyKcal[today] ?? 0} kcal${free.length ? ' + repas libre' : ''}`} tone="accent" />
            </Row>
          </Card>

          {reminders.length > 0 && (
            <>
              <SectionTitle>À faire aujourd'hui</SectionTitle>
              <Card>
                {reminders.map((r, i) => (
                  <Row key={i} style={{ alignItems: 'flex-start', flexWrap: 'nowrap', gap: 10 }}>
                    <Ionicons name={REMINDER_ICON[r.kind]} size={18} color={t.accent} style={{ marginTop: 2 }} />
                    <Text style={[text.body, { flex: 1, color: t.text }]}>{r.text}</Text>
                  </Row>
                ))}
              </Card>
            </>
          )}

          <Button label="Liste de courses" icon="cart-outline" variant="secondary" onPress={() => router.push({ pathname: '/courses', params: { start: plan.startDate } })} />
        </>
      )}
    </Screen>
  );
}
