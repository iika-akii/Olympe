import type { Theme } from '../types';
import { doom } from './doom';
import { gravure } from './gravure';
import { nuit } from './nuit';
import { outremer } from './outremer';
import { raven } from './raven';
import { verdegris } from './verdegris';

/** Toutes les palettes. Gravure en accepte quatre ; Doom et Raven ont chacune la sienne. */
export const palettes = { gravure, verdegris, outremer, nuit, doom, raven } satisfies Record<string, Theme>;
export type PaletteName = keyof typeof palettes;
