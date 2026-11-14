import type { ImageSourcePropType, TextStyle, ViewStyle } from 'react-native';

/** Rôles sémantiques. Les écrans ne lisent que ces clés ; une palette n'est qu'un jeu de valeurs pour elles. */
export interface Theme {
  /** Clair ou sombre : règle la barre d'état et le thème de navigation, jamais une couleur d'écran. */
  scheme: 'light' | 'dark';
  bg: string; card: string; raised: string; text: string; muted: string; faint: string;
  border: string; borderStrong: string;
  /** Rehaut : sélection, repère du jour, liens. `accentDeep` : texte sur `accentSoft`. */
  accent: string; accentDeep: string; accentSoft: string;
  /** Aplat : action principale, présence de la compagne. `onInk` : texte et coche posés sur un aplat ou sur le rehaut. */
  ink: string; onInk: string;
  partner: string; partnerSoft: string;
  warn: string; warnSoft: string;
  danger: string; dangerSoft: string;
}

/** Rôles typographiques. Chaque direction artistique donne un style complet pour chacun. */
export type TypeRole =
  | 'heroTitle' | 'heroKicker' | 'title' | 'heading' | 'section'
  | 'body' | 'strong' | 'small' | 'label' | 'number'
  | 'button' | 'badge' | 'banner' | 'chip'
  | 'statValue' | 'statUnit' | 'stepValue' | 'fieldInput'
  | 'tabLabel' | 'headerTitle' | 'step';
export type TypeScale = Record<TypeRole, TextStyle>;

/** Formes : rayons, épaisseurs, découpe des cartes et des filets. */
export interface Shape {
  sm: number; md: number;
  button: number; chip: number;
  /** Bordure des boutons et des cases à pas. */
  buttonBorder: number;
  /** Bordures propres à la carte (rayon, épaisseurs). */
  card: ViewStyle;
  /** Filet qui prolonge un titre de section. */
  sectionLine: ViewStyle;
}

/** Une image d'en-tête « encre seule » : la transparence porte le dessin, le thème la teinte. */
export interface HeroImage { source: ImageSourcePropType; ratio: number }
/** Noms historiques des images de Gravure ; chaque direction fournit une image pour chacun. */
export type EngravingName = 'adam' | 'ange' | 'hercule' | 'forge' | 'bacchus' | 'phaeton';

export interface FontFamily {
  family: string;
  files: { path: number; weight: number; style: 'normal' | 'italic' }[];
}

export type DirectionName = 'gravure' | 'doom' | 'raven';

/** Une direction artistique : tout le visuel sauf la couleur, qui vient d'une palette. */
export interface Direction {
  name: DirectionName;
  label: string;
  families: { display: string; text: string; label: string };
  fontFiles: FontFamily[];
  type: TypeScale;
  shape: Shape;
  /** Puce des titres de section. */
  ornament: 'quadrilobe' | 'rivet' | 'croissant';
  /** Mise en page de l'en-tête d'onglet. */
  hero: 'gravure' | 'doom' | 'raven';
  images: Record<EngravingName, HeroImage>;
  /** Mention des sources, affichée dans Profil. */
  credit: string;
}
