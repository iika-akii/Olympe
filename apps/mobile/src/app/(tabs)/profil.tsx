import { DAY_TEMPLATES, NUTRITION_TARGETS, recipesToMarkdown } from '@olympe/core';
import { useMemo } from 'react';
import { router } from 'expo-router';
import { Pressable, Share, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Hero } from '../../components/Hero';
import { Body, Button, Card, Chip, Row, Screen, SectionTitle, text } from '../../components/ui';
import { INDEX, RECIPES, SLOT_LABEL } from '../../data/catalog';
import { useData } from '../../data/store';
import { LOOKS, useDirection, useLookChoice, useTheme } from '../../theme';

export default function Profil() {
  const { repos, version, refresh } = useData();
  const t = useTheme();
  const d = useDirection();
  const look = useLookChoice();
  const gravureLooks = LOOKS.filter((l) => l.direction === 'gravure');
  const pickDirection = (name: 'gravure' | 'doom' | 'raven') => {
    if (name !== d.name) look.setLook(name === 'gravure' ? 'gravure' : name);
  };
  const templateId = useMemo(() => repos.settings.getDayTemplateId(), [repos, version]);

  const exportMarkdown = () => {
    Share.share({ message: recipesToMarkdown(RECIPES, INDEX, repos.ratings.all()) }).catch(() => undefined);
  };

  return (
    <Screen hero={<Hero engraving="ange" kicker="Olympe" title="Profil" />}>
      <SectionTitle>Mon suivi</SectionTitle>
      <Button label="Poids, objectif, activité" icon="trending-down-outline" onPress={() => router.push('/suivi')} />

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
            <Card tone={selected ? 'accent' : undefined}>
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
              <Body>Total : {total} kcal</Body>
            </Card>
          </Pressable>
        );
      })}
      <Body muted>Changer de modèle demande de regénérer la semaine pour en tenir compte.</Body>

      <SectionTitle>Mes cibles</SectionTitle>
      <Card>
        <Row style={{ justifyContent: 'space-between' }}><Body>Calories</Body><Body bold>{NUTRITION_TARGETS.kcalMin} – {NUTRITION_TARGETS.kcalMax} kcal</Body></Row>
        <Row style={{ justifyContent: 'space-between' }}><Body>Plancher</Body><Body bold>{NUTRITION_TARGETS.kcalFloor} kcal</Body></Row>
        <Row style={{ justifyContent: 'space-between' }}><Body>Protéines</Body><Body bold>{NUTRITION_TARGETS.proteinG} g</Body></Row>
        <Body muted>Les calories « brûlées » du Fitbit ne s'ajoutent jamais au budget.</Body>
      </Card>

      <SectionTitle>Mes recettes</SectionTitle>
      <Button label="Exporter en Markdown (Obsidian)" icon="download-outline" variant="secondary" onPress={exportMarkdown} />

      <SectionTitle>Apparence</SectionTitle>
      <Row style={{ flexWrap: 'nowrap' }}>
        <Chip grow label="Gravure" selected={d.name === 'gravure'} onPress={() => pickDirection('gravure')} />
        <Chip grow label="Doom" selected={d.name === 'doom'} onPress={() => pickDirection('doom')} />
        <Chip grow label="Raven" selected={d.name === 'raven'} onPress={() => pickDirection('raven')} />
      </Row>
      {d.name === 'gravure' && (
        <Row>
          {gravureLooks.map((l) => <Chip key={l.id} label={l.label} selected={look.id === l.id} onPress={() => look.setLook(l.id)} />)}
        </Row>
      )}

      <Body muted>Données stockées uniquement sur ce téléphone.</Body>
      <Text style={[text.small, { color: t.muted }]}>{d.credit}</Text>
    </Screen>
  );
}
