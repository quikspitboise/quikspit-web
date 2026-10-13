'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type UnsavedRegistry = {
  set: (id: string, dirty: boolean) => void;
  hasUnsaved: boolean;
  dirtyIds: ReadonlySet<string>;
};

const UnsavedContext = createContext<UnsavedRegistry | null>(null);

/**
 * Tracks which editors hold unsaved edits, so switching tabs or leaving the
 * page can warn first.
 */
export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const [dirtyIds, setDirtyIds] = useState<ReadonlySet<string>>(() => new Set());
  const hasUnsaved = dirtyIds.size > 0;

  const set = useCallback((id: string, dirty: boolean) => {
    setDirtyIds((current) => {
      if (current.has(id) === dirty) return current;
      const next = new Set(current);
      if (dirty) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!hasUnsaved) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasUnsaved]);

  const value = useMemo(() => ({ set, hasUnsaved, dirtyIds }), [set, hasUnsaved, dirtyIds]);
  return <UnsavedContext.Provider value={value}>{children}</UnsavedContext.Provider>;
}

export function useUnsavedChanges(id: string, dirty: boolean) {
  const registry = useContext(UnsavedContext);
  const set = registry?.set;
  useEffect(() => {
    set?.(id, dirty);
    return () => set?.(id, false);
  }, [set, id, dirty]);
}

export function useHasUnsavedChanges(id?: string) {
  const registry = useContext(UnsavedContext);
  return (id === undefined ? registry?.hasUnsaved : registry?.dirtyIds.has(id)) ?? false;
}
