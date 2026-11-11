import type { ISODate } from './domain';

const DAY_MS = 86_400_000;
const parse = (d: ISODate) => Date.parse(`${d}T00:00:00Z`);

export const addDays = (d: ISODate, n: number): ISODate => new Date(parse(d) + n * DAY_MS).toISOString().slice(0, 10);
export const daysBetween = (a: ISODate, b: ISODate): number => Math.round((parse(b) - parse(a)) / DAY_MS);
/** 0 = dimanche … 6 = samedi. */
export const weekday = (d: ISODate): number => new Date(parse(d)).getUTCDay();

/** Date ISO dans le fuseau local de l'appareil (pas en UTC). */
export function localISODate(date: Date): ISODate {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

/** Semaine de planification : du dimanche des courses (inclus) au samedi. Renvoie le dimanche. */
export function planningWeekStart(d: ISODate): ISODate {
  return addDays(d, -weekday(d));
}

export function weekDates(start: ISODate): ISODate[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const DAYS_SHORT = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MONTHS_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

const parts = (d: ISODate) => {
  const [y, m, day] = d.split('-').map(Number) as [number, number, number];
  return { y, m, day, wd: weekday(d) };
};

/** « dimanche 15 novembre » */
export function formatDayLong(d: ISODate): string {
  const p = parts(d);
  return `${DAYS[p.wd]} ${p.day === 1 ? '1er' : p.day} ${MONTHS[p.m - 1]}`;
}

/** « dim. 15 nov. » */
export function formatDayShort(d: ISODate): string {
  const p = parts(d);
  return `${DAYS_SHORT[p.wd]} ${p.day} ${MONTHS_SHORT[p.m - 1]}`;
}

/** « Lundi » */
export function weekdayName(d: ISODate): string {
  const n = DAYS[weekday(d)]!;
  return n.charAt(0).toUpperCase() + n.slice(1);
}

/** « semaine du 15 au 21 novembre » */
export function formatWeekRange(start: ISODate): string {
  const a = parts(start);
  const b = parts(addDays(start, 6));
  return a.m === b.m
    ? `du ${a.day} au ${b.day} ${MONTHS[b.m - 1]}`
    : `du ${a.day} ${MONTHS[a.m - 1]} au ${b.day} ${MONTHS[b.m - 1]}`;
}
