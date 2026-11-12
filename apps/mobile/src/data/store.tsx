import { createRepositories, migrate, type Repositories, type SqlDriver } from '@olympe/db';
import { openDatabaseAsync, openDatabaseSync } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { Splash } from '../components/Splash';

interface DataContextValue {
  db: SqlDriver;
  repos: Repositories;
  /** Incrémenté après chaque écriture : sert de dépendance aux lectures synchrones. */
  version: number;
  refresh: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);
const DB_NAME = 'olympe.db';

function openDriver(): { db: SqlDriver; repos: Repositories } {
  const sqlite = openDatabaseSync(DB_NAME);
  const db: SqlDriver = {
    exec: (sql) => sqlite.execSync(sql),
    run: (sql, params = []) => {
      sqlite.runSync(sql, params);
    },
    all: <T,>(sql: string, params: (string | number | null)[] = []) => sqlite.getAllSync<T>(sql, params),
  };
  migrate(db);
  return { db, repos: createRepositories(db) };
}

export function DataProvider({ children }: { children: ReactNode }) {
  // Téléphone : ouverture synchrone immédiate.
  // Web (aperçu navigateur) : le worker SQLite doit d'abord démarrer, sinon les appels synchrones expirent.
  const [state, setState] = useState(() => (Platform.OS === 'web' ? null : openDriver()));
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (state) return;
    let cancelled = false;
    openDatabaseAsync(DB_NAME).then(() => {
      if (!cancelled) setState(openDriver());
    });
    return () => { cancelled = true; };
  }, [state]);

  if (!state) return <Splash />;
  return <DataContext.Provider value={{ ...state, version, refresh }}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const value = useContext(DataContext);
  if (!value) throw new Error('useData doit être utilisé dans DataProvider');
  return value;
}
