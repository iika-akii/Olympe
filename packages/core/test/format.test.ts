import { describe, expect, it } from 'vitest';
import { formatRoman, formatThousands } from '../src';

describe('formats', () => {
  it('sépare les milliers par une espace fine insécable', () => {
    expect(formatThousands(2064)).toBe('2 064');
    expect(formatThousands(750)).toBe('750');
    expect(formatThousands(1234567.4)).toBe('1 234 567');
    expect(formatThousands(-1900)).toBe('-1 900');
    expect(formatThousands(0)).toBe('0');
  });

  it('numérote les étapes en chiffres romains', () => {
    expect([1, 2, 3, 4, 5, 6, 9, 10, 14, 19, 39].map(formatRoman)).toEqual(['I', 'II', 'III', 'IV', 'V', 'VI', 'IX', 'X', 'XIV', 'XIX', 'XXXIX']);
    expect(formatRoman(40)).toBe('40');
    expect(formatRoman(0)).toBe('0');
  });
});
