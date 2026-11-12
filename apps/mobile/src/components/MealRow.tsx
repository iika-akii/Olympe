import Ionicons from '@expo/vector-icons/Ionicons';
import type { PlannedMeal } from '@olympe/core';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SLOT_LABEL, recipeById } from '../data/catalog';
import { TOUCH, useTheme } from '../theme';
import { Badge, text } from './ui';

export function MealRow({ meal, onPress }: { meal: PlannedMeal; onPress: () => void }) {
  const t = useTheme();
  const recipe = recipeById(meal.recipeId);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]} accessibilityRole="button">
      <Text style={[text.label, styles.slot, { color: t.accent }]}>{SLOT_LABEL[meal.slot]}</Text>
      <View style={styles.main}>
        <Text style={[text.strong, { color: t.text }]} numberOfLines={2}>{recipe?.name ?? meal.recipeId}</Text>
        <View style={styles.badges}>
          {meal.kind === 'batch' && <Badge label="Batch" tone="accent" />}
          {meal.kind === 'depannage' && <Badge label="Dépannage" tone="warn" />}
          {meal.eaters.includes('partner') && <Badge label="À deux" tone="partner" />}
          {meal.userMacros && (
            <Text style={[text.small, styles.macros, { color: t.muted }]}>
              {Math.round(meal.userMacros.kcal)} kcal · {Math.round(meal.userMacros.protein)} g P
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={t.faint} />
    </Pressable>
  );
}

export function FreeMealRow({ label, onPress }: { label: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]} accessibilityRole="button">
      <Text style={[text.label, styles.slot, { color: t.accent }]}>{label}</Text>
      <View style={styles.main}>
        <Text style={[text.strong, { color: t.text }]}>Repas libre</Text>
        <Text style={[text.small, { color: t.accent }]}>Adapter un plat plaisir</Text>
      </View>
      <Ionicons name="sparkles-outline" size={18} color={t.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, minHeight: TOUCH },
  pressed: { opacity: 0.6 },
  slot: { width: 76 },
  main: { flex: 1, gap: 4 },
  badges: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  macros: { fontVariant: ['tabular-nums'] },
});
