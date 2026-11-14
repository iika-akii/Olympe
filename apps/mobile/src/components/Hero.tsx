/**
 * En-tête d'onglet : une image « encre seule » teintée par le thème, puis le titre.
 * Chaque direction artistique a sa mise en page ; les écrans ne connaissent que `engraving`, `title`, `kicker`.
 * L'image est décorative : elle est masquée aux lecteurs d'écran, le titre porte l'information.
 */
import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDirection, useTheme, type EngravingName } from '../theme';
import { Ornament } from './Ornament';

export type { EngravingName };

const HIDDEN = { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' } as const;

/**
 * Image de la direction courante pour cet emplacement. Sources et traitement : docs/DIRECTION_ARTISTIQUE.md,
 * docs/DA_DOOM_RAVEN.md, scripts/prepare-engravings.py et scripts/prepare-dore.py.
 */
export function Engraving({ name, width, height }: { name: EngravingName; width: number; height: number }) {
  const t = useTheme();
  const d = useDirection();
  return <Image source={d.images[name].source} resizeMode="cover" accessible={false} {...HIDDEN} style={{ width, height, tintColor: t.text }} />;
}

export function Hero({ engraving, title, kicker }: { engraving: EngravingName; title: string; kicker?: string }) {
  const t = useTheme();
  const d = useDirection();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const height = Math.round(width / d.images[engraving].ratio);
  const image = <Engraving name={engraving} width={width} height={height} />;

  if (d.hero === 'doom') {
    return (
      <View style={{ backgroundColor: t.bg, paddingTop: insets.top }}>
        {image}
        {/* Le titre monte sur le bas de l'image, derrière une barre de rehaut. */}
        <View style={styles.doomText}>
          {kicker && (
            <View style={styles.doomKicker}>
              <View style={[styles.doomBar, { backgroundColor: t.accent }]} />
              <Text style={[d.type.heroKicker, { color: t.accent }]}>{kicker}</Text>
            </View>
          )}
          <Text accessibilityRole="header" style={[d.type.heroTitle, { color: t.text }]}>{title}</Text>
        </View>
      </View>
    );
  }

  if (d.hero === 'raven') {
    return (
      <View style={{ backgroundColor: t.bg, paddingTop: insets.top }}>
        {image}
        {/* Titre centré sous l'image, puis un filet orné d'un croissant. */}
        <View style={styles.ravenText}>
          {kicker && <Text style={[d.type.heroKicker, { color: t.accent }]}>{kicker}</Text>}
          <Text accessibilityRole="header" style={[d.type.heroTitle, { color: t.text }]}>{title}</Text>
          <View style={styles.ravenRule}>
            <View style={[styles.ravenLine, { backgroundColor: t.border }]} />
            <Ornament kind="croissant" color={t.accent} ground={t.bg} size={14} />
            <View style={[styles.ravenLine, { backgroundColor: t.border }]} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: t.bg, paddingTop: insets.top }}>
      {image}
      {/* Le titre mord sur le bas de la gravure, là où elle s'efface. */}
      <View style={styles.gravureText}>
        {kicker && <Text style={[d.type.heroKicker, { color: t.accent }]}>{kicker}</Text>}
        <Text accessibilityRole="header" style={[d.type.heroTitle, { color: t.text }]}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gravureText: { marginTop: -34, paddingHorizontal: 16, gap: 2 },
  doomText: { marginTop: -44, paddingHorizontal: 16, gap: 4 },
  doomKicker: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  doomBar: { width: 22, height: 4 },
  ravenText: { marginTop: -30, paddingHorizontal: 16, alignItems: 'center', gap: 4 },
  ravenRule: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  ravenLine: { width: 48, height: 1 },
});
