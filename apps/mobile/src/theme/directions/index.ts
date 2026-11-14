import type { Direction, DirectionName } from '../types';
import { doom } from './doom';
import { gravure } from './gravure';
import { raven } from './raven';

export const directions: Record<DirectionName, Direction> = { gravure, doom, raven };
