import { daysBetween, formatDayShort, formatNumber, type WeightPoint } from '@olympe/core';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useTheme } from '../theme';
import { text } from './ui';

const HEIGHT = 190;
const PAD = { top: 12, bottom: 12, left: 44, right: 10 };

/**
 * Courbe du poids. Points d'encre : les pesées. Trait rouge : la moyenne sur 7 jours, celle qu'on juge.
 * Tirets : l'objectif, quand il entre dans le cadre.
 */
export function WeightChart({ points, goalKg, width }: { points: readonly WeightPoint[]; goalKg: number; width: number }) {
  const t = useTheme();
  if (points.length === 0) {
    return (
      <View style={[styles.empty, { borderColor: t.border }]}>
        <Text style={[text.body, { color: t.muted, textAlign: 'center' }]}>La courbe apparaît dès la première pesée.</Text>
      </View>
    );
  }
  const first = points[0]!;
  const last = points.at(-1)!;
  const span = Math.max(13, daysBetween(first.date, last.date));
  const values = points.flatMap((p) => [p.kg, p.trendKg]);
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  // L'objectif entre dans le cadre seulement s'il est proche : sinon il écraserait la courbe.
  const goalVisible = goalKg > lo - 3 && goalKg < hi + 3;
  if (goalVisible) { lo = Math.min(lo, goalKg); hi = Math.max(hi, goalKg); }
  const margin = Math.max(0.5, (hi - lo) * 0.15);
  lo -= margin; hi += margin;

  const x = (date: string) => PAD.left + (daysBetween(first.date, date) / span) * (width - PAD.left - PAD.right);
  const y = (kg: number) => PAD.top + (1 - (kg - lo) / (hi - lo)) * (HEIGHT - PAD.top - PAD.bottom);
  const trend = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.date).toFixed(1)} ${y(p.trendKg).toFixed(1)}`).join('');
  const ticks = [hi - margin, (hi + lo) / 2, lo + margin];

  return (
    <View
      accessible
      accessibilityLabel={`Courbe du poids, du ${formatDayShort(first.date)} au ${formatDayShort(last.date)}. Moyenne sur 7 jours : ${formatNumber(last.trendKg)} kilos.`}
    >
      <View style={{ width, height: HEIGHT }}>
        <Svg width={width} height={HEIGHT}>
          {ticks.map((v) => <Line key={v} x1={PAD.left} x2={width - PAD.right} y1={y(v)} y2={y(v)} stroke={t.border} strokeWidth={1} />)}
          {goalVisible && <Line x1={PAD.left} x2={width - PAD.right} y1={y(goalKg)} y2={y(goalKg)} stroke={t.text} strokeWidth={1.2} strokeDasharray="5 4" />}
          {points.map((p) => <Circle key={p.date} cx={x(p.date)} cy={y(p.kg)} r={2.6} fill={t.text} fillOpacity={0.55} />)}
          {points.length > 1 && <Path d={trend} stroke={t.accent} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" fill="none" />}
          <Circle cx={x(last.date)} cy={y(last.trendKg)} r={4.5} fill={t.accent} />
        </Svg>
        {ticks.map((v) => (
          <Text key={v} style={[text.small, styles.tick, { color: t.muted, top: y(v) - 9 }]}>{formatNumber(v)}</Text>
        ))}
      </View>
      <View style={styles.dates}>
        <Text style={[text.small, { color: t.muted }]}>{formatDayShort(first.date)}</Text>
        <Text style={[text.small, { color: t.muted }]}>{formatDayShort(last.date)}</Text>
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: t.text, opacity: 0.55 }]} /><Text style={[text.small, { color: t.muted }]}>Pesée</Text></View>
        <View style={styles.legendItem}><View style={[styles.bar, { backgroundColor: t.accent }]} /><Text style={[text.small, { color: t.muted }]}>Moyenne sur 7 jours</Text></View>
        {goalVisible && <View style={styles.legendItem}><View style={[styles.dash, { borderColor: t.text }]} /><Text style={[text.small, { color: t.muted }]}>Objectif</Text></View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { height: 120, borderWidth: 1, borderStyle: 'dashed', borderRadius: 5, alignItems: 'center', justifyContent: 'center', padding: 16 },
  tick: { position: 'absolute', left: 0, width: PAD.left - 6, textAlign: 'right', fontVariant: ['tabular-nums'] },
  dates: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: PAD.left, paddingRight: PAD.right },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  bar: { width: 16, height: 3 },
  dash: { width: 16, height: 0, borderTopWidth: 1.5, borderStyle: 'dashed' },
});
