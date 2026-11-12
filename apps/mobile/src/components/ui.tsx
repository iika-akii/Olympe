/**
 * Primitives d'interface. Elles portent la DA : un écran qui n'utilise qu'elles est conforme sans effort.
 * Les écrans n'écrivent ni couleur ni police en dur.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { TOUCH, fonts, gradients, radius, useTheme, type Theme } from '../theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/** `hero` : en-tête pleine largeur (statue), posé avant le contenu et qui défile avec lui. */
export function Screen({ children, hero }: { children: ReactNode; hero?: ReactNode }) {
  const t = useTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} keyboardShouldPersistTaps="handled">
      {hero}
      <View style={[styles.screen, hero ? { paddingTop: 4 } : null]}>{children}</View>
    </ScrollView>
  );
}

/** `tone` : couleur de la bordure quand la carte demande l'attention ou concerne la compagne. */
export function Card({
  children, style, onPress, tone,
}: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; tone?: 'accent' | 'partner' }) {
  const t = useTheme();
  const borderColor = tone === 'partner' ? t.partner : tone === 'accent' ? t.accent : t.border;
  const base = [styles.card, { backgroundColor: t.card, borderColor }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [base, pressed && { backgroundColor: t.raised }]}>
      {children}
    </Pressable>
  );
}

/** Titre d'écran sans statue (écrans empilés) : la seule ligne en gothique. */
export function Title({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text accessibilityRole="header" style={[styles.title, { color: t.text }]}>{children}</Text>;
}

/** Quadrilobe : le motif des remplages gothiques, en guise de puce. */
function Quatrefoil({ color }: { color: string }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {[[6, 3], [9, 6], [6, 9], [3, 6]].map(([cx, cy]) => <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={2.4} fill="none" stroke={color} strokeWidth={1.1} />)}
    </Svg>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <View style={styles.sectionRow}>
      <Quatrefoil color={t.accent} />
      <Text accessibilityRole="header" style={[styles.section, { color: t.text }]}>{children}</Text>
      <View style={[styles.sectionLine, { backgroundColor: t.border }]} />
    </View>
  );
}

export function Body({ children, muted, bold, style }: { children: ReactNode; muted?: boolean; bold?: boolean; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[styles.body, { color: muted ? t.muted : t.text }, bold && styles.bold, style]}>{children}</Text>;
}

export type Tone = 'accent' | 'partner' | 'warn' | 'danger' | 'muted';
function toneColors(t: Theme, tone: Tone) {
  switch (tone) {
    case 'accent': return { fg: t.accent, bg: t.accentSoft };
    case 'partner': return { fg: t.partner, bg: t.partnerSoft };
    case 'warn': return { fg: t.warn, bg: t.warnSoft };
    case 'danger': return { fg: t.danger, bg: t.dangerSoft };
    case 'muted': return { fg: t.muted, bg: t.raised };
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
    <View style={[styles.banner, { backgroundColor: c.bg, borderLeftColor: c.fg }]}>
      <Ionicons name={icon} size={18} color={c.fg} style={{ marginTop: 2 }} />
      <Text style={[styles.bannerText, { color: c.fg }]}>{children}</Text>
    </View>
  );
}

export function Button({
  label, onPress, variant = 'primary', icon, disabled,
}: { label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger'; icon?: IconName; disabled?: boolean }) {
  const t = useTheme();
  const fg = variant === 'primary' ? t.onAccent : variant === 'danger' ? t.danger : t.text;
  const border = variant === 'primary' ? t.accent : variant === 'danger' ? t.danger : t.borderStrong;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { borderColor: border, backgroundColor: variant === 'primary' ? t.accent : 'transparent' }, pressed && styles.pressed, disabled && styles.disabled]}
    >
      {variant === 'primary' && <LinearGradient colors={gradients.braise} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
      {icon && <Ionicons name={icon} size={18} color={fg} />}
      <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
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
      style={({ pressed }) => [styles.chip, { borderColor: selected ? active : t.borderStrong, backgroundColor: selected ? soft : 'transparent' }, pressed && styles.pressed]}
    >
      <Text style={[styles.chipText, { color: selected ? active : t.muted }]}>{label}</Text>
    </Pressable>
  );
}

export function CheckBox({ checked }: { checked: boolean }) {
  const t = useTheme();
  return (
    <View style={[styles.checkbox, { borderColor: checked ? t.accent : t.borderStrong, backgroundColor: checked ? t.accent : 'transparent' }]}>
      {checked && <Ionicons name="checkmark" size={16} color={t.onAccent} />}
    </View>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Divider() {
  const t = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.border, marginVertical: 10 }} />;
}

/** Styles de texte, pour les rares `Text` écrits à la main dans un écran. */
export const text = StyleSheet.create({
  body: { fontFamily: fonts.text, fontWeight: '400', fontSize: 16, lineHeight: 22 },
  strong: { fontFamily: fonts.text, fontWeight: '600', fontSize: 16, lineHeight: 22 },
  small: { fontFamily: fonts.text, fontWeight: '400', fontSize: 13, lineHeight: 18 },
  /** Capitales étroites espacées : créneaux, en-têtes de colonne. */
  label: { fontFamily: fonts.label, fontWeight: '600', fontSize: 13, lineHeight: 16, letterSpacing: 1.4, textTransform: 'uppercase' },
  number: { fontFamily: fonts.text, fontWeight: '500', fontSize: 16, lineHeight: 22, fontVariant: ['tabular-nums'] },
  heading: { fontFamily: fonts.display, fontWeight: '600', fontSize: 22, lineHeight: 28 },
});

const styles = StyleSheet.create({
  screen: { padding: 16, paddingBottom: 56, gap: 14 },
  card: { borderRadius: radius.md, borderWidth: 1, padding: 14, gap: 10 },
  title: { fontFamily: fonts.display, fontWeight: '600', fontSize: 30, lineHeight: 36 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  section: { fontFamily: fonts.label, fontWeight: '600', fontSize: 15, lineHeight: 18, letterSpacing: 2.2, textTransform: 'uppercase' },
  sectionLine: { flex: 1, height: 1 },
  body: { fontFamily: fonts.text, fontWeight: '400', fontSize: 16, lineHeight: 22 },
  bold: { fontWeight: '600' },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.sm, alignSelf: 'flex-start' },
  badgeText: { fontFamily: fonts.label, fontWeight: '600', fontSize: 13, lineHeight: 16, letterSpacing: 1, textTransform: 'uppercase' },
  banner: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: radius.sm, borderLeftWidth: 2, alignItems: 'flex-start' },
  bannerText: { flex: 1, fontFamily: fonts.text, fontWeight: '500', fontSize: 15, lineHeight: 21 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 16, borderRadius: radius.md, borderWidth: 1, minHeight: TOUCH, overflow: 'hidden' },
  buttonText: { fontFamily: fonts.label, fontWeight: '600', fontSize: 17, lineHeight: 20, letterSpacing: 1.6, textTransform: 'uppercase' },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.4 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.md, borderWidth: 1, minHeight: 40, justifyContent: 'center' },
  chipText: { fontFamily: fonts.text, fontWeight: '600', fontSize: 14, lineHeight: 20 },
  checkbox: { width: 22, height: 22, borderWidth: 1.5, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
});
