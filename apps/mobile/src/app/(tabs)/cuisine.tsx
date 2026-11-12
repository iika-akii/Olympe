import Ionicons from '@expo/vector-icons/Ionicons';
import {
  addDays, formatDayShort, formatWeekRange, localISODate, planningWeekStart, weekDates, weekdayName,
} from '@olympe/core';
import { generateWeek, isPlanStale } from '@olympe/db';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Hero } from '../../components/Hero';
import { FreeMealRow, MealRow } from '../../components/MealRow';
import { Badge, Banner, Body, Button, Card, Chip, Row, Screen, SectionTitle, text } from '../../components/ui';
import { recipeById } from '../../data/catalog';
import { useData } from '../../data/store';
import { TOUCH, radius, useTheme } from '../../theme';

export default function Cuisine() {
  const { db, repos, version, refresh } = useData();
  const t = useTheme();
  const [weekStart, setWeekStart] = useState(() => planningWeekStart(localISODate(new Date())));
  const [lateShopping, setLateShopping] = useState(false);
  const [busy, setBusy] = useState(false);
  const dates = weekDates(weekStart);

  const { stored, partnerDates, stale } = useMemo(() => {
    const s = repos.plans.get(weekStart);
    return {
      stored: s,
      partnerDates: new Set(repos.partner.listBetween(weekStart, addDays(weekStart, 6))),
      stale: s ? isPlanStale(repos, s) : false,
    };
  }, [repos, weekStart, version]);

  const togglePartner = (date: string) => {
    repos.partner.setPresent(date, !partnerDates.has(date));
    refresh();
  };

  const generate = () => {
    setBusy(true);
    // Laisse l'indicateur s'afficher avant le calcul (synchrone, ~1 s sur téléphone).
    setTimeout(() => {
      try {
        generateWeek(db, repos, { startDate: weekStart, lateShopping, now: new Date().toISOString() });
        refresh();
      } catch (e) {
        Alert.alert('Planning impossible', e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(false);
      }
    }, 50);
  };

  const confirmRegenerate = () => {
    const message = 'Le planning et les cases cochées de la liste de courses seront remplacés.';
    if (Platform.OS === 'web') return generate();
    Alert.alert('Regénérer la semaine ?', message, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Regénérer', style: 'destructive', onPress: generate },
    ]);
  };

  const plan = stored?.plan;

  return (
    <Screen hero={<Hero statue="dionysos" kicker="Cuisine" title="Ma semaine" />}>
      <View style={styles.weekNav}>
        <Pressable accessibilityRole="button" accessibilityLabel="Semaine précédente" onPress={() => setWeekStart(addDays(weekStart, -7))} style={[styles.navButton, { borderColor: t.borderStrong }]}>
          <Ionicons name="chevron-back" size={22} color={t.accent} />
        </Pressable>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={[text.label, { color: t.accent }]}>Semaine</Text>
          <Text style={[text.heading, { color: t.text }]}>{formatWeekRange(weekStart)}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Semaine suivante" onPress={() => setWeekStart(addDays(weekStart, 7))} style={[styles.navButton, { borderColor: t.borderStrong }]}>
          <Ionicons name="chevron-forward" size={22} color={t.accent} />
        </Pressable>
      </View>

      <SectionTitle>Ma compagne mange avec moi</SectionTitle>
      <Card>
        <Row>
          {dates.map((d) => (
            <Chip key={d} tone="partner" label={formatDayShort(d).split(' ').slice(0, 2).join(' ')} selected={partnerDates.has(d)} onPress={() => togglePartner(d)} />
          ))}
        </Row>
        <Body muted>Dîners, et samedi midi. Les midis de semaine (batch) sont pour toi seul.</Body>
      </Card>

      {!plan && (
        <Card>
          <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
            <View style={{ flex: 1 }}>
              <Body bold>Courses ratées dimanche matin</Body>
              <Body muted>Courses lundi soir : lundi midi en dépannage, batch décalé.</Body>
            </View>
            <Switch value={lateShopping} onValueChange={setLateShopping} trackColor={{ false: t.borderStrong, true: t.accentDeep }} thumbColor={lateShopping ? t.accentBright : t.muted} />
          </Row>
          {busy ? <ActivityIndicator color={t.accent} /> : <Button label="Générer la semaine" icon="sparkles-outline" onPress={generate} />}
        </Card>
      )}

      {plan && (
        <>
          {stale && (
            <Banner tone="partner" icon="people-outline">
              Les jours de ta compagne ou le modèle de journée ont changé depuis la génération. Regénère pour en tenir compte.
            </Banner>
          )}
          {plan.warnings.map((w, i) => <Banner key={i}>{w}</Banner>)}

          <Row>
            <View style={{ flex: 1 }}><Button label="Courses" icon="cart-outline" onPress={() => router.push({ pathname: '/courses', params: { start: weekStart } })} /></View>
            <View style={{ flex: 1 }}><Button label="Plat plaisir" icon="sparkles-outline" variant="secondary" onPress={() => router.push('/plaisir')} /></View>
          </Row>

          <SectionTitle>Batchs (pour toi)</SectionTitle>
          <Card>
            {plan.batchSessions.map((s) => (
              <Pressable key={s.date} accessibilityRole="button" style={({ pressed }) => [styles.batch, pressed && { opacity: 0.6 }]} onPress={() => router.push({ pathname: '/recette/[id]', params: { id: s.recipeId, date: s.covers[0]!, slot: 'dejeuner' } })}>
                <Row style={{ flexWrap: 'nowrap', gap: 10 }}>
                  <Ionicons name="cube-outline" size={18} color={t.accent} />
                  <View style={{ flex: 1 }}>
                    <Body bold>{weekdayName(s.date)} : {recipeById(s.recipeId)?.name}</Body>
                    <Body muted>{s.servings} portions, midis {s.covers.map((d) => weekdayName(d).toLowerCase()).join(', ')}</Body>
                  </View>
                </Row>
              </Pressable>
            ))}
          </Card>

          <SectionTitle>Repas</SectionTitle>
          <Body muted>Chaque jour aussi : banane + shaker de whey, et ta collation skyr.</Body>
          {dates.map((d) => {
            const lunch = plan.meals.find((m) => m.date === d && m.slot === 'dejeuner');
            const dinner = plan.meals.find((m) => m.date === d && m.slot === 'diner');
            const freeLunch = plan.freeMeals.some((f) => f.date === d && f.slot === 'dejeuner');
            const freeDinner = plan.freeMeals.some((f) => f.date === d && f.slot === 'diner');
            const isToday = d === localISODate(new Date());
            return (
              <Card key={d} tone={isToday ? 'accent' : undefined}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text style={[text.label, { fontSize: 15, lineHeight: 20, color: isToday ? t.accent : t.text }]}>{formatDayShort(d)}</Text>
                  <Badge label={`${plan.dailyKcal[d] ?? 0} kcal`} tone={isToday ? 'accent' : 'muted'} />
                </Row>
                {lunch && <MealRow meal={lunch} onPress={() => router.push({ pathname: '/recette/[id]', params: { id: lunch.recipeId, date: d, slot: 'dejeuner' } })} />}
                {freeLunch && <FreeMealRow label="Midi" onPress={() => router.push('/plaisir')} />}
                {dinner && <MealRow meal={dinner} onPress={() => router.push({ pathname: '/recette/[id]', params: { id: dinner.recipeId, date: d, slot: 'diner' } })} />}
                {freeDinner && <FreeMealRow label="Soir" onPress={() => router.push('/plaisir')} />}
              </Card>
            );
          })}

          {busy ? <ActivityIndicator color={t.accent} /> : <Button label="Regénérer la semaine" icon="refresh" variant="danger" onPress={confirmRegenerate} />}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  weekNav: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navButton: { width: TOUCH, height: TOUCH, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: radius.md },
  batch: { minHeight: TOUCH, justifyContent: 'center' },
});
