/**
 * Apparences : une direction artistique (formes, polices, images) + une palette (couleurs).
 * Gravure accepte quatre palettes ; Doom et Raven ont chacune la leur.
 */
import { directions } from './directions';
import { palettes, type PaletteName } from './palettes';
import type { Direction, DirectionName, Theme } from './types';

export const LOOKS = [
  { id: 'gravure', direction: 'gravure', palette: 'gravure', label: 'Rouge sang' },
  { id: 'gravure-verdegris', direction: 'gravure', palette: 'verdegris', label: 'Vert-de-gris' },
  { id: 'gravure-outremer', direction: 'gravure', palette: 'outremer', label: 'Outremer' },
  { id: 'gravure-nuit', direction: 'gravure', palette: 'nuit', label: 'Nuit' },
  { id: 'doom', direction: 'doom', palette: 'doom', label: 'Doom' },
  { id: 'raven', direction: 'raven', palette: 'raven', label: 'Raven' },
] as const satisfies readonly { id: string; direction: DirectionName; palette: PaletteName; label: string }[];

export type LookId = (typeof LOOKS)[number]['id'];
export const DEFAULT_LOOK: LookId = 'gravure';

export interface Look { id: LookId; direction: Direction; theme: Theme }

export function isLookId(value: string | null | undefined): value is LookId {
  return LOOKS.some((l) => l.id === value);
}

export function resolveLook(id: string | null | undefined): Look {
  const entry = LOOKS.find((l) => l.id === id) ?? LOOKS.find((l) => l.id === DEFAULT_LOOK)!;
  return { id: entry.id, direction: directions[entry.direction], theme: palettes[entry.palette] };
}
