import Ionicons from '@expo/vector-icons/Ionicons';
import {
  addDays, formatDayShort, formatWeekRange, localISODate, planningWeekStart, shareableMeals, weekDates, weekdayName, type PartnerMeal,
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

  const { stored, partnerMeals, stale } = useMemo(() => {
    const s = repos.plans.get(weekStart);
    return {
      stored: s,
      partnerMeals: new Set(repos.partner.listBetween(weekStart, addDays(weekStart, 6)).map((m) => `${m.date}|${m.slot}`)),
      stale: s ? isPlanStale(repos, s) : false,
    };
  }, [repos, weekStart, version]);

  // Seuls les repas cuisinés frais se partagent : les midis de semaine sont des gamelles, le dimanche midi est libre.
  const late = stored ? stored.options.lateShopping : lateShopping;
  const shareable = new Set(shareableMeals(weekStart, late).map((m) => `${m.date}|${m.slot}`));
  const sharedCount = [...partnerMeals].filter((k) => shareable.has(k)).length;
  const togglePartner = (date: string, slot: PartnerMeal['slot']) => {
    repos.partner.setPresent(date, slot, !partnerMeals.has(`${date}|${slot}`));
    refresh();
  };
  const mealChip = (date: string, slot: PartnerMeal['slot'], label: string, index: number) => {
    const key = `${date}|${slot}`;
    if (shareable.has(key)) return <Chip grow tone="partner" label={label} selected={partnerMeals.has(key)} onPress={() => togglePartner(date, slot)} />;
    // Repas non partageable : on dit pourquoi au lieu de le cacher.
    const reason = slot === 'dejeuner' ? (index === 0 ? 'Midi libre' : 'Gamelle') : 'Soir libre';
    return <Chip grow disabled tone="partner" label={reason} selected={false} onPress={() => undefined} />;
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
    <Screen hero={<Hero engraving="bacchus" kicker="Cuisine" title="Ma semaine" />}>
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

      <SectionTitle>Repas avec ma compagne</SectionTitle>
      <Card>
        <Body bold>
          {sharedCount === 0 ? 'Aucun repas à deux cette semaine' : sharedCount === 1 ? '1 repas à deux cette semaine' : `${sharedCount} repas à deux cette semaine`}
        </Body>
        <Body muted>Coche chaque repas qu'elle prend avec toi.</Body>
        <View style={{ gap: 6 }}>
          {dates.map((d, i) => (
            <View key={d} style={styles.partnerRow} accessibilityLabel={formatDayShort(d)}>
              <Text style={[text.label, styles.partnerDay, { color: t.text }]}>{formatDayShort(d).split(' ').slice(0, 2).join(' ')}</Text>
              {mealChip(d, 'dejeuner', 'Midi', i)}
              {mealChip(d, 'diner', 'Soir', i)}
            </View>
          ))}
        </View>
        <Body muted>Tes midis du lundi au vendredi sont des gamelles de batch, pour toi seul.</Body>
      </Card>

      {!plan && (
        <Card>
          <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
            <View style={{ flex: 1 }}>
              <Body bold>Courses ratées dimanche matin</Body>
              <Body muted>Courses lundi soir : lundi midi en dépannage, batch décalé.</Body>
            </View>
            <Switch value={lateShopping} onValueChange={setLateShopping} trackColor={{ false: t.borderStrong, true: t.accent }} thumbColor={t.card} />
          </Row>
          {busy ? <ActivityIndicator color={t.accent} /> : <Button label="Générer la semaine" icon="sparkles-outline" onPress={generate} />}
        </Card>
      )}

      {plan && (
        <>
          {stale && (
            <Banner tone="partner" icon="people-outline">
              Les repas de ta compagne ou le modèle de journée ont changé depuis la génération. Regénère pour en tenir compte.
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
  partnerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  partnerDay: { width: 62 },
});
