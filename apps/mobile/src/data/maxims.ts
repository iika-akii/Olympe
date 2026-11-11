import { daysBetween, type ISODate } from '@olympe/core';

export interface MaximEntry { text: string; author: string }

/**
 * Maximes antiques (domaine public), traduites librement. Une par jour, dans l'ordre, sans hasard :
 * la même date affiche toujours la même maxime.
 */
export const MAXIMS: MaximEntry[] = [
  { text: 'Devant l’excellence, les dieux ont placé la sueur.', author: 'Hésiode · Les Travaux et les Jours' },
  { text: 'À l’aube, quand tu peines à te lever, dis-toi : je me lève pour faire œuvre d’homme.', author: 'Marc Aurèle · Pensées, V' },
  { text: 'Dis-toi d’abord ce que tu veux être, puis fais ce que tu as à faire.', author: 'Épictète · Entretiens, III' },
  { text: 'L’obstacle à l’action fait avancer l’action. Ce qui barre la route devient la route.', author: 'Marc Aurèle · Pensées, V' },
  { text: 'Rien de grand ne se fait d’un coup.', author: 'Épictète · Entretiens, I' },
  { text: 'Ce n’est pas parce que les choses sont difficiles que nous n’osons pas ; c’est parce que nous n’osons pas qu’elles sont difficiles.', author: 'Sénèque · Lettres à Lucilius, 104' },
  { text: 'N’aspire pas, ô mon âme, à la vie immortelle, mais épuise le champ du possible.', author: 'Pindare · Pythiques, III' },
  { text: 'Ne discute plus de ce que doit être un homme de bien : sois-en un.', author: 'Marc Aurèle · Pensées, X' },
  { text: 'Un esprit sain dans un corps sain.', author: 'Juvénal · Satires, X' },
  { text: 'Nous n’avons pas trop peu de temps : nous en perdons beaucoup.', author: 'Sénèque · De la brièveté de la vie' },
];

export function maximFor(date: ISODate): MaximEntry {
  const n = MAXIMS.length;
  return MAXIMS[((daysBetween('2026-01-01', date) % n) + n) % n]!;
}
