/**
 * Ornements de la DA « Temple de nuit ». Purement décoratifs : masqués aux lecteurs d'écran.
 * Gothique : ogive, niche. Grec : méandre, laurier. Sport : flamme, couronne du vainqueur.
 */
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';
import { palette } from '../theme';

const HIDDEN = { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' } as const;
const f = (n: number) => Math.round(n * 100) / 100;

// ───────────────────────── Méandre (clé grecque) ─────────────────────────
const KEY_W = 14;

/** Frise de clés grecques : une ligne de base et des crochets carrés. */
export function Meander({ units = 5, color = palette.or, opacity = 0.9 }: { units?: number; color?: string; opacity?: number }) {
  const width = units * KEY_W - 3;
  let d = `M0 8.5H${width}`;
  for (let i = 0; i < units; i++) {
    const x = i * KEY_W;
    d += `M${x + 11} 8.5V0.5H${x + 2.5}V5.5H${x + 7.5}V3`;
  }
  return (
    <Svg width={width} height={9} viewBox={`0 0 ${width} 9`} {...HIDDEN}>
      <Path d={d} stroke={color} strokeOpacity={opacity} strokeWidth={1.1} fill="none" />
    </Svg>
  );
}

/** Filet de titre : deux traits qui s'effacent autour d'un méandre. */
export function Rule({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.rule, style]} {...HIDDEN}>
      <LinearGradient colors={['rgba(233,190,98,0)', 'rgba(233,190,98,0.55)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ruleLine} />
      <Meander />
      <LinearGradient colors={['rgba(233,190,98,0.55)', 'rgba(233,190,98,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ruleLine} />
    </View>
  );
}

// ───────────────────────── Cadre à équerres ─────────────────────────
/** Quatre équerres d'or aux angles : marque le bloc le plus important d'un écran. */
export function CornerFrame({ color = palette.or, size = 12 }: { color?: string; size?: number }) {
  const base = { position: 'absolute', width: size, height: size, borderColor: color } as const;
  return (
    <View style={[StyleSheet.absoluteFill, styles.inert]} {...HIDDEN}>
      <View style={[base, { top: -1, left: -1, borderTopWidth: 1.5, borderLeftWidth: 1.5 }]} />
      <View style={[base, { top: -1, right: -1, borderTopWidth: 1.5, borderRightWidth: 1.5 }]} />
      <View style={[base, { bottom: -1, left: -1, borderBottomWidth: 1.5, borderLeftWidth: 1.5 }]} />
      <View style={[base, { bottom: -1, right: -1, borderBottomWidth: 1.5, borderRightWidth: 1.5 }]} />
    </View>
  );
}

// ───────────────────────── Ogive et niche ─────────────────────────
/** Arc brisé : deux arcs de rayon `0,75 × largeur`, centrés sur la ligne de naissance. */
function ogivePath(x0: number, x1: number, bottom: number, inset = 0): { d: string; apexY: number; springY: number } {
  const w = x1 - x0;
  const r = w * 0.75;
  const rise = Math.sqrt(r * w - (w * w) / 4);
  const apexY = inset + 1;
  const springY = apexY + rise;
  const mid = (x0 + x1) / 2;
  return {
    d: `M${f(x0)} ${f(bottom)}V${f(springY)}A${f(r)} ${f(r)} 0 0 1 ${f(mid)} ${f(apexY)}A${f(r)} ${f(r)} 0 0 1 ${f(x1)} ${f(springY)}V${f(bottom)}`,
    apexY,
    springY,
  };
}

/** Niche ogivale : là où une cathédrale pose une statue, l'app pose le chiffre du jour. */
export function Niche({ width, height, children, tone = palette.or }: { width: number; height: number; children?: ReactNode; tone?: string }) {
  const outer = ogivePath(0.75, width - 0.75, height - 0.75);
  const inner = ogivePath(6, width - 6, height - 6, 6.5);
  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill} {...HIDDEN}>
        <Defs>
          <SvgGradient id="niche-fond" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#2A2350" stopOpacity={0.9} />
            <Stop offset="0.55" stopColor={palette.voute} stopOpacity={0.9} />
            <Stop offset="1" stopColor={palette.crypte} stopOpacity={1} />
          </SvgGradient>
        </Defs>
        <Path d={`${outer.d}Z`} fill="url(#niche-fond)" stroke={palette.ligneForte} strokeWidth={1.5} />
        <Path d={inner.d} fill="none" stroke={tone} strokeOpacity={0.45} strokeWidth={1} />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

// ───────────────────────── Couronne de laurier ─────────────────────────
/** `a` en degrés, 0 = haut, sens horaire. */
const polar = (c: number, r: number, a: number) => {
  const rad = (a * Math.PI) / 180;
  return { x: c + r * Math.sin(rad), y: c - r * Math.cos(rad) };
};

function laurelPaths(size: number, radius: number): { leaves: string; stems: string } {
  const c = size / 2;
  const nodes = 8;
  let leaves = '';
  let stems = '';
  for (const side of [1, -1]) {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < nodes; i++) {
      const t = i / (nodes - 1);
      // De la base (croisement des tiges, en bas) vers le sommet, ouvert en haut.
      const a = 164 - t * 138;
      const p = polar(c, radius, a);
      const base = { x: c + side * (p.x - c), y: p.y };
      pts.push(base);
      const rad = (a * Math.PI) / 180;
      const travel = { x: side * -Math.cos(rad), y: -Math.sin(rad) };
      const length = 11 - t * 3.5;
      const widthLeaf = 3 - t * 0.8;
      for (const tilt of [-34, 30]) {
        const tr = (tilt * side * Math.PI) / 180;
        const d = { x: travel.x * Math.cos(tr) - travel.y * Math.sin(tr), y: travel.x * Math.sin(tr) + travel.y * Math.cos(tr) };
        const n = { x: -d.y, y: d.x };
        const tip = { x: base.x + d.x * length, y: base.y + d.y * length };
        const m = { x: base.x + d.x * length * 0.5, y: base.y + d.y * length * 0.5 };
        leaves += `M${f(base.x)} ${f(base.y)}Q${f(m.x + n.x * widthLeaf)} ${f(m.y + n.y * widthLeaf)} ${f(tip.x)} ${f(tip.y)}Q${f(m.x - n.x * widthLeaf)} ${f(m.y - n.y * widthLeaf)} ${f(base.x)} ${f(base.y)}Z`;
      }
    }
    stems += pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${f(p.x)} ${f(p.y)}`).join('');
  }
  return { leaves, stems };
}

/** Couronne du vainqueur, ouverte en haut, tiges croisées en bas. */
export function Laurel({ size, radius, color = palette.or, opacity = 1 }: { size: number; radius: number; color?: string; opacity?: number }) {
  const { leaves, stems } = laurelPaths(size, radius);
  return (
    <Svg width={size} height={size} style={StyleSheet.absoluteFill} {...HIDDEN}>
      <Defs>
        <SvgGradient id="laurier" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor={palette.orSombre} />
          <Stop offset="0.5" stopColor={color} />
          <Stop offset="1" stopColor={palette.orClair} />
        </SvgGradient>
      </Defs>
      <Path d={stems} stroke={color} strokeOpacity={0.55 * opacity} strokeWidth={1} fill="none" />
      <Path d={leaves} fill="url(#laurier)" fillOpacity={opacity} />
    </Svg>
  );
}

// ───────────────────────── Anneau du jour ─────────────────────────
function arcPath(c: number, r: number, progress: number): string {
  const p = Math.min(0.9999, Math.max(0, progress));
  const end = polar(c, r, p * 360);
  return `M${f(c)} ${f(c - r)}A${f(r)} ${f(r)} 0 ${p > 0.5 ? 1 : 0} 1 ${f(end.x)} ${f(end.y)}`;
}

/**
 * Anneau de progression (flamme → or), avec le repère du plancher.
 * La couronne de laurier n'entoure l'anneau que si `crowned` est vrai.
 */
export function DayRing({
  size, progress, floor, crowned, tone = 'or', children,
}: { size: number; progress: number; floor?: number; crowned?: boolean; tone?: 'or' | 'flamme' | 'ether'; children?: ReactNode }) {
  const c = size / 2;
  const stroke = 7;
  const r = c - 22;
  // Repère du plancher : une entaille sombre dans l'arc quand il est dépassé, un trait clair sur la piste sinon.
  const tick = floor === undefined ? null : { a: polar(c, r - 5.5, floor * 360), b: polar(c, r + 5.5, floor * 360) };
  const reached = floor !== undefined && progress >= floor;
  const solid = tone === 'flamme' ? palette.flamme : tone === 'ether' ? palette.ether : null;
  return (
    <View style={{ width: size, height: size }}>
      {crowned && <Laurel size={size} radius={r + 9} />}
      <Svg width={size} height={size} style={StyleSheet.absoluteFill} {...HIDDEN}>
        <Defs>
          <SvgGradient id="anneau" x1="0" y1="1" x2="1" y2="0">
            <Stop offset="0" stopColor={palette.flamme} />
            <Stop offset="0.55" stopColor={palette.or} />
            <Stop offset="1" stopColor={palette.orClair} />
          </SvgGradient>
        </Defs>
        <Path d={arcPath(c, r, 1)} stroke={palette.ligneForte} strokeOpacity={0.7} strokeWidth={stroke} fill="none" />
        {progress > 0.005 && (
          <Path d={arcPath(c, r, progress)} stroke={solid ?? 'url(#anneau)'} strokeWidth={stroke} strokeLinecap="round" fill="none" />
        )}
        {tick && <Path d={`M${f(tick.a.x)} ${f(tick.a.y)}L${f(tick.b.x)} ${f(tick.b.y)}`} stroke={reached ? palette.nyx : palette.marbre} strokeWidth={2} />}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

// ───────────────────────── Emblème ─────────────────────────
/** Emblème d'Olympe : une flamme sous une ogive, posée sur les degrés d'un temple. */
export function Emblem({ size = 96, dim = false }: { size?: number; dim?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" opacity={dim ? 0.55 : 1} {...HIDDEN}>
      <Defs>
        <SvgGradient id="embleme-or" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={palette.orClair} />
          <Stop offset="1" stopColor={palette.orSombre} />
        </SvgGradient>
        <SvgGradient id="embleme-flamme" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={palette.orClair} />
          <Stop offset="0.5" stopColor={palette.or} />
          <Stop offset="1" stopColor={palette.flamme} />
        </SvgGradient>
      </Defs>
      <Path d="M22 88V55A42 42 0 0 1 50 15.4A42 42 0 0 1 78 55V88" stroke="url(#embleme-or)" strokeWidth={3} fill="none" />
      <Path d="M29 88V56A31.5 31.5 0 0 1 50 26.3A31.5 31.5 0 0 1 71 56V88" stroke={palette.or} strokeOpacity={0.45} strokeWidth={1.2} fill="none" />
      <Path d="M50 34C57 45 63 52 63 61C63 69 57.5 75 50 75C42.5 75 37 69 37 61C37 55 40 51 43 47C44 51 46 53 48 53C46.5 46 47.5 40 50 34Z" fill="url(#embleme-flamme)" />
      <Path d="M50 57C53.5 61.5 55.5 64 55.5 67.5C55.5 71 53 73.5 50 73.5C47 73.5 44.5 71 44.5 67.5C44.5 64 46.500 61.5 50 57Z" fill={palette.orClair} />
      <Path d="M39 80H61" stroke={palette.or} strokeWidth={2.2} strokeLinecap="round" />
      <Path d="M15 88.5H85M9 94.5H91" stroke="url(#embleme-or)" strokeWidth={3} strokeLinecap="square" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  rule: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ruleLine: { flex: 1, height: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  inert: { pointerEvents: 'none' },
});
