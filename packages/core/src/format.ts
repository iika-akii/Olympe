/** Nombre au format français, sans dépendre d'Intl (Hermes). */
export function formatNumber(value: number, decimals = 1): string {
  const f = 10 ** decimals;
  const r = Math.round(value * f) / f;
  return String(r).replace('.', ',');
}

const FRACTIONS: Record<string, string> = { '0.25': '¼', '0.5': '½', '0.75': '¾' };

/** 1.5 → « 1½ », 0.25 → « ¼ », 2 → « 2 ». Arrondi au quart. */
export function formatQuarter(value: number): string {
  const q = Math.round(value * 4) / 4;
  const whole = Math.floor(q);
  const frac = FRACTIONS[String(q - whole)] ?? '';
  if (whole === 0) return frac || '0';
  return `${whole}${frac}`;
}

/** 2064 → « 2 064 » (espace fine insécable), sans dépendre d'Intl (Hermes). */
export function formatThousands(value: number): string {
  const r = Math.round(value);
  const digits = String(Math.abs(r)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return r < 0 ? `-${digits}` : digits;
}

const ROMAN: [number, string][] = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];

/** 1 → « I », 4 → « IV », 12 → « XII ». Numérotation des étapes ; au-delà de 39, chiffres arabes. */
export function formatRoman(value: number): string {
  if (!Number.isInteger(value) || value < 1 || value > 39) return String(value);
  let n = value;
  let out = '';
  for (const [v, s] of ROMAN) while (n >= v) { out += s; n -= v; }
  return out;
}
