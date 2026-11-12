/**
 * Primitives d'interface. Elles portent la DA : un écran qui n'utilise qu'elles est conforme sans effort.
 * Les écrans n'écrivent ni couleur ni police en dur.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { TOUCH, fonts, radius, useTheme, type Theme } from '../theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/** `hero` : en-tête pleine largeur (gravure), posé avant le contenu et qui défile avec lui. */
export function Screen({ children, hero }: { children: ReactNode; hero?: ReactNode }) {
  const t = useTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} keyboardShouldPersistTaps="handled">
      {hero}
      <View style={[styles.screen, hero ? { paddingTop: 8 } : null]}>{children}</View>
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

/** Titre d'écran sans gravure (écrans empilés), en gothique. */
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
    case 'accent': return { fg: t.accentDeep, bg: t.accentSoft };
    case 'partner': return { fg: t.onInk, bg: t.ink };
    case 'warn': return { fg: t.accentDeep, bg: t.warnSoft };
    case 'danger': return { fg: t.accentDeep, bg: t.dangerSoft };
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
  const fg = variant === 'primary' ? t.onInk : variant === 'danger' ? t.danger : t.text;
  const border = variant === 'danger' ? t.danger : t.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { borderColor: border, backgroundColor: variant === 'primary' ? t.ink : 'transparent' }, pressed && styles.pressed, disabled && styles.disabled]}
    >
      {icon && <Ionicons name={icon} size={18} color={fg} />}
      <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

/**
 * Puce à cocher. `tone="partner"` : aplat d'encre quand elle est cochée (présence de la compagne).
 * `grow` : occupe toute la largeur disponible. `disabled` : affichée mais inerte.
 */
export function Chip({
  label, selected, onPress, tone = 'accent', disabled, grow,
}: { label: string; selected: boolean; onPress: () => void; tone?: 'accent' | 'partner'; disabled?: boolean; grow?: boolean }) {
  const t = useTheme();
  const solid = tone === 'partner';
  const border = disabled ? t.border : selected ? (solid ? t.ink : t.accent) : t.borderStrong;
  const bg = disabled ? 'transparent' : selected ? (solid ? t.ink : t.accentSoft) : 'transparent';
  const fg = disabled ? t.faint : selected ? (solid ? t.onInk : t.accentDeep) : t.muted;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, grow && styles.chipGrow, { borderColor: border, backgroundColor: bg }, pressed && styles.pressed]}
    >
      <Text style={[styles.chipText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function CheckBox({ checked }: { checked: boolean }) {
  const t = useTheme();
  return (
    <View style={[styles.checkbox, { borderColor: checked ? t.accent : t.borderStrong, backgroundColor: checked ? t.accent : 'transparent' }]}>
      {checked && <Ionicons name="checkmark" size={16} color={t.onInk} />}
    </View>
  );
}

/** Chiffre clé avec son libellé. */
export function Stat({ value, unit, label, tone }: { value: string; unit?: string; label: string; tone?: 'accent' }) {
  const t = useTheme();
  return (
    <View style={[styles.stat, { borderColor: t.border, backgroundColor: t.card }]}>
      <Text numberOfLines={1} style={[styles.statValue, { color: tone === 'accent' ? t.accent : t.text }]}>
        {value}
        {unit ? <Text style={[styles.statUnit, { color: t.muted }]}> {unit}</Text> : null}
      </Text>
      <Text style={[text.label, { color: t.muted, fontSize: 12 }]}>{label}</Text>
    </View>
  );
}

/** Saisie d'un nombre avec boutons moins et plus : une main suffit. La valeur se tape aussi au clavier. */
export function Stepper({
  value, onChange, step, unit, label, decimals = 1, min = 0,
}: { value: number; onChange: (v: number) => void; step: number; unit: string; label: string; decimals?: number; min?: number }) {
  const t = useTheme();
  const f = 10 ** decimals;
  const clamp = (v: number) => Math.max(min, Math.round(v * f) / f);
  const shown = value.toFixed(decimals).replace('.', ',');
  const side = (icon: IconName, delta: number, a11y: string) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      onPress={() => onChange(clamp(value + delta))}
      style={({ pressed }) => [styles.stepButton, { borderColor: t.ink }, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={20} color={t.text} />
    </Pressable>
  );
  return (
    <View style={styles.stepper}>
      {side('remove', -step, `${label} : moins ${step}`)}
      <View style={[styles.stepField, { borderColor: t.border, backgroundColor: t.card }]}>
        <TextInput
          accessibilityLabel={label}
          key={shown}
          defaultValue={shown}
          keyboardType="decimal-pad"
          selectTextOnFocus
          onEndEditing={(e) => {
            const parsed = Number(e.nativeEvent.text.replace(',', '.'));
            if (Number.isFinite(parsed) && parsed > 0) onChange(clamp(parsed));
          }}
          style={[styles.stepValue, { color: t.text }]}
        />
        <Text style={[text.body, { color: t.muted }]}>{unit}</Text>
      </View>
      {side('add', step, `${label} : plus ${step}`)}
    </View>
  );
}

/** Champ de saisie d'un nombre entier, avec son libellé. */
export function NumberField({ label, value, onChange, unit }: { label: string; value: number | undefined; onChange: (v: number | undefined) => void; unit: string }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, gap: 4 }}>
      <Text style={[text.label, { color: t.muted }]}>{label}</Text>
      <View style={[styles.field, { borderColor: t.borderStrong, backgroundColor: t.card }]}>
        <TextInput
          accessibilityLabel={label}
          key={String(value)}
          defaultValue={value === undefined ? '' : String(value)}
          placeholder="—"
          placeholderTextColor={t.faint}
          keyboardType="number-pad"
          onEndEditing={(e) => {
            const raw = e.nativeEvent.text.replace(/[^0-9]/g, '');
            onChange(raw === '' ? undefined : Number(raw));
          }}
          style={[styles.fieldInput, { color: t.text }]}
        />
        <Text style={[text.small, { color: t.muted }]}>{unit}</Text>
      </View>
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
  chipText: { fontFamily: fonts.text, fontWeight: '600', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  chipGrow: { flex: 1, alignItems: 'center' },
  stat: { flex: 1, minWidth: 96, borderWidth: 1, borderRadius: radius.sm, paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center', gap: 2 },
  statValue: { fontFamily: fonts.text, fontWeight: '600', fontSize: 22, lineHeight: 26, fontVariant: ['tabular-nums'] },
  statUnit: { fontFamily: fonts.text, fontWeight: '400', fontSize: 13 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepButton: { width: TOUCH, height: TOUCH, borderWidth: 1, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  stepField: { flex: 1, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 6, borderWidth: 1, borderRadius: radius.md, minHeight: TOUCH, paddingHorizontal: 10 },
  stepValue: { fontFamily: fonts.text, fontWeight: '600', fontSize: 24, minWidth: 76, textAlign: 'right', paddingVertical: 8, fontVariant: ['tabular-nums'] },
  field: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: radius.md, minHeight: TOUCH, paddingHorizontal: 12 },
  fieldInput: { flex: 1, minWidth: 0, fontFamily: fonts.text, fontWeight: '500', fontSize: 18, paddingVertical: 8, fontVariant: ['tabular-nums'] },
  checkbox: { width: 22, height: 22, borderWidth: 1.5, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
});
