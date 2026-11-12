import Ionicons from '@expo/vector-icons/Ionicons';
import {
  formatDayLong, planningWeekStart, portionView, recipeMacros, type MealSlot, type PartnerVerdict, type PortionViewLine,
} from '@olympe/core';
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Badge, Banner, Body, Card, Chip, Divider, Row, Screen, SectionTitle, Title, text } from '../../components/ui';
import { INDEX, SLOT_LABEL, VERDICT_LABEL, recipeById } from '../../data/catalog';
import { useData } from '../../data/store';
import { fonts, useTheme } from '../../theme';

export default function RecipeScreen() {
  const { id, date, slot } = useLocalSearchParams<{ id: string; date?: string; slot?: MealSlot }>();
  const { repos, version, refresh } = useData();
  const t = useTheme();
  const recipe = recipeById(id);

  const { meal, session, rating } = useMemo(() => {
    const stored = date ? repos.plans.get(planningWeekStart(date)) : null;
    const m = stored?.plan.meals.find((x) => x.date === date && x.slot === slot && x.recipeId === id);
    const s = m?.kind === 'batch' ? stored?.plan.batchSessions.find((b) => b.recipeId === id && b.covers.includes(m.date)) : undefined;
    return { meal: m, session: s, rating: repos.ratings.get(id) };
  }, [repos, id, date, slot, version]);

  if (!recipe) {
    return <Screen><Body>Recette introuvable.</Body></Screen>;
  }

  const withPartner = meal?.eaters.includes('partner') ?? false;
  const lines = portionView(recipe, INDEX, { userRoleFactors: meal?.userRoleFactors, withPartner });
  const batchLines = session ? portionView(recipe, INDEX, { userRoleFactors: meal?.userRoleFactors, servings: session.servings }) : null;
  const macros = meal?.userMacros ?? recipeMacros(recipe, INDEX);
  const traps = [...new Set(lines.flatMap((l) => (l.trap ? [l.trap] : [])))];

  const setVerdict = (v: PartnerVerdict) => {
    repos.ratings.setPartnerVerdict(recipe.id, v, new Date().toISOString());
    refresh();
  };
  const toggleLiked = () => {
    repos.ratings.setUserLiked(recipe.id, !(rating.userLiked ?? true), new Date().toISOString());
    refresh();
  };

  return (
    <Screen>
      <Title>{recipe.name}</Title>
      <Row>
        <Badge label={`${recipe.minutes} min`} />
        {recipe.tags.includes('diete') && <Badge label="Diète" tone="accent" />}
        {recipe.tags.includes('plaisir') && <Badge label="Plaisir" tone="warn" />}
        {recipe.needsDayOldRice && <Badge label="Riz de la veille" tone="warn" />}
      </Row>
      {meal && date && (
        <Body muted>
          {formatDayLong(date)} · {SLOT_LABEL[meal.slot]} · {withPartner ? 'à deux' : 'pour toi'}
        </Body>
      )}

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Body bold>Ta portion</Body>
          <Body muted>{Math.round(macros.kcal)} kcal · {Math.round(macros.protein)} g P · {Math.round(macros.fat)} g L · {Math.round(macros.carbs)} g G</Body>
        </Row>
        <QuantityTable lines={lines} withPartner={withPartner} />
        {meal?.userRoleFactors && Object.values(meal.userRoleFactors).some((f) => f !== 1) && (
          <Body muted>Quantités réajustées à ta cible de {SLOT_LABEL[meal.slot].toLowerCase()}. La portion de ta compagne reste celle de la recette (⅔, ½ pour la viande).</Body>
        )}
      </Card>

      {batchLines && session && (
        <Card>
          <Row>
            <Ionicons name="cube-outline" size={18} color={t.accent} />
            <Body bold>Pour le batch : {session.servings} portions</Body>
          </Row>
          <QuantityTable lines={batchLines} withPartner={false} />
          <Body muted>Riz pesé cru. Une fois cuit, pèse le total et divise par {session.servings}. Sauce à part si possible.</Body>
        </Card>
      )}

      {traps.map((trap) => <Banner key={trap}>{trap}</Banner>)}

      {recipe.steps.length > 0 && (
        <>
          <SectionTitle>Étapes</SectionTitle>
          <Card>
            {recipe.steps.map((s, i) => (
              <Row key={i} style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                <Text style={[styles.step, { color: t.accent }]}>{i + 1}</Text>
                <Body style={{ flex: 1 }}>{s}</Body>
              </Row>
            ))}
          </Card>
        </>
      )}

      {recipe.lessons.length > 0 && (
        <>
          <SectionTitle>Retours d'expérience</SectionTitle>
          <Card>{recipe.lessons.map((s, i) => <Body key={i}>• {s}</Body>)}</Card>
        </>
      )}

      <SectionTitle>Avis</SectionTitle>
      <Card>
        <Body bold>Ta compagne</Body>
        <Row>
          {(['oui', 'non', 'a_tester'] as const).map((v) => (
            <Chip key={v} tone="partner" label={VERDICT_LABEL[v]} selected={rating.partnerVerdict === v} onPress={() => setVerdict(v)} />
          ))}
        </Row>
        <Divider />
        <Row style={{ justifyContent: 'space-between' }}>
          <Body bold>Toi</Body>
          <Chip label={(rating.userLiked ?? true) ? "J'aime" : "Je n'aime pas"} selected={rating.userLiked ?? true} onPress={toggleLiked} />
        </Row>
      </Card>
    </Screen>
  );
}

function QuantityTable({ lines, withPartner }: { lines: PortionViewLine[]; withPartner: boolean }) {
  const t = useTheme();
  return (
    <View>
      {withPartner && (
        <View style={styles.qRow}>
          <Text style={styles.qName} />
          <Text style={[text.label, styles.qHead, { color: t.accent }]}>Toi</Text>
          <Text style={[text.label, styles.qHead, { color: t.partner }]}>Elle</Text>
        </View>
      )}
      {lines.map((l) => (
        <View key={l.ingredientId} style={[styles.qRow, { borderBottomColor: t.border }]}>
          <Text style={[styles.qName, { color: t.text }]}>
            {l.name}
            {l.note ? <Text style={{ color: t.muted }}> · {l.note}</Text> : null}
          </Text>
          <Text style={[styles.qVal, { color: t.text }]}>{l.user.text}</Text>
          {withPartner && <Text style={[styles.qVal, { color: t.partner }]}>{l.partner?.text}</Text>}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  step: { width: 22, fontFamily: fonts.display, fontWeight: '600', fontSize: 20, lineHeight: 24 },
  qRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'transparent', gap: 8 },
  qName: { flex: 1, fontFamily: fonts.text, fontWeight: '400', fontSize: 16, lineHeight: 22 },
  qVal: { width: 92, textAlign: 'right', fontFamily: fonts.text, fontWeight: '500', fontSize: 16, lineHeight: 22, fontVariant: ['tabular-nums'] },
  qHead: { width: 92, textAlign: 'right' },
});
