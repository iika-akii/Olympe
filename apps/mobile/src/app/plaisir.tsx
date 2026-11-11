import {
  DAY_TEMPLATES, NUTRITION_TARGETS, adaptRecipe, displayQuantity, type AdaptationMode, type AdaptationResult, type MealSlot,
} from '@olympe/core';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Badge, Banner, Body, Card, Chip, Row, Screen, SectionTitle, text } from '../components/ui';
import { INDEX, RECIPES, SLOT_LABEL, SUBSTITUTIONS, recipeById } from '../data/catalog';
import { useData } from '../data/store';
import { fonts, useTheme } from '../theme';

const MODES: { mode: AdaptationMode; title: string; help: string }[] = [
  { mode: 'reajuster', title: 'Réajuster', help: 'Mêmes ingrédients, quantités revues pour ta cible.' },
  { mode: 'alleger', title: 'Alléger', help: 'Substitutions : air fryer, filet, skyr, sucre réduit…' },
  { mode: 'compenser', title: 'Compenser', help: 'Le plat tel quel, les autres repas du jour baissent.' },
];

export default function Plaisir() {
  const { repos, version } = useData();
  const t = useTheme();
  const ordered = useMemo(() => [...RECIPES].sort((a, b) => Number(b.tags.includes('plaisir')) - Number(a.tags.includes('plaisir'))), []);
  const [recipeId, setRecipeId] = useState(ordered[0]!.id);
  const recipe = recipeById(recipeId)!;
  const slots = recipe.slots.filter((s) => s !== 'petit_dej');
  const [slot, setSlot] = useState<MealSlot>(slots.includes('diner') ? 'diner' : slots[0] ?? 'collation');
  const effectiveSlot: MealSlot = recipe.slots.includes(slot) ? slot : slots[0] ?? 'collation';

  const results = useMemo(() => {
    const template = DAY_TEMPLATES.find((x) => x.id === repos.settings.getDayTemplateId()) ?? DAY_TEMPLATES[0]!;
    const target = template.slots.find((s) => s.slot === effectiveSlot) ?? template.slots[0]!;
    return MODES.map((m) => ({
      ...m,
      result: adaptRecipe(m.mode, { recipe, index: INDEX, target, substitutions: SUBSTITUTIONS, dayTemplate: template, kcalFloor: NUTRITION_TARGETS.kcalFloor }),
    }));
  }, [recipe, effectiveSlot, repos, version]);

  return (
    <Screen>
      <SectionTitle>Quel plat ?</SectionTitle>
      <Row>
        {ordered.map((r) => (
          <Chip key={r.id} label={r.name} selected={r.id === recipeId} onPress={() => setRecipeId(r.id)} />
        ))}
      </Row>

      <SectionTitle>Pour quel repas ?</SectionTitle>
      <Row>
        {slots.map((s) => <Chip key={s} label={SLOT_LABEL[s]} selected={s === effectiveSlot} onPress={() => setSlot(s)} />)}
      </Row>

      {results.map(({ mode, title, help, result }) => (
        <ResultCard key={mode} title={title} help={help} result={result} accent={t.accent} />
      ))}
    </Screen>
  );
}

function ResultCard({ title, help, result, accent }: { title: string; help: string; result: AdaptationResult; accent: string }) {
  const t = useTheme();
  const changed = result.lines.filter((l) => Math.abs(l.factor - 1) > 0.001 || result.mode === 'alleger');
  return (
    <Card>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: fonts.display, fontWeight: '700', fontSize: 17, lineHeight: 24, letterSpacing: 1.2, color: accent }}>{title}</Text>
        <Badge label={`cible ${result.target.kcal} kcal · ${result.target.protein} g P`} />
      </Row>
      <Body muted>{help}</Body>
      <Row style={{ gap: 6 }}>
        <Text style={[text.number, { color: t.muted }]}>{result.before.kcal} →</Text>
        <Text style={[text.number, { color: t.text, fontWeight: '600' }]}>{result.after.kcal} kcal</Text>
        <Text style={[text.number, { color: t.faint }]}>·</Text>
        <Text style={[text.number, { color: t.muted }]}>{Math.round(result.before.protein)} →</Text>
        <Text style={[text.number, { color: t.text, fontWeight: '600' }]}>{Math.round(result.after.protein)} g P</Text>
      </Row>
      {result.appliedSubstitutions.length > 0 && <Body>{result.appliedSubstitutions.join(' · ')}</Body>}
      {result.mode !== 'compenser' && changed.length > 0 && (
        <View>
          {changed.map((l) => (
            <Row key={l.ingredientId} style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
              <Body style={{ flex: 1 }}>{INDEX.get(l.ingredientId)?.name}</Body>
              <Body bold>{displayQuantity(l.grams, 'g').text}</Body>
            </Row>
          ))}
        </View>
      )}
      {result.otherSlots && (
        <View>
          {result.otherSlots.map((s) => (
            <Row key={s.slot} style={{ justifyContent: 'space-between' }}>
              <Body>{SLOT_LABEL[s.slot]}</Body>
              <Body bold>{s.kcal} kcal</Body>
            </Row>
          ))}
        </View>
      )}
      {result.notes.map((n) => <Body key={n} muted>{n}</Body>)}
      {result.warnings.map((w) => <Banner key={w}>{w}</Banner>)}
      {result.warnings.length === 0 && <Text style={[text.label, { color: t.accent }]}>Dans la cible</Text>}
    </Card>
  );
}
