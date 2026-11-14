/**
 * Apparence courante. Le contexte porte le choix ; une copie au niveau du module sert aux styles lus
 * hors d'un composant (`fonts`, `radius`, `text`). Changer d'apparence remonte l'arbre (voir app/_layout.tsx),
 * donc ces lectures sont toujours à jour au moment du rendu.
 */
import * as SystemUI from 'expo-system-ui';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_LOOK, resolveLook, type Look, type LookId } from './looks';
import type { Direction, Theme, TypeScale } from './types';

let current: Look = resolveLook(DEFAULT_LOOK);

interface LookContextValue extends Look { setLook: (id: LookId) => void }
const LookContext = createContext<LookContextValue | null>(null);

/** `initial` : apparence enregistrée ; `onChange` : l'enregistre. */
export function LookProvider({ initial, onChange, children }: { initial: string | null; onChange: (id: LookId) => void; children: ReactNode }) {
  const [look, setState] = useState(() => resolveLook(initial));
  current = look;
  const setLook = useCallback((id: LookId) => {
    onChange(id);
    setState(resolveLook(id));
  }, [onChange]);
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(look.theme.bg).catch(() => undefined);
  }, [look]);
  const value = useMemo(() => ({ ...look, setLook }), [look, setLook]);
  return <LookContext.Provider value={value}>{children}</LookContext.Provider>;
}

function useLook(): Look {
  return useContext(LookContext) ?? current;
}

/** Les couleurs de l'apparence courante. */
export function useTheme(): Theme {
  return useLook().theme;
}

/** La direction artistique courante : polices, formes, images. */
export function useDirection(): Direction {
  return useLook().direction;
}

/** Identifiant de l'apparence courante et moyen d'en changer (Profil). */
export function useLookChoice(): { id: LookId; setLook: (id: LookId) => void } {
  const value = useContext(LookContext);
  return { id: value?.id ?? current.id, setLook: value?.setLook ?? (() => undefined) };
}

/** Familles de polices de la direction courante, lues au rendu. */
export const fonts = {
  get display() { return current.direction.families.display; },
  get text() { return current.direction.families.text; },
  get label() { return current.direction.families.label; },
};

/** Rayons de la direction courante, lus au rendu. */
export const radius = {
  get sm() { return current.direction.shape.sm; },
  get md() { return current.direction.shape.md; },
};

/** Styles de texte de la direction courante, pour les rares `Text` écrits à la main dans un écran. */
export const text: Pick<TypeScale, 'body' | 'strong' | 'small' | 'label' | 'number' | 'heading' | 'step'> = {
  get body() { return current.direction.type.body; },
  get strong() { return current.direction.type.strong; },
  get small() { return current.direction.type.small; },
  get label() { return current.direction.type.label; },
  get number() { return current.direction.type.number; },
  get heading() { return current.direction.type.heading; },
  get step() { return current.direction.type.step; },
};
