import type { Theme } from '../types';
import { doom } from './doom';
import { gravure } from './gravure';
import { raven } from './raven';

export const palettes = { gravure, doom, raven } satisfies Record<string, Theme>;
export type PaletteName = keyof typeof palettes;
