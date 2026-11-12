/**
 * En-tête d'onglet : une gravure à l'encre qui se perd dans le papier, puis le titre en gothique.
 * La gravure est décorative : elle est masquée aux lecteurs d'écran, le titre porte l'information.
 */
import { Image, StyleSheet, Text, View, useWindowDimensions, type ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, useTheme } from '../theme';

/**
 * Images « encre seule » (noir + transparence), teintées à la couleur d'encre du thème.
 * Sources et traitement : docs/DIRECTION_ARTISTIQUE.md, scripts/prepare-engravings.py.
 */
export const ENGRAVINGS = {
  adam: { source: require('../../assets/gravures/adam.webp'), ratio: 1200 / 727 },
  ange: { source: require('../../assets/gravures/ange.webp'), ratio: 1200 / 727 },
  hercule: { source: require('../../assets/gravures/hercule.webp'), ratio: 1200 / 727 },
  forge: { source: require('../../assets/gravures/forge.webp'), ratio: 1200 / 727 },
  bacchus: { source: require('../../assets/gravures/bacchus.webp'), ratio: 1200 / 727 },
  phaeton: { source: require('../../assets/gravures/phaeton.webp'), ratio: 1 },
} satisfies Record<string, { source: ImageSourcePropType; ratio: number }>;
export type EngravingName = keyof typeof ENGRAVINGS;

const HIDDEN = { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' } as const;

export function Engraving({ name, width, height }: { name: EngravingName; width: number; height: number }) {
  const t = useTheme();
  return <Image source={ENGRAVINGS[name].source} resizeMode="cover" accessible={false} {...HIDDEN} style={{ width, height, tintColor: t.text }} />;
}

export function Hero({ engraving, title, kicker }: { engraving: EngravingName; title: string; kicker?: string }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const height = Math.round(width / ENGRAVINGS[engraving].ratio);
  return (
    <View style={{ backgroundColor: t.bg, paddingTop: insets.top }}>
      <Engraving name={engraving} width={width} height={height} />
      {/* Le titre mord sur le bas de la gravure, là où elle s'efface. */}
      <View style={styles.text}>
        {kicker && <Text style={[styles.kicker, { color: t.accent }]}>{kicker}</Text>}
        <Text accessibilityRole="header" style={[styles.title, { color: t.text }]}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  text: { marginTop: -34, paddingHorizontal: 16, gap: 2 },
  kicker: { fontFamily: fonts.label, fontWeight: '600', fontSize: 15, lineHeight: 18, letterSpacing: 3, textTransform: 'uppercase' },
  title: { fontFamily: fonts.display, fontWeight: '600', fontSize: 40, lineHeight: 44 },
});
