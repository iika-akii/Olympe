export type SqlParam = string | number | null;

/**
 * Pilote SQLite minimal et synchrone. Implémenté par expo-sqlite dans l'app
 * (execSync / runSync / getAllSync) et par node:sqlite dans les tests.
 */
export interface SqlDriver {
  exec(sql: string): void;
  run(sql: string, params?: SqlParam[]): void;
  all<T>(sql: string, params?: SqlParam[]): T[];
}

export function transaction<T>(db: SqlDriver, fn: () => T): T {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}
