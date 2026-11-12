import Ionicons from '@expo/vector-icons/Ionicons';
import type { PlannedMeal } from '@olympe/core';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SLOT_LABEL, recipeById } from '../data/catalog';
import { useTheme } from '../theme';
import { Badge } from './ui';

export function MealRow({ meal, onPress }: { meal: PlannedMeal; onPress: () => void }) {
  const t = useTheme();
  const recipe = recipeById(meal.recipeId);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]} accessibilityRole="button">
      <Text style={[styles.slot, { color: t.muted }]}>{SLOT_LABEL[meal.slot]}</Text>
      <View style={styles.main}>
        <Text style={[styles.name, { color: t.text }]} numberOfLines={2}>{recipe?.name ?? meal.recipeId}</Text>
        <View style={styles.badges}>
          {meal.kind === 'batch' && <Badge label="Batch" tone="accent" />}
          {meal.kind === 'depannage' && <Badge label="Dépannage" tone="warn" />}
          {meal.eaters.includes('partner') && <Badge label="À deux" tone="partner" />}
          {meal.userMacros && <Text style={[styles.kcal, { color: t.muted }]}>{Math.round(meal.userMacros.kcal)} kcal · {Math.round(meal.userMacros.protein)} g P</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={t.muted} />
    </Pressable>
  );
}

export function FreeMealRow({ label, onPress }: { label: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]} accessibilityRole="button">
      <Text style={[styles.slot, { color: t.muted }]}>{label}</Text>
      <View style={styles.main}>
        <Text style={[styles.name, { color: t.text }]}>Repas libre</Text>
        <Text style={[styles.kcal, { color: t.accent }]}>Adapter un plat plaisir</Text>
      </View>
      <Ionicons name="sparkles-outline" size={18} color={t.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, minHeight: 48 },
  slot: { width: 72, fontSize: 13, fontWeight: '600' },
  main: { flex: 1, gap: 4 },
  name: { fontSize: 15, fontWeight: '600' },
  badges: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  kcal: { fontSize: 12 },
});
