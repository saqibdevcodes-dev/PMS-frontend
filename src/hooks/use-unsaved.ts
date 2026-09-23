import { useEffect, useId } from 'react';
import { useBlocker } from 'react-router-dom';
import { create } from 'zustand';
const drafts = create<{
  items: Record<string, boolean>;
  set: (id: string, dirty: boolean) => void;
  clear: () => void;
}>((set) => ({
  items: {},
  set: (id, dirty) =>
    set((s) => {
      const items = { ...s.items };
      if (dirty) items[id] = true;
      else delete items[id];
      return { items };
    }),
  clear: () => set({ items: {} }),
}));
export function confirmDiscard() {
  if (!Object.keys(drafts.getState().items).length) return true;
  if (
    !window.confirm(
      'Leave these unsaved changes? A reserved property stays on hold until it is cancelled or expires.',
    )
  )
    return false;
  drafts.getState().clear();
  return true;
}
export function useUnsavedChanges(dirty: boolean) {
  const id = useId();
  useEffect(() => {
    drafts.getState().set(id, dirty);
    return () => drafts.getState().set(id, false);
  }, [id, dirty]);
}
export function useNavigationGuard() {
  const dirty = drafts((s) => Object.keys(s.items).length > 0);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && currentLocation.pathname !== nextLocation.pathname,
  );
  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (confirmDiscard()) blocker.proceed();
      else blocker.reset();
    }
  }, [blocker]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
}
