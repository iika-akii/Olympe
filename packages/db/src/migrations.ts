import { transaction, type SqlDriver } from './driver';

export interface Migration { version: number; sql: string }

/** Migrations appliquées dans l'ordre ; la version courante est stockée dans PRAGMA user_version. */
export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
      CREATE TABLE partner_dates (date TEXT PRIMARY KEY NOT NULL);
      CREATE TABLE recipe_ratings (
        recipe_id TEXT PRIMARY KEY NOT NULL,
        user_liked INTEGER,
        partner_verdict TEXT NOT NULL CHECK (partner_verdict IN ('oui', 'non', 'a_tester')),
        note TEXT,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE week_plans (
        start_date TEXT PRIMARY KEY NOT NULL,
        plan_json TEXT NOT NULL,
        options_json TEXT NOT NULL,
        generated_at TEXT NOT NULL
      );
      CREATE TABLE shopping_checks (
        start_date TEXT NOT NULL,
        ingredient_id TEXT NOT NULL,
        PRIMARY KEY (start_date, ingredient_id)
      );
    `,
  },
  {
    // La présence de la compagne se saisit repas par repas ; suivi du poids et de l'activité.
    version: 2,
    sql: `
      CREATE TABLE partner_meals (
        date TEXT NOT NULL,
        slot TEXT NOT NULL CHECK (slot IN ('dejeuner', 'diner')),
        PRIMARY KEY (date, slot)
      );
      -- Ancienne saisie par jour : dîner, plus le déjeuner le samedi.
      INSERT INTO partner_meals (date, slot) SELECT date, 'diner' FROM partner_dates;
      INSERT INTO partner_meals (date, slot) SELECT date, 'dejeuner' FROM partner_dates WHERE strftime('%w', date) = '6';
      DROP TABLE partner_dates;
      CREATE TABLE weigh_ins (date TEXT PRIMARY KEY NOT NULL, kg REAL NOT NULL);
      CREATE TABLE daily_health (
        date TEXT PRIMARY KEY NOT NULL,
        steps INTEGER,
        expenditure_kcal INTEGER,
        sleep_minutes INTEGER,
        source TEXT NOT NULL CHECK (source IN ('health_connect', 'manual'))
      );
    `,
  },
];

export const LATEST_VERSION = MIGRATIONS.at(-1)?.version ?? 0;

export function currentVersion(db: SqlDriver): number {
  return db.all<{ user_version: number }>('PRAGMA user_version')[0]?.user_version ?? 0;
}

export function migrate(db: SqlDriver): number {
  const from = currentVersion(db);
  for (const m of MIGRATIONS) {
    if (m.version <= from) continue;
    transaction(db, () => {
      db.exec(m.sql);
      db.exec(`PRAGMA user_version = ${m.version}`);
    });
  }
  return currentVersion(db);
}
