import { createRequire } from 'node:module';
import type { DatabaseSync as DatabaseSyncType } from 'node:sqlite';
import type { SqlDriver, SqlParam } from '../src';

// Chargé à l'exécution : Vitest 2 ne sait pas résoudre `node:sqlite` à l'import.
const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as { DatabaseSync: typeof DatabaseSyncType };

/** Pilote de test : SQLite intégré à Node, même API synchrone qu'expo-sqlite. */
export function memoryDriver(): SqlDriver {
  const db = new DatabaseSync(':memory:');
  return {
    exec: (sql) => db.exec(sql),
    run: (sql, params: SqlParam[] = []) => { db.prepare(sql).run(...params); },
    all: <T,>(sql: string, params: SqlParam[] = []) => db.prepare(sql).all(...params) as T[],
  };
}
