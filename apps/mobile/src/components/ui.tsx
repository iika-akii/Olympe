import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function Screen({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

export function Card({ children, style, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const t = useTheme();
  const base = [styles.card, { backgroundColor: t.card, borderColor: t.border }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [base, pressed && { opacity: 0.7 }]}>
      {children}
    </Pressable>
  );
}

export function Title({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={[styles.title, { color: t.text }]}>{children}</Text>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={[styles.section, { color: t.muted }]}>{children}</Text>;
}

export function Body({ children, muted, bold, style }: { children: ReactNode; muted?: boolean; bold?: boolean; style?: object }) {
  const t = useTheme();
  return <Text style={[styles.body, { color: muted ? t.muted : t.text }, bold && { fontWeight: '600' }, style]}>{children}</Text>;
}

type Tone = 'accent' | 'partner' | 'warn' | 'danger' | 'muted';
function toneColors(t: ReturnType<typeof useTheme>, tone: Tone) {
  switch (tone) {
    case 'accent': return { fg: t.accent, bg: t.accentSoft };
    case 'partner': return { fg: t.partner, bg: t.partnerSoft };
    case 'warn': return { fg: t.warn, bg: t.warnSoft };
    case 'danger': return { fg: t.danger, bg: t.dangerSoft };
    case 'muted': return { fg: t.muted, bg: t.bg };
  }
}

export function Badge({ label, tone = 'muted' }: { label: string; tone?: Tone }) {
  const c = toneColors(useTheme(), tone);
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

export function Banner({ children, tone = 'warn', icon = 'alert-circle-outline' }: { children: ReactNode; tone?: Tone; icon?: IconName }) {
  const c = toneColors(useTheme(), tone);
  return (
    <View style={[styles.banner, { backgroundColor: c.bg }]}>
      <Ionicons name={icon} size={18} color={c.fg} style={{ marginTop: 1 }} />
      <Text style={[styles.bannerText, { color: c.fg }]}>{children}</Text>
    </View>
  );
}

export function Button({
  label, onPress, variant = 'primary', icon, disabled,
}: { label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger'; icon?: IconName; disabled?: boolean }) {
  const t = useTheme();
  const colors = variant === 'primary'
    ? { bg: t.accent, fg: t.onAccent, border: t.accent }
    : variant === 'danger'
      ? { bg: t.card, fg: t.danger, border: t.border }
      : { bg: t.card, fg: t.text, border: t.border };
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor: colors.bg, borderColor: colors.border }, (pressed || disabled) && { opacity: 0.6 }]}
    >
      {icon && <Ionicons name={icon} size={18} color={colors.fg} />}
      <Text style={[styles.buttonText, { color: colors.fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, tone = 'accent' }: { label: string; selected: boolean; onPress: () => void; tone?: 'accent' | 'partner' }) {
  const t = useTheme();
  const active = tone === 'partner' ? t.partner : t.accent;
  const soft = tone === 'partner' ? t.partnerSoft : t.accentSoft;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.chip, { borderColor: selected ? active : t.border, backgroundColor: selected ? soft : t.card }]}
    >
      <Text style={[styles.chipText, { color: selected ? active : t.muted }]}>{label}</Text>
    </Pressable>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Divider() {
  const t = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.border, marginVertical: 10 }} />;
}

const styles = StyleSheet.create({
  screen: { padding: 16, paddingBottom: 48, gap: 12 },
  card: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 8 },
  title: { fontSize: 22, fontWeight: '700' },
  section: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 8 },
  body: { fontSize: 15, lineHeight: 21 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  banner: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, alignItems: 'flex-start' },
  bannerText: { flex: 1, fontSize: 14, lineHeight: 20 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, minHeight: 48 },
  buttonText: { fontSize: 15, fontWeight: '600' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, minHeight: 40, justifyContent: 'center' },
  chipText: { fontSize: 14, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
});
