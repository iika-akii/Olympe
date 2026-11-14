import { describe, expect, it } from 'vitest';
import { formatDate } from '../src';

describe('dates', () => {
  it('date longue avec l’année', () => {
    expect(formatDate('2027-05-28')).toBe('28 mai 2027');
    expect(formatDate('2027-08-01')).toBe('1er août 2027');
  });
});
