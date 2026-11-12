import { describe, expect, it } from 'vitest';
import { SEED_RATINGS } from '@olympe/core';
import { LATEST_VERSION, MIGRATIONS, createRepositories, currentVersion, generateWeek, isPlanStale, migrate } from '../src';
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

describe('repas de la compagne', () => {
  it('ajout, retrait et lecture par période, repas par repas', () => {
    const { repos } = setup();
    repos.partner.setPresent('2026-11-16', 'diner', true);
    repos.partner.setPresent('2026-11-16', 'diner', true);
    repos.partner.setPresent('2026-11-21', 'dejeuner', true);
    repos.partner.setPresent('2026-11-21', 'diner', true);
    repos.partner.setPresent('2026-11-25', 'diner', true);
    repos.partner.setPresent('2026-11-21', 'diner', false);
    expect(repos.partner.listBetween(SUNDAY, '2026-11-21')).toEqual([
      { date: '2026-11-16', slot: 'diner' }, { date: '2026-11-21', slot: 'dejeuner' },
    ]);
  });

  it('la migration reprend l’ancienne saisie par jour : dîner, plus le déjeuner le samedi', () => {
    const db = memoryDriver();
    db.exec(MIGRATIONS[0]!.sql);
    db.exec('PRAGMA user_version = 1');
    db.run('INSERT INTO partner_dates (date) VALUES (?), (?)', ['2026-11-17', '2026-11-21']); // mardi, samedi
    expect(migrate(db)).toBe(LATEST_VERSION);
    expect(createRepositories(db).partner.listBetween(SUNDAY, '2026-11-21')).toEqual([
      { date: '2026-11-17', slot: 'diner' }, { date: '2026-11-21', slot: 'dejeuner' }, { date: '2026-11-21', slot: 'diner' },
    ]);
  });
});

describe('suivi', () => {
  it('pesées : une par jour, corrigeable, supprimable', () => {
    const { repos } = setup();
    repos.weighIns.set({ date: '2026-11-16', kg: 99.8 });
    repos.weighIns.set({ date: '2026-11-15', kg: 100.2 });
    repos.weighIns.set({ date: '2026-11-16', kg: 99.6 });
    expect(repos.weighIns.all()).toEqual([{ date: '2026-11-15', kg: 100.2 }, { date: '2026-11-16', kg: 99.6 }]);
    expect(repos.weighIns.get('2026-11-16')).toEqual({ date: '2026-11-16', kg: 99.6 });
    repos.weighIns.remove('2026-11-15');
    expect(repos.weighIns.get('2026-11-15')).toBeNull();
  });

  it('activité : pas et dépense du bracelet, chacun facultatif', () => {
    const { repos } = setup();
    repos.health.set({ date: '2026-11-16', steps: 9200, source: 'manual' });
    repos.health.set({ date: '2026-11-17', steps: 7000, expenditureKcal: 2650, source: 'manual' });
    expect(repos.health.get('2026-11-16')).toEqual({ date: '2026-11-16', steps: 9200, source: 'manual' });
    expect(repos.health.listBetween('2026-11-16', '2026-11-17')).toHaveLength(2);
    repos.health.set({ date: '2026-11-16', source: 'manual' });
    expect(repos.health.get('2026-11-16')).toBeNull();
  });

  it('objectif de poids : 85 kg par défaut, modifiable', () => {
    const { repos } = setup();
    expect(repos.settings.getGoalKg()).toBe(85);
    repos.settings.setGoalKg(88.5);
    expect(repos.settings.getGoalKg()).toBe(88.5);
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
  it('utilise les repas de la compagne, enregistre le plan et remet les cases à zéro', () => {
    const { db, repos } = setup();
    for (const d of ['2026-11-16', '2026-11-17']) repos.partner.setPresent(d, 'diner', true);
    repos.shopping.setChecked(SUNDAY, 'poulet-filet', true);
    const stored = generateWeek(db, repos, { startDate: SUNDAY, lateShopping: false, now: '2026-11-14T18:00:00Z' });
    expect(stored.options.partnerMeals).toEqual([{ date: '2026-11-16', slot: 'diner' }, { date: '2026-11-17', slot: 'diner' }]);
    expect(repos.plans.get(SUNDAY)).toEqual(stored);
    expect(repos.shopping.checked(SUNDAY).size).toBe(0);
    const dinners = stored.plan.meals.filter((m) => m.slot === 'diner');
    expect(dinners.filter((m) => m.eaters.includes('partner')).map((m) => m.date)).toEqual(['2026-11-16', '2026-11-17']);
  });

  it('les verdicts de la compagne influencent le plan suivant', () => {
    const { db, repos } = setup();
    for (let i = 0; i < 7; i++) repos.partner.setPresent(`2026-11-${15 + i}`, 'diner', true);
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
    repos.partner.setPresent('2026-11-19', 'diner', true);
    expect(isPlanStale(repos, stored)).toBe(true);
  });

  it('un plan généré avant la saisie par repas reste à jour tant que rien ne change', () => {
    const { db, repos } = setup();
    repos.partner.setPresent('2026-11-21', 'dejeuner', true);
    repos.partner.setPresent('2026-11-21', 'diner', true);
    const stored = generateWeek(db, repos, { startDate: SUNDAY, lateShopping: false, now: 'x' });
    const legacy = { ...stored, options: { partnerDates: ['2026-11-21'], lateShopping: false, dayTemplateId: stored.options.dayTemplateId } };
    expect(isPlanStale(repos, legacy)).toBe(false);
    repos.partner.setPresent('2026-11-21', 'diner', false);
    expect(isPlanStale(repos, legacy)).toBe(true);
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
