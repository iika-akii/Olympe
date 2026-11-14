export { DEFAULT_LOOK, LOOKS, isLookId, resolveLook, type Look, type LookId } from './looks';
export { LookProvider, fonts, radius, text, useDirection, useLookChoice, useTheme } from './current';
export { useAppFonts } from './fonts';
export { directions } from './directions';
export { palettes, type PaletteName } from './palettes';
export type { Direction, DirectionName, EngravingName, HeroImage, Shape, Theme, TypeScale } from './types';

/** Cible tactile minimale (une main, en rayon). */
export const TOUCH = 48;
