import { useEffect, useId } from 'react';
import { useBlocker } from 'react-router-dom';
import { create } from 'zustand';
import { confirmAction } from '../components/ConfirmDialog';
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
export async function confirmDiscard() {
  if (!Object.keys(drafts.getState().items).length) return true;
  if (
    !(await confirmAction({
      title: 'Discard unsaved changes?',
      description:
        'Your changes have not been saved. Any reserved property stays on hold until it is cancelled or expires.',
    }))
  )
    return false;
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
      let current = true;
      void confirmDiscard().then((discard) => {
        if (current) {
          if (discard) blocker.proceed();
          else blocker.reset();
        }
      });
      return () => {
        current = false;
      };
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
