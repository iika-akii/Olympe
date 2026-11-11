/**
 * Primitives d'interface. Elles portent toute la DA : un écran qui n'utilise qu'elles est conforme sans effort.
 * Les écrans n'importent ni couleur ni police en dur.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { TOUCH, fonts, gradients, radius, useTheme, type Theme } from '../theme';
import { CornerFrame, Rule } from './ornaments';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function Screen({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      {/* Lueur d'éther en haut de page : défile avec le contenu. */}
      <LinearGradient colors={gradients.aurore} style={styles.aurora} />
      {children}
    </ScrollView>
  );
}

/**
 * `framed` : équerres d'or aux angles, pour LE bloc important de l'écran (un seul par écran).
 * `tone` : couleur de la bordure quand la carte appartient à quelqu'un ou signale quelque chose.
 */
export function Card({
  children, style, onPress, framed, tone,
}: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; framed?: boolean; tone?: 'accent' | 'partner' }) {
  const t = useTheme();
  const borderColor = tone === 'partner' ? t.partner : tone === 'accent' || framed ? t.accentDeep : t.border;
  const base = [styles.card, { backgroundColor: t.card, borderColor }, style];
  const content = (
    <>
      {framed && <CornerFrame />}
      {children}
    </>
  );
  if (!onPress) return <View style={base}>{content}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [base, pressed && { backgroundColor: t.raised }]}>
      {content}
    </Pressable>
  );
}

/**
 * Cinzel dessine le « 1 » comme un « I » : dans un titre, « 11 novembre » se lirait « II novembre ».
 * Les chiffres d'une inscription passent donc en Jost.
 */
export function inscription(value: ReactNode): ReactNode {
  if (typeof value !== 'string') return value;
  return value.split(/(\d+)/).map((part, i) => (/^\d+$/.test(part) ? <Text key={i} style={styles.inscriptionDigits}>{part}</Text> : part));
}

/** Titre d'écran, en capitales d'inscription, souligné d'un méandre. */
export function Title({ children, kicker }: { children: ReactNode; kicker?: string }) {
  const t = useTheme();
  return (
    <View style={styles.titleBlock}>
      {kicker && <Text style={[styles.kicker, { color: t.accent }]}>{kicker}</Text>}
      <Text accessibilityRole="header" style={[styles.title, { color: t.text }]}>{inscription(children)}</Text>
      <Rule style={{ marginTop: 6 }} />
    </View>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <View style={styles.sectionRow}>
      <View style={[styles.diamond, { backgroundColor: t.accent }]} />
      <Text accessibilityRole="header" style={[styles.section, { color: t.accent }]}>{inscription(children)}</Text>
      <View style={[styles.sectionLine, { backgroundColor: t.border }]} />
    </View>
  );
}

export function Body({ children, muted, bold, style }: { children: ReactNode; muted?: boolean; bold?: boolean; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[styles.body, { color: muted ? t.muted : t.text }, bold && styles.bold, style]}>{children}</Text>;
}

/** Citation du jour : la seule italique de l'app. */
export function Maxim({ text, author }: { text: string; author: string }) {
  const t = useTheme();
  return (
    <View style={[styles.maxim, { borderLeftColor: t.accentDeep }]}>
      <Text style={[styles.maximText, { color: t.muted }]}>« {text} »</Text>
      <Text style={[styles.maximAuthor, { color: t.accent }]}>{author}</Text>
    </View>
  );
}

/** Chiffre clé avec son libellé : macros, cibles. */
export function Stat({ value, unit, label, tone, flex = 1 }: { value: string; unit?: string; label: string; tone?: 'accent'; flex?: number }) {
  const t = useTheme();
  return (
    <View style={[styles.stat, { flex, borderColor: t.border, backgroundColor: t.bg }]}>
      <Text numberOfLines={1} style={[styles.statValue, { color: tone === 'accent' ? t.accent : t.text }]}>
        {value}
        {unit ? <Text style={[styles.statUnit, { color: t.muted }]}> {unit}</Text> : null}
      </Text>
      <Text style={[styles.statLabel, { color: t.muted }]}>{label}</Text>
    </View>
  );
}

/** Barre de progression fine, à angles vifs. */
export function Progress({ value, tone = 'accent' }: { value: number; tone?: 'accent' | 'partner' | 'warn' }) {
  const t = useTheme();
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: pct }}
      style={[styles.progressTrack, { backgroundColor: t.border }]}
    >
      {tone === 'accent' ? (
        <LinearGradient colors={gradients.flamme} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${pct}%`, height: '100%' }} />
      ) : (
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: tone === 'partner' ? t.partner : t.warn }} />
      )}
    </View>
  );
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
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.fg }]}>
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
  const border = variant === 'primary' ? t.accentBright : variant === 'danger' ? t.danger : t.borderStrong;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { borderColor: border, backgroundColor: variant === 'primary' ? t.accent : 'transparent' }, pressed && styles.pressed, disabled && styles.disabled]}
    >
      {variant === 'primary' && <LinearGradient colors={gradients.or} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
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

/** Case à cocher carrée, taillée comme le reste. */
export function CheckBox({ checked, tone = 'accent' }: { checked: boolean; tone?: 'accent' | 'partner' }) {
  const t = useTheme();
  const active = tone === 'partner' ? t.partner : t.accent;
  return (
    <View style={[styles.checkbox, { borderColor: checked ? active : t.borderStrong, backgroundColor: checked ? active : 'transparent' }]}>
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

/** Style de texte courant, pour les rares `Text` écrits à la main dans un écran. */
export const text = StyleSheet.create({
  body: { fontFamily: fonts.text, fontWeight: '400', fontSize: 16, lineHeight: 22 },
  strong: { fontFamily: fonts.text, fontWeight: '600', fontSize: 16, lineHeight: 22 },
  small: { fontFamily: fonts.text, fontWeight: '400', fontSize: 13, lineHeight: 18 },
  /** Petites capitales espacées : libellés de créneau, en-têtes de colonne. */
  label: { fontFamily: fonts.text, fontWeight: '600', fontSize: 11, lineHeight: 16, letterSpacing: 1.1, textTransform: 'uppercase' },
  /** Chiffres alignés en colonnes. */
  number: { fontFamily: fonts.text, fontWeight: '500', fontSize: 16, lineHeight: 22, fontVariant: ['tabular-nums'] },
  display: { fontFamily: fonts.display, fontWeight: '700', letterSpacing: 0.8 },
});

const styles = StyleSheet.create({
  screen: { padding: 16, paddingBottom: 56, gap: 14 },
  aurora: { position: 'absolute', top: 0, left: 0, right: 0, height: 320, pointerEvents: 'none' },
  card: { borderRadius: radius.md, borderWidth: 1, padding: 14, gap: 10 },
  titleBlock: { gap: 2, marginBottom: 2 },
  kicker: { fontFamily: fonts.text, fontWeight: '600', fontSize: 12, lineHeight: 16, letterSpacing: 2.4, textTransform: 'uppercase' },
  title: { fontFamily: fonts.display, fontWeight: '700', fontSize: 25, lineHeight: 32, letterSpacing: 0.6 },
  inscriptionDigits: { fontFamily: fonts.text, fontWeight: '600', letterSpacing: 0 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  diamond: { width: 6, height: 6, transform: [{ rotate: '45deg' }] },
  section: { fontFamily: fonts.display, fontWeight: '600', fontSize: 13, lineHeight: 18, letterSpacing: 1.6, textTransform: 'uppercase' },
  sectionLine: { flex: 1, height: 1 },
  body: { fontFamily: fonts.text, fontWeight: '400', fontSize: 16, lineHeight: 22 },
  bold: { fontWeight: '600' },
  maxim: { borderLeftWidth: 2, paddingLeft: 12, gap: 4 },
  maximText: { fontFamily: fonts.text, fontStyle: 'italic', fontWeight: '400', fontSize: 15, lineHeight: 21 },
  maximAuthor: { fontFamily: fonts.text, fontWeight: '600', fontSize: 11, lineHeight: 14, letterSpacing: 1.4, textTransform: 'uppercase' },
  stat: { minWidth: 70, borderWidth: 1, borderRadius: radius.sm, paddingVertical: 8, paddingHorizontal: 6, alignItems: 'center', gap: 2 },
  statValue: { fontFamily: fonts.text, fontWeight: '600', fontSize: 20, lineHeight: 24, fontVariant: ['tabular-nums'] },
  statUnit: { fontFamily: fonts.text, fontWeight: '400', fontSize: 12 },
  statLabel: { fontFamily: fonts.text, fontWeight: '600', fontSize: 10, lineHeight: 14, letterSpacing: 1.1, textTransform: 'uppercase' },
  progressTrack: { height: 4, borderRadius: radius.sm, overflow: 'hidden' },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.sm, borderWidth: StyleSheet.hairlineWidth, alignSelf: 'flex-start' },
  badgeText: { fontFamily: fonts.text, fontWeight: '600', fontSize: 11, lineHeight: 16, letterSpacing: 0.8, textTransform: 'uppercase' },
  banner: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: radius.sm, borderLeftWidth: 2, alignItems: 'flex-start' },
  bannerText: { flex: 1, fontFamily: fonts.text, fontWeight: '500', fontSize: 15, lineHeight: 21 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 16, borderRadius: radius.md, borderWidth: 1, minHeight: TOUCH, overflow: 'hidden' },
  buttonText: { fontFamily: fonts.text, fontWeight: '700', fontSize: 14, lineHeight: 20, letterSpacing: 1.2, textTransform: 'uppercase' },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.4 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.md, borderWidth: 1, minHeight: 40, justifyContent: 'center' },
  chipText: { fontFamily: fonts.text, fontWeight: '600', fontSize: 14, lineHeight: 20 },
  checkbox: { width: 22, height: 22, borderWidth: 1.5, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
});
