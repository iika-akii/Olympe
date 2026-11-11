import { AISLE_LABELS, AISLES, type ShoppingItem } from '../domain';
import { formatNumber } from '../format';

/** « 2 × 750 g », « 1 × 1 kg », « 7 » : quantité à acheter, prête à afficher. */
export function formatShoppingAmount(item: ShoppingItem): string {
  if (item.packs.length > 0) {
    const counts = new Map<number, number>();
    for (const p of item.packs) counts.set(p, (counts.get(p) ?? 0) + 1);
    return [...counts].map(([size, n]) => `${n} × ${formatUnit(size, item.unit)}`).join(' + ');
  }
  return formatUnit(item.toBuy, item.unit);
}

function formatUnit(value: number, unit: ShoppingItem['unit']): string {
  if (unit === 'piece') return `${value}`;
  if (value >= 1000) return `${formatNumber(value / 1000, 2)} ${unit === 'g' ? 'kg' : 'L'}`;
  return `${Math.round(value)} ${unit}`;
}

/** Texte prêt à partager (WhatsApp, SMS) avec la compagne. */
export function formatShoppingListText(items: readonly ShoppingItem[], title = 'Courses'): string {
  const lines = [title];
  for (const aisle of AISLES) {
    const inAisle = items.filter((i) => i.aisle === aisle);
    if (inAisle.length === 0) continue;
    lines.push('', AISLE_LABELS[aisle]);
    for (const item of inAisle) lines.push(`- ${item.name} : ${formatShoppingAmount(item)}`);
  }
  return lines.join('\n');
}
