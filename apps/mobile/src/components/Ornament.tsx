/** Puces des titres de section, une par direction artistique. Décoratives : masquées aux lecteurs d'écran. */
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import type { Direction } from '../theme';

const HIDDEN = { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' } as const;

/** `ground` : couleur du fond, pour les jours percés dans le motif. */
export function Ornament({ kind, color, ground, size = 12 }: { kind: Direction['ornament']; color: string; ground: string; size?: number }) {
  switch (kind) {
    case 'quadrilobe':
      // Le motif des remplages gothiques.
      return (
        <Svg width={size} height={size} viewBox="0 0 12 12" {...HIDDEN}>
          {[[6, 3], [9, 6], [6, 9], [3, 6]].map(([cx, cy]) => <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={2.4} fill="none" stroke={color} strokeWidth={1.1} />)}
        </Svg>
      );
    case 'rivet':
      // Une tête de rivet sur une plaque : carré plein, coins coupés.
      return (
        <Svg width={size} height={size} viewBox="0 0 12 12" {...HIDDEN}>
          <Path d="M3 0.5 H9 L11.5 3 V9 L9 11.5 H3 L0.5 9 V3 Z" fill={color} />
          <Rect x={4.5} y={4.5} width={3} height={3} fill={ground} />
        </Svg>
      );
    case 'croissant':
      // Un croissant de lune.
      return (
        <Svg width={size} height={size} viewBox="0 0 12 12" {...HIDDEN}>
          <Path d="M8.2 0.8 A5.4 5.4 0 1 0 11.2 8.6 A4.4 4.4 0 0 1 8.2 0.8 Z" fill={color} />
        </Svg>
      );
  }
}
