import { describe, expect, it } from 'vitest';
import { SEED_RATINGS } from '@olympe/core';
import { LATEST_VERSION, createRepositories, currentVersion, generateWeek, isPlanStale, migrate } from '../src';
import { memoryDriver } from './helpers';

const setup = () => {
  const db = memoryDriver();
  migrate(db);
  return { db, repos: createRepositories(db) };
};
const SUNDAY = '2026-11-15';

describe('migrations', () => {
  it('appliquent le schéma une seule fois', () => {
    const db = memoryDriver();
    expect(migrate(db)).toBe(LATEST_VERSION);
    expect(migrate(db)).toBe(LATEST_VERSION);
    expect(currentVersion(db)).toBe(LATEST_VERSION);
  });
});

describe('réglages', () => {
  it('modèle de journée : 3 repas par défaut, modifiable', () => {
    const { repos } = setup();
    expect(repos.settings.getDayTemplateId()).toBe('trois-repas');
    repos.settings.setDayTemplateId('deux-repas');
    expect(repos.settings.getDayTemplateId()).toBe('deux-repas');
  });
});

describe('dates de la compagne', () => {
  it('ajout, retrait et lecture par période', () => {
    const { repos } = setup();
    repos.partner.setPresent('2026-11-16', true);
    repos.partner.setPresent('2026-11-16', true);
    repos.partner.setPresent('2026-11-18', true);
    repos.partner.setPresent('2026-11-25', true);
    repos.partner.setPresent('2026-11-18', false);
    expect(repos.partner.listBetween(SUNDAY, '2026-11-21')).toEqual(['2026-11-16']);
  });
});

describe('notes des recettes', () => {
  it('part du seed et enregistre le verdict de la compagne', () => {
    const { repos } = setup();
    expect(repos.ratings.all()).toHaveLength(SEED_RATINGS.length);
    repos.ratings.setPartnerVerdict('gyudon', 'oui', '2026-11-16T21:00:00Z');
    expect(repos.ratings.get('gyudon')).toMatchObject({ partnerVerdict: 'oui', userLiked: true });
    repos.ratings.setUserLiked('gyudon', false, '2026-11-16T21:05:00Z');
    expect(repos.ratings.get('gyudon')).toMatchObject({ partnerVerdict: 'oui', userLiked: false });
    expect(repos.ratings.all()).toHaveLength(SEED_RATINGS.length);
  });
});

describe('génération de la semaine', () => {
  it('utilise les dates de la compagne, enregistre le plan et remet les cases à zéro', () => {
    const { db, repos } = setup();
    for (const d of ['2026-11-16', '2026-11-17']) repos.partner.setPresent(d, true);
    repos.shopping.setChecked(SUNDAY, 'poulet-filet', true);
    const stored = generateWeek(db, repos, { startDate: SUNDAY, lateShopping: false, now: '2026-11-14T18:00:00Z' });
    expect(stored.options.partnerDates).toEqual(['2026-11-16', '2026-11-17']);
    expect(repos.plans.get(SUNDAY)).toEqual(stored);
    expect(repos.shopping.checked(SUNDAY).size).toBe(0);
    const dinners = stored.plan.meals.filter((m) => m.slot === 'diner');
    expect(dinners.filter((m) => m.eaters.includes('partner')).map((m) => m.date)).toEqual(['2026-11-16', '2026-11-17']);
  });

  it('les verdicts de la compagne influencent le plan suivant', () => {
    const { db, repos } = setup();
    for (let i = 0; i < 7; i++) repos.partner.setPresent(`2026-11-${15 + i}`, true);
    const first = generateWeek(db, repos, { startDate: SUNDAY, lateShopping: false, now: 'x' });
    for (const id of first.plan.partnerTests) repos.ratings.setPartnerVerdict(id, 'non', 'y');
    const second = generateWeek(db, repos, { startDate: SUNDAY, lateShopping: false, now: 'z' });
    const servedToHer = second.plan.meals.filter((m) => m.eaters.includes('partner')).map((m) => m.recipeId);
    for (const id of first.plan.partnerTests) expect(servedToHer).not.toContain(id);
  });

  it('signale un plan devenu obsolète quand les dates changent', () => {
    const { db, repos } = setup();
    const stored = generateWeek(db, repos, { startDate: SUNDAY, lateShopping: false, now: 'x' });
    expect(isPlanStale(repos, stored)).toBe(false);
    repos.partner.setPresent('2026-11-19', true);
    expect(isPlanStale(repos, stored)).toBe(true);
  });
});

describe('cases de courses', () => {
  it('persistent par semaine', () => {
    const { repos } = setup();
    repos.shopping.setChecked(SUNDAY, 'oeuf', true);
    repos.shopping.setChecked('2026-11-22', 'oeuf', true);
    repos.shopping.setChecked(SUNDAY, 'skyr', true);
    repos.shopping.setChecked(SUNDAY, 'skyr', false);
    expect([...repos.shopping.checked(SUNDAY)]).toEqual(['oeuf']);
  });
});
