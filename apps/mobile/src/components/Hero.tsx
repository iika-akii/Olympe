/**
 * En-tête d'écran : une statue qui sort de l'ombre, dans un arc brisé, éclairée par la braise.
 * La statue est décorative : elle est masquée aux lecteurs d'écran, le titre porte l'information.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View, useWindowDimensions, type ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { fonts, gradients, palette, useTheme } from '../theme';

/** Sculptures de la collection Open Access du Metropolitan Museum of Art (domaine public). */
export const STATUES = {
  hercule: { source: require('../../assets/statues/hercule.webp'), ratio: 815 / 900 },
  athlete: { source: require('../../assets/statues/athlete.webp'), ratio: 759 / 900 },
  bronze: { source: require('../../assets/statues/bronze.webp'), ratio: 572 / 900 },
  dionysos: { source: require('../../assets/statues/dionysos.webp'), ratio: 667 / 900 },
  ephebe: { source: require('../../assets/statues/ephebe.webp'), ratio: 494 / 760 },
  zeus: { source: require('../../assets/statues/zeus.webp'), ratio: 567 / 760 },
} satisfies Record<string, { source: ImageSourcePropType; ratio: number }>;
export type StatueName = keyof typeof STATUES;

const HIDDEN = { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' } as const;
const f = (n: number) => Math.round(n * 10) / 10;

/** Arc brisé en lancette : deux arcs dont le rayon vaut la largeur de la baie. */
export function lancet(cx: number, width: number, top: number, bottom: number): string {
  const x0 = cx - width / 2;
  const x1 = cx + width / 2;
  const spring = Math.min(bottom, top + width * 0.866);
  return `M${f(x0)} ${f(bottom)}V${f(spring)}A${f(width)} ${f(width)} 0 0 1 ${f(cx)} ${f(top)}A${f(width)} ${f(width)} 0 0 1 ${f(x1)} ${f(spring)}V${f(bottom)}`;
}

/** L'arc et son halo, centrés sur la statue. */
export function Niche({ width, height, cx, archWidth, top }: { width: number; height: number; cx: number; archWidth: number; top: number }) {
  const cy = top + (height - top) * 0.5;
  const r = Math.max(archWidth, height - top) * 0.72;
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} {...HIDDEN}>
      <Defs>
        <RadialGradient id="halo" cx={cx} cy={cy} rx={r} ry={r} fx={cx} fy={cy} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={palette.braise} stopOpacity={0.42} />
          <Stop offset="0.45" stopColor={palette.braiseSombre} stopOpacity={0.2} />
          <Stop offset="1" stopColor={palette.nuit} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="url(#halo)" />
      <Path d={lancet(cx, archWidth, top, height)} fill="none" stroke={palette.marbreOmbre} strokeOpacity={0.7} strokeWidth={1} />
      <Path d={lancet(cx, archWidth - 14, top + 9, height)} fill="none" stroke={palette.braise} strokeOpacity={0.55} strokeWidth={1} />
    </Svg>
  );
}

/**
 * `side` : statue à droite, titre à gauche (écrans qui ont du contenu).
 * `center` : statue au centre, titre dessous (onglets encore vides).
 */
export function Hero({ statue, title, kicker, layout = 'side' }: { statue: StatueName; title: string; kicker?: string; layout?: 'side' | 'center' }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { source, ratio } = STATUES[statue];
  const centered = layout === 'center';

  // L'arc dépasse la statue en haut et sur les côtés : elle se tient dans la baie, sans la masquer.
  const archTop = insets.top + 8;
  const top = archTop + (centered ? 30 : 18);
  const statueHeight = centered ? 290 : 226;
  const statueWidth = Math.min(statueHeight * ratio, width * (centered ? 0.74 : 0.54));
  const height = top + statueHeight + (centered ? 76 : 6);
  const cx = centered ? width / 2 : width - 14 - statueWidth / 2;
  const archWidth = centered ? Math.max(statueWidth + 26, 250) : Math.max(statueWidth * 0.94, 160);

  return (
    <View style={{ height, backgroundColor: t.bg }}>
      <Niche width={width} height={height} cx={cx} archWidth={archWidth} top={archTop} />
      <Image
        source={source}
        resizeMode="contain"
        accessible={false}
        {...HIDDEN}
        style={{ position: 'absolute', top, left: cx - statueWidth / 2, width: statueWidth, height: statueHeight }}
      />
      <LinearGradient colors={gradients.ombre} style={[styles.fade, { height: centered ? 150 : 90 }]} />
      <View style={centered ? styles.centerText : [styles.sideText, { right: statueWidth * 0.7 }]}>
        {kicker && <Text style={[styles.kicker, { color: t.accent }]}>{kicker}</Text>}
        <Text accessibilityRole="header" style={[styles.title, centered && { textAlign: 'center' }, { color: t.text }]}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  sideText: { position: 'absolute', left: 16, bottom: 18, gap: 2 },
  centerText: { position: 'absolute', left: 16, right: 16, bottom: 14, alignItems: 'center', gap: 2 },
  kicker: { fontFamily: fonts.label, fontWeight: '600', fontSize: 15, lineHeight: 18, letterSpacing: 3, textTransform: 'uppercase' },
  title: { fontFamily: fonts.display, fontWeight: '600', fontSize: 38, lineHeight: 42, textShadowColor: palette.nuit, textShadowRadius: 12, textShadowOffset: { width: 0, height: 0 } },
});
