import { AISLE_LABELS, AISLES, type ShoppingItem } from '../domain';

function formatAmount(item: ShoppingItem): string {
  if (item.packs.length > 0) {
    const counts = new Map<number, number>();
    for (const p of item.packs) counts.set(p, (counts.get(p) ?? 0) + 1);
    return [...counts].map(([size, n]) => `${n} × ${formatUnit(size, item.unit)}`).join(' + ');
  }
  return formatUnit(item.toBuy, item.unit);
}

function formatUnit(value: number, unit: ShoppingItem['unit']): string {
  if (unit === 'piece') return `${value}`;
  if (value >= 1000) return `${(value / 1000).toLocaleString('fr-FR')} ${unit === 'g' ? 'kg' : 'L'}`;
  return `${Math.round(value)} ${unit}`;
}

/** Texte prêt à partager (WhatsApp, SMS) avec la compagne. */
export function formatShoppingListText(items: readonly ShoppingItem[], title = 'Courses'): string {
  const lines = [title];
  for (const aisle of AISLES) {
    const inAisle = items.filter((i) => i.aisle === aisle);
    if (inAisle.length === 0) continue;
    lines.push('', AISLE_LABELS[aisle]);
    for (const item of inAisle) lines.push(`- ${item.name} : ${formatAmount(item)}`);
  }
  return lines.join('\n');
}
