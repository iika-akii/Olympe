import { TARGET_PACE_KG_PER_WEEK, formatDate, formatNumber, type GoalProjection, type ProgressSummary } from '@olympe/core';
import { StyleSheet, Text, View } from 'react-native';
import { radius, useTheme } from '../theme';
import { Body, text } from './ui';

const BASIS: Record<GoalProjection['basis'], (p: GoalProjection) => string> = {
  balance: (p) => `D'après ta balance : ${formatNumber(p.weeklyLossKg, 2)} kg par semaine, soit environ ${p.dailyDeficitKcal} kcal de déficit par jour.`,
  bracelet: (p) => `D'après ton bracelet : ${p.dailyDeficitKcal} kcal de déficit par jour, soit ${formatNumber(p.weeklyLossKg, 2)} kg par semaine. C'est une estimation : la balance prendra le relais après 5 pesées sur 10 jours.`,
  rythme_vise: () => `Si tu tiens le rythme visé, ${formatNumber(TARGET_PACE_KG_PER_WEEK.min)} à ${formatNumber(TARGET_PACE_KG_PER_WEEK.max)} kg par semaine. La date se précisera après 5 pesées sur 10 jours.`,
};

/** Où tu en es entre le départ et l'objectif, et la date d'arrivée selon le déficit estimé. */
export function GoalPath({ projection, summary, goalKg }: { projection: GoalProjection | null; summary: ProgressSummary; goalKg: number }) {
  const t = useTheme();
  const pct = Math.round(summary.progress * 100);
  return (
    <View style={{ gap: 10 }}>
      {summary.goalReached ? (
        <Text style={[text.heading, { color: t.text }]}>Objectif atteint.</Text>
      ) : projection ? (
        <View style={{ gap: 2 }}>
          <Text style={[text.label, { color: t.accent }]}>Objectif {formatNumber(goalKg)} kg atteint vers le</Text>
          <Text style={[text.heading, { color: t.text }]}>
            {projection.etaLatestDate ? `${formatDate(projection.etaDate)} au ${formatDate(projection.etaLatestDate)}` : formatDate(projection.etaDate)}
          </Text>
        </View>
      ) : (
        <View style={{ gap: 2 }}>
          <Text style={[text.heading, { color: t.text }]}>Pas de date pour l'instant</Text>
          <Body muted>Ta moyenne ne baisse pas. La date reviendra dès que la balance repartira.</Body>
        </View>
      )}

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: pct }}
        accessibilityLabel="Chemin parcouru vers l'objectif"
        style={[styles.track, { backgroundColor: t.raised, borderColor: t.border }]}
      >
        <View style={{ width: `${pct}%`, backgroundColor: t.accent }} />
      </View>
      <View style={styles.ends}>
        <Text style={[text.small, { color: t.muted }]}>Départ {summary.startKg === null ? '—' : formatNumber(summary.startKg)} kg</Text>
        <Text style={[text.small, { color: t.muted }]}>{pct} % du chemin</Text>
        <Text style={[text.small, { color: t.muted }]}>{formatNumber(goalKg)} kg</Text>
      </View>

      {projection && !summary.goalReached && <Body muted>{BASIS[projection.basis](projection)}</Body>}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 10, borderWidth: 1, borderRadius: radius.sm, flexDirection: 'row', overflow: 'hidden' },
  ends: { flexDirection: 'row', justifyContent: 'space-between' },
});
