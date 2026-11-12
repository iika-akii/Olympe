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
