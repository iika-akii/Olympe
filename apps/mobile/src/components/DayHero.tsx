import Ionicons from '@expo/vector-icons/Ionicons';
import { formatThousands, type DaySummary, type NutritionTargets } from '@olympe/core';
import { StyleSheet, Text, View } from 'react-native';
import { fonts, useTheme } from '../theme';
import { DayRing, Niche } from './ornaments';
import { Card, Progress, text, type IconName } from './ui';

const STATUS: Record<DaySummary['status'], { label: string; icon: IconName; tone: 'accent' | 'warn' | 'partner' }> = {
  dans_le_plan: { label: 'Dans le plan', icon: 'checkmark-circle-outline', tone: 'accent' },
  a_completer: { label: 'Repas libre à choisir', icon: 'sparkles-outline', tone: 'accent' },
  sous_plancher: { label: 'Sous le plancher', icon: 'alert-circle-outline', tone: 'warn' },
};

/** Le bloc du jour : le total planifié dans sa niche, les protéines et l'état de la journée. */
export function DayHero({ summary, targets }: { summary: DaySummary; targets: NutritionTargets }) {
  const t = useTheme();
  const status = STATUS[summary.status];
  const statusColor = status.tone === 'warn' ? t.warn : t.accent;
  const under = summary.status === 'sous_plancher';
  return (
    <Card framed style={styles.card}>
      <View
        accessible
        accessibilityLabel={`${summary.macros.kcal} kilocalories planifiées sur ${targets.kcalMax}. ${status.label}.`}
      >
        <Niche width={156} height={188} tone={under ? t.warn : t.accent}>
          <View style={{ marginTop: 24 }}>
            <DayRing size={140} progress={summary.kcalProgress} floor={summary.floorProgress} crowned={summary.status === 'dans_le_plan'} tone={under ? 'flamme' : 'or'}>
              <Text style={[styles.kcal, { color: t.text }]}>{formatThousands(summary.macros.kcal)}</Text>
              <Text style={[text.label, { color: t.muted }]}>kcal</Text>
            </DayRing>
          </View>
        </Niche>
      </View>

      <View style={styles.side}>
        <View style={styles.statusRow}>
          <Ionicons name={status.icon} size={16} color={statusColor} />
          <Text style={[text.label, { color: statusColor, flex: 1 }]}>{status.label}</Text>
        </View>

        <View style={{ gap: 6 }}>
          <Text style={[text.label, { color: t.muted }]}>Protéines</Text>
          <Text style={[styles.protein, { color: t.text }]}>
            {summary.macros.protein}
            <Text style={[styles.proteinUnit, { color: t.muted }]}> / {targets.proteinG} g</Text>
          </Text>
          <Progress value={summary.proteinProgress} />
        </View>

        <View style={{ gap: 2 }}>
          <Text style={[text.small, { color: t.muted }]}>
            Cible {formatThousands(targets.kcalMin)} – {formatThousands(targets.kcalMax)} kcal
          </Text>
          <Text style={[text.small, { color: under ? t.warn : t.muted }]}>
            Plancher {formatThousands(targets.kcalFloor)} kcal{summary.hasFreeMeal ? ' · hors repas libre' : ''}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
  side: { flex: 1, gap: 14 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kcal: { fontFamily: fonts.text, fontWeight: '600', fontSize: 23, lineHeight: 26, fontVariant: ['tabular-nums'] },
  protein: { fontFamily: fonts.text, fontWeight: '600', fontSize: 26, lineHeight: 30, fontVariant: ['tabular-nums'] },
  proteinUnit: { fontFamily: fonts.text, fontWeight: '400', fontSize: 15 },
});
