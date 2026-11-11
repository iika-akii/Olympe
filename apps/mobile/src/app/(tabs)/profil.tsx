import { DAY_TEMPLATES, NUTRITION_TARGETS, formatThousands, recipesToMarkdown } from '@olympe/core';
import { useMemo } from 'react';
import { Pressable, Share, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Body, Button, Card, Row, Screen, SectionTitle, Stat, text } from '../../components/ui';
import { INDEX, RECIPES, SLOT_LABEL } from '../../data/catalog';
import { useData } from '../../data/store';
import { useTheme } from '../../theme';

export default function Profil() {
  const { repos, version, refresh } = useData();
  const t = useTheme();
  const templateId = useMemo(() => repos.settings.getDayTemplateId(), [repos, version]);

  const exportMarkdown = () => {
    Share.share({ message: recipesToMarkdown(RECIPES, INDEX, repos.ratings.all()) }).catch(() => undefined);
  };

  return (
    <Screen>
      <SectionTitle>Structure de ma journée</SectionTitle>
      {DAY_TEMPLATES.map((tpl) => {
        const selected = tpl.id === templateId;
        const total = tpl.slots.reduce((s, x) => s + x.kcal, 0);
        return (
          <Pressable
            key={tpl.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => { repos.settings.setDayTemplateId(tpl.id); refresh(); }}
          >
            <Card framed={selected}>
              <Row style={{ flexWrap: 'nowrap' }}>
                <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={20} color={selected ? t.accent : t.faint} />
                <Body bold style={{ flex: 1 }}>{tpl.label}</Body>
              </Row>
              <View style={{ gap: 2 }}>
                {tpl.slots.map((s) => (
                  <Row key={s.slot} style={{ justifyContent: 'space-between' }}>
                    <Body muted>{SLOT_LABEL[s.slot]}</Body>
                    <Text style={[text.number, { color: t.muted }]}>{s.kcal} kcal · {s.protein} g P</Text>
                  </Row>
                ))}
              </View>
              <Text style={[text.number, { color: selected ? t.accent : t.text, fontWeight: '600' }]}>Total : {formatThousands(total)} kcal</Text>
            </Card>
          </Pressable>
        );
      })}
      <Body muted>Changer de modèle demande de regénérer la semaine pour en tenir compte.</Body>

      <SectionTitle>Mes cibles</SectionTitle>
      <Row style={{ flexWrap: 'nowrap', gap: 6 }}>
        <Stat value={`${formatThousands(NUTRITION_TARGETS.kcalMin)}–${formatThousands(NUTRITION_TARGETS.kcalMax)}`} label="kcal / jour" tone="accent" flex={1.7} />
        <Stat value={formatThousands(NUTRITION_TARGETS.kcalFloor)} label="Plancher" />
        <Stat value={String(NUTRITION_TARGETS.proteinG)} unit="g" label="Protéines" />
      </Row>
      <Body muted>Les calories « brûlées » du Fitbit ne s'ajoutent jamais au budget.</Body>

      <SectionTitle>Mes recettes</SectionTitle>
      <Button label="Exporter en Markdown (Obsidian)" icon="download-outline" variant="secondary" onPress={exportMarkdown} />

      <Body muted>Données stockées uniquement sur ce téléphone.</Body>
    </Screen>
  );
}
